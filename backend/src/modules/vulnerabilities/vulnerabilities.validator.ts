/**
 * vulnerabilities.validator.ts
 * Esquemas de validación (Zod) para el módulo de vulnerabilidades.
 */
import { z } from "zod";
import { VulnerabilityStatus } from "@prisma/client";

/** Filtros del listado de vulnerabilidades (todos opcionales). */
export const vulnQuerySchema = z.object({
  severity: z.string().optional(),
  assetId: z.string().uuid().optional(),
  service: z.string().optional(),
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  cveId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

/** Esquema del cambio de estado de una vulnerabilidad. */
export const statusSchema = z.object({
  status: z.nativeEnum(VulnerabilityStatus),
  comment: z.string().max(500).optional(),
});
