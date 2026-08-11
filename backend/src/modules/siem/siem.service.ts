/**
 * siem.service.ts
 * Motor SIEM (Security Information and Event Management):
 * - Ingesta de eventos normalizados desde cualquier fuente.
 * - Resolución automática del activo según su IP.
 * - Correlación de eventos contra reglas activas para generar alertas.
 * - Publicación en tiempo real por WebSocket (eventos y alertas).
 */
import { AlertStatus, CorrelationRule, Event, EventSource, Severity } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import { pushAlert, pushEvent } from "../../websocket";

/** Estructura de un evento entrante ya validado por Zod. */
export interface NormalizedEventInput {
  source?: EventSource;
  sourceLabel?: string;
  type: string;
  severity?: Severity;
  title?: string;
  description?: string;
  sourceIp?: string;
  destinationIp?: string;
  port?: number;
  protocol?: string;
  assetId?: string;
  raw?: unknown;
  receivedAt?: string;
}

/**
 * Ingiere un evento: lo persiste, lo publica por WebSocket y
 * ejecuta la correlación para detectar posibles alertas.
 */
export async function ingestEvent(input: NormalizedEventInput): Promise<Event> {
  // Si no viene assetId, se intenta asociar por IP del activo en catálogo.
  const assetId = input.assetId ?? (await resolveAssetByIp(input.sourceIp ?? input.destinationIp));

  const event = await prisma.event.create({
    data: {
      source: input.source ?? EventSource.SYSTEM,
      sourceLabel: input.sourceLabel,
      type: input.type,
      severity: input.severity ?? Severity.INFO,
      title: input.title ?? `Evento ${input.type}`,
      description: input.description,
      sourceIp: input.sourceIp,
      destinationIp: input.destinationIp,
      port: input.port,
      protocol: input.protocol,
      assetId,
      raw: (input.raw as object) ?? undefined,
      receivedAt: input.receivedAt ? new Date(input.receivedAt) : new Date(),
    },
  });

  pushEvent(event);
  await correlate(event);
  return event;
}

/** Busca un activo activo del catálogo por su IP. */
async function resolveAssetByIp(ip?: string): Promise<string | undefined> {
  if (!ip) return undefined;
  const asset = await prisma.asset.findFirst({
    where: { ipAddress: ip, status: "ACTIVE" },
    select: { id: true },
  });
  return asset?.id;
}

// ---------- Correlación ----------

/** Una condición individual de una regla de correlación. */
interface Condition {
  field: string;
  op: "eq" | "ne" | "contains" | "gte" | "lte";
  value: string | number | boolean;
}

/** Estructura de la condición de una regla (grupo de condiciones + contador). */
interface RuleCondition {
  op: "and" | "or";
  conditions: Condition[];
  groupBy?: string;
  minCount?: number;
  windowMs?: number;
}

/** Comprueba si un evento cumple la condición de la regla (AND/OR). */
function matchesCondition(rule: RuleCondition, event: Event): boolean {
  const apply = (c: Condition): boolean => {
    const actual = (event as unknown as Record<string, unknown>)[c.field];
    switch (c.op) {
      case "eq":
        return String(actual) === String(c.value);
      case "ne":
        return String(actual) !== String(c.value);
      case "contains":
        return String(actual ?? "").toLowerCase().includes(String(c.value).toLowerCase());
      case "gte":
        return Number(actual) >= Number(c.value);
      case "lte":
        return Number(actual) <= Number(c.value);
      default:
        return false;
    }
  };

  const results = rule.conditions.map(apply);
  return rule.op === "and" ? results.every(Boolean) : results.some(Boolean);
}

/**
 * Evalúa el evento contra todas las reglas activas.
 * Si la regla exige un mínimo de eventos en una ventana (minCount),
 * se cuenta cuántos eventos similares ocurrieron en los últimos windowMs.
 * Cada coincidencia genera una alerta publicada por WebSocket.
 */
async function correlate(event: Event): Promise<void> {
  const rules = await prisma.correlationRule.findMany({
    where: { status: "ACTIVE" },
  });

  for (const rule of rules) {
    const condition = rule.condition as unknown as RuleCondition;
    if (!condition || !Array.isArray(condition.conditions)) continue;

    if (!matchesCondition(condition, event)) continue;

    let count = 1;
    if (condition.minCount && condition.minCount > 1) {
      const groupField = condition.groupBy && event[condition.groupBy as keyof Event];
      count = await countEventsInWindow(rule, groupField as string);
      if (count < condition.minCount) continue;
    }

    const alert = await prisma.alert.create({
      data: {
        title: `Alerta: ${rule.name}`,
        description: `La regla "${rule.name}" coincidió con el evento ${event.type}${count > 1 ? ` (${count} eventos)` : ""}`,
        severity: rule.severity,
        status: AlertStatus.NEW,
        source: event.source,
        sourceLabel: rule.name,
        assetId: event.assetId,
        eventId: event.id,
      },
      include: { asset: { select: { id: true, name: true, ipAddress: true } }, event: true },
    });

    pushAlert(alert);
    logger.info(`[siem] Alerta generada por regla "${rule.name}" (evento ${event.id})`);
  }
}

/** Cuenta eventos similares (mismo valor de groupBy) dentro de la ventana temporal. */
async function countEventsInWindow(rule: CorrelationRule, groupValue: string | undefined): Promise<number> {
  const windowMs = (rule.condition as unknown as RuleCondition)?.windowMs ?? rule.windowMs ?? env.correlationWindowMs;
  const since = new Date(Date.now() - windowMs);

  const where: Record<string, unknown> = {
    createdAt: { gte: since },
  };
  if (groupValue !== undefined) {
    where[String((rule.condition as unknown as RuleCondition).groupBy)] = groupValue;
  }

  return prisma.event.count({ where: where as never });
}
