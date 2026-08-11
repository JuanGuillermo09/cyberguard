/**
 * middlewares/validate.ts
 * Middleware de validación de datos con Zod:
 * valida el cuerpo de la petición contra el esquema recibido y,
 * si es válido, reemplaza req.body por el dato ya tipado/normalizado.
 */
import type { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

/**
 * Crea un middleware que valida req.body contra `schema`.
 * Si falla responde 400 con el detalle de errores (RNF-003).
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        Object.assign(new Error("Datos de entrada inválidos"), {
          statusCode: 400,
          details: result.error.flatten(),
        })
      );
    }
    req.body = result.data;
    next();
  };
}
