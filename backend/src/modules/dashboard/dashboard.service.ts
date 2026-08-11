/**
 * dashboard.service.ts
 * Lógica de negocio del panel de control:
 * métricas resumidas y score de seguridad.
 */
import { AlertStatus, Severity } from "@prisma/client";
import { prisma } from "../../lib/prisma";

/** Orden de severidad para la presentación de métricas. */
const SEVERITY_ORDER: Severity[] = [
  Severity.CRITICAL,
  Severity.HIGH,
  Severity.MEDIUM,
  Severity.LOW,
  Severity.INFO,
];

/** Crea un mapa de severidades inicializado a 0. */
function emptySeverityMap(): Record<Severity, number> {
  return {
    [Severity.CRITICAL]: 0,
    [Severity.HIGH]: 0,
    [Severity.MEDIUM]: 0,
    [Severity.LOW]: 0,
    [Severity.INFO]: 0,
  };
}

/** Cuenta elementos (vulnerabilidades o alertas) agrupados por severidad. */
async function severityCounts(model: "vulnerability" | "alert"): Promise<Record<Severity, number>> {
  const result = emptySeverityMap();
  if (model === "vulnerability") {
    const rows = await prisma.vulnerability.groupBy({ by: ["severity"], _count: { _all: true } });
    for (const row of rows) result[row.severity] = row._count._all;
  } else {
    const rows = await prisma.alert.groupBy({ by: ["severity"], _count: { _all: true } });
    for (const row of rows) result[row.severity] = row._count._all;
  }
  return result;
}

/**
 * Calcula el score de seguridad (0-100) a partir de:
 * alertas activas y vulnerabilidades ponderadas por severidad.
 */
function computeSecurityScore(
  vulnBySeverity: Record<Severity, number>,
  activeAlerts: number
): number {
  const weights: Record<Severity, number> = {
    [Severity.CRITICAL]: 10,
    [Severity.HIGH]: 5,
    [Severity.MEDIUM]: 2,
    [Severity.LOW]: 1,
    [Severity.INFO]: 0,
  };
  let penalty = activeAlerts * 2;
  for (const sev of SEVERITY_ORDER) {
    penalty += (vulnBySeverity[sev] ?? 0) * weights[sev];
  }
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

/** Devuelve el resumen de métricas del panel de control. */
export async function getDashboardSummary() {
  const now = new Date();

  const [
    assets,
    activeAssets,
    vulnerabilities,
    vulnBySeverity,
    alerts,
    activeAlerts,
    alertsBySeverity,
    incidents,
    openIncidents,
    events,
    recentEvents,
    scans,
    last24hEvents,
    exposedPorts,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { status: "ACTIVE" } }),
    prisma.vulnerability.count(),
    severityCounts("vulnerability"),
    prisma.alert.count(),
    prisma.alert.count({ where: { status: { in: [AlertStatus.NEW, AlertStatus.IN_PROGRESS] } } }),
    severityCounts("alert"),
    prisma.incident.count(),
    prisma.incident.count({ where: { status: { notIn: ["RESOLVED", "CLOSED"] } } }),
    prisma.event.count(),
    prisma.event.findMany({ orderBy: { receivedAt: "desc" }, take: 10 }),
    prisma.scan.count(),
    prisma.event.count({
      where: { receivedAt: { gte: new Date(now.getTime() - 24 * 3600 * 1000) } },
    }),
    prisma.scanResult.findMany({
      distinct: ["port"],
      select: { port: true, service: true },
      orderBy: { port: "asc" },
      take: 50,
    }),
  ]);

  return {
    assets,
    activeAssets,
    vulnerabilities,
    vulnerabilitiesBySeverity: vulnBySeverity,
    alerts,
    activeAlerts,
    alertsBySeverity,
    incidents,
    openIncidents,
    events,
    eventsLast24h: last24hEvents,
    scans,
    exposedPorts,
    recentEvents,
    securityScore: computeSecurityScore(vulnBySeverity, activeAlerts),
    updatedAt: now,
  };
}
