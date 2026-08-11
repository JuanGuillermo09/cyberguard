/**
 * alerts.validator.ts
 * Esquemas de validación (Zod) para el módulo de alertas.
 */
import { z } from "zod";
import { AlertStatus } from "@prisma/client";

/** Filtros del listado de alertas. */
export const alertQuerySchema = z.object({
  severity: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  assetId: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

/** Esquema del cambio de estado de una alerta (incluye acción y comentario). */
export const statusSchema = z.object({
  status: z.nativeEnum(AlertStatus),
  action: z.string().max(200).optional(),
  comment: z.string().max(1000).optional(),
});
