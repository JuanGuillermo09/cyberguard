/**
 * events.service.ts
 * Lógica de negocio del módulo de eventos SIEM:
 * consulta con filtros y detalle por id. La ingesta vive en siem.service.
 */
import { EventSource, Severity } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../lib/asyncHandler";

/** Filtros del listado de eventos. */
export interface EventFilters {
  source?: string;
  type?: string;
  severity?: string;
  assetId?: string;
  sourceIp?: string;
  destinationIp?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

/** Lista eventos con filtros, paginación y orden por fecha de recepción. */
export async function listEvents(filters: EventFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (filters.source) where.source = filters.source as EventSource;
  if (filters.type) where.type = { contains: filters.type, mode: "insensitive" };
  if (filters.severity) where.severity = filters.severity as Severity;
  if (filters.assetId) where.assetId = filters.assetId;
  if (filters.sourceIp) where.sourceIp = { contains: filters.sourceIp };
  if (filters.destinationIp) where.destinationIp = { contains: filters.destinationIp };

  if (filters.from || filters.to) {
    where.receivedAt = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(filters.to) } : {}),
    };
  }

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where: where as never,
      include: { asset: { select: { id: true, name: true, ipAddress: true } } },
      orderBy: { receivedAt: "desc" },
      take: pageSize,
      skip,
    }),
    prisma.event.count({ where: where as never }),
  ]);

  return { items, total, page, pageSize };
}

/** Devuelve el detalle de un evento con sus alertas e incidentes asociados. */
export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      asset: { select: { id: true, name: true, ipAddress: true } },
      alerts: true,
      incidents: { include: { incident: true } },
    },
  });
  if (!event) throw new ApiError(404, "Evento no encontrado");
  return event;
}
