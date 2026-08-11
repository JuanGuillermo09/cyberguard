/**
 * incidents.service.ts
 * Lógica de negocio del módulo de incidentes:
 * gestión del ciclo de vida (crear, consultar, cambiar estado, vincular evidencia).
 */
import { IncidentStatus, Severity } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../lib/asyncHandler";

/** Filtros del listado de incidentes. */
export interface IncidentFilters {
  status?: string;
  severity?: string;
  assetId?: string;
  page?: number;
  pageSize?: number;
}

/** Lista incidentes con filtros y paginación. */
export async function listIncidents(filters: IncidentFilters) {
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = Math.min(filters.pageSize ?? 50, 100);
  const skip = (page - 1) * pageSize;

  const where = {
    ...(filters.status ? { status: filters.status as IncidentStatus } : {}),
    ...(filters.severity ? { severity: filters.severity as Severity } : {}),
    ...(filters.assetId ? { assetId: filters.assetId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.incident.findMany({
      where,
      include: {
        asset: { select: { id: true, name: true, ipAddress: true } },
        createdBy: { select: { id: true, username: true } },
        _count: { select: { events: true, alerts: true } },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip,
    }),
    prisma.incident.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

/** Devuelve el detalle completo de un incidente. */
export async function getIncidentById(id: string) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      asset: { select: { id: true, name: true, ipAddress: true } },
      createdBy: { select: { id: true, username: true } },
      events: { include: { event: true } },
      alerts: { include: { alert: { include: { asset: true } } } },
      actions: { include: { user: { select: { id: true, username: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!incident) throw new ApiError(404, "Incidente no encontrado");
  return incident;
}

/** Crea un incidente nuevo. El autor queda registrado para auditoría. */
export async function createIncident(input: unknown, createdById: string) {
  return prisma.incident.create({ data: { ...(input as object), createdById } as never });
}

/**
 * Cambia el estado de un incidente.
 * Registra una IncidentsAction (historial) y la actualización en transacción.
 */
export async function updateIncidentStatus(
  id: string,
  status: IncidentStatus,
  userId: string,
  action?: string,
  comment?: string
) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new ApiError(404, "Incidente no encontrado");

  const [, updated] = await prisma.$transaction([
    prisma.incidentAction.create({
      data: {
        incidentId: incident.id,
        userId,
        action: action ?? `Cambio de estado a ${status}`,
        comment,
      },
    }),
    prisma.incident.update({
      where: { id: incident.id },
      data: { status },
    }),
  ]);

  return updated;
}

/**
 * Vincula eventos y/o alertas a un incidente (evidencia de la investigación).
 * Todo se hace dentro de una única transacción.
 */
export async function linkEvidence(id: string, eventIds?: string[], alertIds?: string[]) {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new ApiError(404, "Incidente no encontrado");

  await prisma.$transaction(async (tx) => {
    if (eventIds?.length) {
      for (const eventId of eventIds) {
        await tx.incidentEvent.create({ data: { incidentId: incident.id, eventId } });
      }
    }
    if (alertIds?.length) {
      for (const alertId of alertIds) {
        await tx.incidentAlert.create({ data: { incidentId: incident.id, alertId } });
      }
    }
  });

  return prisma.incident.findUnique({
    where: { id: incident.id },
    include: { events: true, alerts: true },
  });
}
