/**
 * scans.validator.ts
 * Esquemas de validación (Zod) para el módulo de escaneos.
 */
import { z } from "zod";

/**
 * Esquema para lanzar un escaneo.
 * `portRange` acepta listas separadas por comas y rangos: "80", "80,443", "1-1024".
 */
export const scanSchema = z.object({
  assetId: z.string().uuid(),
  portRange: z
    .string()
    .regex(/^(\d+(-\d+)?)(,\d+(-\d+)?)*$/, "Rango de puertos inválido")
    .optional(),
});
