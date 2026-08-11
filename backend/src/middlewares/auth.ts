/**
 * middlewares/auth.ts
 * Middleware de autenticación:
 * valida el token JWT (Authorization: Bearer ...), carga el usuario en la
 * base de datos y lo adjunta a req.user para los controladores siguientes.
 */
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";

/** Usuario autenticado adjunto a la petición. */
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Extiende la interfaz Request de Express con req.user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Verifica la cabecera Authorization y carga el usuario.
 * Si el token no es válido o el usuario está inactivo -> 401.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return next(Object.assign(new Error("No autorizado"), { statusCode: 401 }));
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.active) {
      return next(Object.assign(new Error("No autorizado"), { statusCode: 401 }));
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    next();
  } catch {
    next(Object.assign(new Error("Token inválido o expirado"), { statusCode: 401 }));
  }
}
