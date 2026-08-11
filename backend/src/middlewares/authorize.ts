/**
 * middlewares/authorize.ts
 * Middleware de control de acceso basado en roles (RBAC).
 * Se usa después de `authenticate`: verifica que req.user.role
 * esté dentro de los roles permitidos para la ruta.
 */
import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";

/**
 * Crea un middleware que permite solo a los roles indicados.
 * @param roles Lista de roles autorizados (ej: authorize(Role.ADMIN, Role.ANALYST)).
 */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(Object.assign(new Error("No autorizado"), { statusCode: 401 }));
    }
    if (!roles.includes(req.user.role as Role)) {
      return next(
        Object.assign(new Error("Permisos insuficientes para esta acción"), {
          statusCode: 403,
        })
      );
    }
    next();
  };
}
