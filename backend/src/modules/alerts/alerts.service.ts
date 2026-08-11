/**
 * alerts.service.ts
 * Lógica de negocio del módulo de alertas:
 * listado con filtros, detalle y gestión del estado (con historial de acciones).
 */
import { AlertStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../lib/asyncHandler";

/** Filtros del listado de alertas. */
export interface AlertFilters {
  severity?: string;
  status?: string;
  source?: string;
  assetId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

/** Lista alertas con filtros, paginación y relaciones ligeras. */
export async function listAlerts(filters: AlertFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (filters.severity) where.severity = filters.severity;
  if (filters.status) where.status = filters.status as AlertStatus;
  if (filters.source) where.source = filters.source;
  if (filters.assetId) where.assetId = filters.assetId;
  if (filters.from || filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(filters.to) } : {}),
    };
  }

  const [items, total] = await Promise.all([
    prisma.alert.findMany({
      where: where as never,
      include: {
        asset: { select: { id: true, name: true, ipAddress: true } },
        event: { select: { id: true, type: true, title: true } },
        vulnerability: { select: { id: true, cveId: true, title: true } },
        assignedTo: { select: { id: true, username: true } },
        actions: { orderBy: { createdAt: "desc" }, take: 5 },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip,
    }),
    prisma.alert.count({ where: where as never }),
  ]);

  return { items, total, page, pageSize };
}

/** Devuelve el detalle completo de una alerta. */
export async function getAlertById(id: string) {
  const alert = await prisma.alert.findUnique({
    where: { id },
    include: {
      asset: { select: { id: true, name: true, ipAddress: true } },
      event: true,
      vulnerability: true,
      assignedTo: { select: { id: true, username: true } },
      actions: { include: { user: { select: { id: true, username: true } } }, orderBy: { createdAt: "desc" } },
      incidents: { include: { incident: true } },
    },
  });
  if (!alert) throw new ApiError(404, "Alerta no encontrada");
  return alert;
}

/**
 * Cambia el estado de una alerta.
 * Se registra una AlertAction (historial) y la actualización en una transacción.
 */
export async function updateAlertStatus(
  id: string,
  status: AlertStatus,
  userId: string,
  action?: string,
  comment?: string
) {
  const alert = await prisma.alert.findUnique({ where: { id } });
  if (!alert) throw new ApiError(404, "Alerta no encontrada");

  const [, updated] = await prisma.$transaction([
    prisma.alertAction.create({
      data: {
        alertId: alert.id,
        userId,
        action: action ?? `Cambio de estado a ${status}`,
        comment,
      },
    }),
    prisma.alert.update({
      where: { id: alert.id },
      data: { status },
    }),
  ]);

  return updated;
}
