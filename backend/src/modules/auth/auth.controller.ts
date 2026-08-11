/**
 * auth.controller.ts
 * Controladores HTTP del módulo de autenticación.
 * Cada controlador recibe la petición (req), prepara la respuesta (res) y
 * delega la lógica de negocio al servicio correspondiente.
 */
import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import { ApiError, asyncHandler } from "../../lib/asyncHandler";
import { audit } from "../../lib/audit";
import { login, register, getProfile } from "./auth.service";

/**
 * POST /api/auth/login
 * Autentica un usuario con sus credenciales y devuelve el token JWT.
 */
export const loginHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await login(req.body);
    await audit({
      userId: result.user.id,
      action: "LOGIN",
      resource: "auth",
      result: "success",
    });
    res.json(result);
  }
);

/**
 * POST /api/auth/register
 * Crea un nuevo usuario. Solo los administradores pueden registrar cuentas.
 */
export const registerHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (req.user!.role !== Role.ADMIN) {
      throw new ApiError(403, "Solo los administradores pueden registrar usuarios");
    }
    const user = await register(req.body);
    await audit({
      userId: req.user!.id,
      action: "USER_CREATE",
      resource: "user",
      resourceId: user.id,
      result: "success",
    });
    res.status(201).json(user);
  }
);

/**
 * GET /api/auth/me
 * Devuelve el perfil del usuario autenticado.
 */
export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await getProfile(req.user!.id);
  res.json(user);
});
