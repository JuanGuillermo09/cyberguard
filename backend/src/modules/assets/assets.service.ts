/**
 * assets.service.ts
 * Lógica de negocio del módulo de activos: listado con filtros,
 * consulta por id y operaciones de alta/baja sobre el catálogo de activos.
 */
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../lib/asyncHandler";

/** Datos del listado: elementos paginados y total de registros. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Filtros aplicables al listado de activos. */
export interface AssetFilters {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

/** Lista activos con filtros opcionales y paginación. */
export async function listAssets(filters: AssetFilters): Promise<Paginated<unknown>> {
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = Math.min(filters.pageSize ?? 50, 100);
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { ipAddress: { contains: filters.search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.asset.findMany({
      where: where as never,
      include: { _count: { select: { scans: true, vulnerabilities: true, events: true } } },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip,
    }),
    prisma.asset.count({ where: where as never }),
  ]);

  return { items, total, page, pageSize };
}

/** Devuelve un activo con sus relaciones (escaneos, vulnerabilidades, eventos...). */
export async function getAssetById(id: string) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      scans: { orderBy: { createdAt: "desc" }, take: 20 },
      vulnerabilities: { orderBy: { detectedAt: "desc" }, take: 20 },
      events: { orderBy: { receivedAt: "desc" }, take: 20 },
      alerts: { orderBy: { createdAt: "desc" }, take: 20 },
      incidents: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!asset) throw new ApiError(404, "Activo no encontrado");
  return asset;
}

/** Crea un activo nuevo. El autor queda registrado para auditoría. */
export async function createAsset(input: unknown, createdById: string) {
  return prisma.asset.create({ data: { ...(input as object), createdById } as never });
}

/** Verifica que un activo exista; lanza 404 si no. */
export async function ensureAssetExists(id: string) {
  const exists = await prisma.asset.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, "Activo no encontrado");
  return exists;
}

/** Actualiza los datos de un activo. */
export async function updateAsset(id: string, input: unknown) {
  await ensureAssetExists(id);
  return prisma.asset.update({ where: { id }, data: input as object as never });
}

/** Da de baja (lógicamente) un activo: se marca como INACTIVO. */
export async function deactivateAsset(id: string) {
  await ensureAssetExists(id);
  return prisma.asset.update({ where: { id }, data: { status: "INACTIVE" } });
}
