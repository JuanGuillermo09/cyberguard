/**
 * middlewares/error.ts
 * Manejo centralizado de errores:
 * - notFound: responde 404 para rutas inexistentes.
 * - errorHandler: normaliza cualquier error a una respuesta JSON coherente.
 */
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger";

/** Responde 404 para recursos no encontrados. */
export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "Recurso no encontrado" });
}

/**
 * Manejador de errores global. Detalles:
 * - Los errores Zod se responden como validación (400).
 * - Los errores con statusCode (ApiError, middleware) conservan su código.
 * - Los errores 500+ se registran y se ocultan al cliente.
 */
export function errorHandler(
  err: Error & { statusCode?: number; details?: unknown },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    return void res.status(400).json({ error: "Datos de entrada inválidos", details: err.flatten() });
  }

  const status = err.statusCode ?? 500;
  if (status >= 500) {
    logger.error(err);
  }

  res.status(status).json({
    error: status >= 500 ? "Error interno del servidor" : err.message,
    details: err.details,
  });
}
