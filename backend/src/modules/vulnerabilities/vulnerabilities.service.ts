/**
 * vulnerabilities.service.ts
 * Lógica de negocio del módulo de vulnerabilidades:
 * consulta con filtros y cambio de estado de la gestión del ciclo de vida.
 */
import { Severity, VulnerabilityStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../lib/asyncHandler";

/** Filtros del listado de vulnerabilidades. */
export interface VulnFilters {
  severity?: string;
  assetId?: string;
  service?: string;
  status?: string;
  from?: string;
  to?: string;
  cveId?: string;
  page?: number;
  pageSize?: number;
}

/** Lista vulnerabilidades con filtros, paginación y orden por severidad. */
export async function listVulnerabilities(filters: VulnFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (filters.severity) where.severity = filters.severity as Severity;
  if (filters.assetId) where.assetId = filters.assetId;
  if (filters.service) where.service = { contains: filters.service, mode: "insensitive" };
  if (filters.status) where.status = filters.status as VulnerabilityStatus;
  if (filters.cveId) where.cveId = { contains: filters.cveId, mode: "insensitive" };
  if (filters.from || filters.to) {
    where.detectedAt = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(filters.to) } : {}),
    };
  }

  const [items, total] = await Promise.all([
    prisma.vulnerability.findMany({
      where: where as never,
      include: {
        asset: { select: { id: true, name: true, ipAddress: true } },
        scanResult: { select: { port: true, scanId: true } },
      },
      orderBy: [{ severity: "desc" }, { detectedAt: "desc" }],
      take: pageSize,
      skip,
    }),
    prisma.vulnerability.count({ where: where as never }),
  ]);

  return { items, total, page, pageSize };
}

/** Devuelve el detalle de una vulnerabilidad con sus relaciones. */
export async function getVulnerabilityById(id: string) {
  const vuln = await prisma.vulnerability.findUnique({
    where: { id },
    include: {
      asset: { select: { id: true, name: true, ipAddress: true } },
      scanResult: { include: { scan: true } },
      alerts: true,
    },
  });
  if (!vuln) throw new ApiError(404, "Vulnerabilidad no encontrada");
  return vuln;
}

/** Cambia el estado (OPEN/IN_PROGRESS/FIXED/FALSE_POSITIVE) de una vulnerabilidad. */
export async function updateVulnerabilityStatus(id: string, status: VulnerabilityStatus) {
  const exists = await prisma.vulnerability.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, "Vulnerabilidad no encontrada");

  return prisma.vulnerability.update({ where: { id }, data: { status } });
}
