/**
 * lib/asyncHandler.ts
 * Utilidades para controladores asíncronos:
 * - asyncHandler: envuelve handlers async para propagar errores a Express.
 * - ApiError: error con código HTTP que el errorHandler entiende.
 */
import type { NextFunction, Request, Response } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Envuelve un controlador asíncrono: si lanza una promesa rechazada,
 * la reenviá a Express (errorHandler) en lugar de romper el proceso.
 */
export const asyncHandler =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/** Error de negocio con código HTTP y detalles opcionales. */
export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
