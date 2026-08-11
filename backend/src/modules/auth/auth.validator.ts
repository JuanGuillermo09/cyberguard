/**
 * auth.validator.ts
 * Esquemas de validación (Zod) para las peticiones del módulo de autenticación.
 * El middleware `validate` los aplica sobre el cuerpo de cada request.
 */
import { z } from "zod";
import { Role } from "@prisma/client";

/** Esquema del formulario de inicio de sesión. */
export const loginSchema = z.object({
  username: z.string().min(1, "El usuario es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

/** Esquema del registro de un nuevo usuario (solo administradores). */
export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  fullName: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
});
