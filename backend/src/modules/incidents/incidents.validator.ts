/**
 * incidents.validator.ts
 * Esquemas de validación (Zod) para el módulo de incidentes.
 */
import { z } from "zod";
import { IncidentStatus, Severity } from "@prisma/client";

/** Esquema de creación de un incidente. */
export const incidentSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  severity: z.nativeEnum(Severity).default(Severity.MEDIUM),
  assetId: z.string().uuid().optional(),
});

/** Esquema del cambio de estado de un incidente. */
export const statusSchema = z.object({
  status: z.nativeEnum(IncidentStatus),
  action: z.string().max(200).optional(),
  comment: z.string().max(1000).optional(),
});

/** Esquema para asociar eventos y/o alertas a un incidente. */
export const linkSchema = z.object({
  eventIds: z.array(z.string().uuid()).optional(),
  alertIds: z.array(z.string().uuid()).optional(),
});
