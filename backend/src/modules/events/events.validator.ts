/**
 * events.validator.ts
 * Esquemas de validación (Zod) para el módulo de eventos SIEM.
 */
import { z } from "zod";
import { EventSource, Severity } from "@prisma/client";

/** Esquema de ingesta de un evento desde cualquier fuente (IDS, scanner, SIEM...). */
export const ingestSchema = z.object({
  source: z.nativeEnum(EventSource).default(EventSource.SYSTEM),
  sourceLabel: z.string().max(100).optional(),
  type: z.string().min(1).max(100),
  severity: z.nativeEnum(Severity).default(Severity.INFO),
  title: z.string().max(300).optional(),
  description: z.string().max(2000).optional(),
  sourceIp: z.string().max(45).optional(),
  destinationIp: z.string().max(45).optional(),
  port: z.number().int().min(1).max(65535).optional(),
  protocol: z.string().max(20).optional(),
  assetId: z.string().uuid().optional(),
  receivedAt: z.string().datetime().optional(),
  raw: z.unknown().optional(),
});

/** Filtros del listado de eventos. */
export const eventQuerySchema = z.object({
  source: z.string().optional(),
  type: z.string().optional(),
  severity: z.string().optional(),
  assetId: z.string().uuid().optional(),
  sourceIp: z.string().optional(),
  destinationIp: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
