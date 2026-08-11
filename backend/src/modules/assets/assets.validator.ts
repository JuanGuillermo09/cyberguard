/**
 * assets.validator.ts
 * Esquemas de validación (Zod) para el módulo de activos.
 */
import { z } from "zod";
import { AssetStatus, AssetType } from "@prisma/client";

/** Esquema de creación/actualización de un activo. */
export const assetSchema = z.object({
  name: z.string().min(1).max(200),
  ipAddress: z.string().min(1).max(45),
  type: z.nativeEnum(AssetType).optional(),
  os: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.nativeEnum(AssetStatus).optional(),
});

/** Esquema de los parámetros de filtrado/búsqueda del listado. */
export const assetQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(AssetStatus).optional(),
  type: z.nativeEnum(AssetType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
