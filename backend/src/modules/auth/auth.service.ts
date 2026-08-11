/**
 * auth.service.ts
 * Lógica de negocio del módulo de autenticación:
 * registro de usuarios, validación de credenciales y generación de JWT.
 * Aquí NO hay código HTTP: solo reglas de negocio y acceso a datos (Prisma).
 */
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../lib/asyncHandler";

/** Datos necesarios para crear una cuenta de usuario. */
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: Role;
}

/** Credenciales de inicio de sesión. */
export interface LoginInput {
  username: string;
  password: string;
}

/** Genera un token JWT firmado con el id del usuario como sujeto (`sub`). */
function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

/**
 * Crea un usuario nuevo.
 * Valida que el usuario/correo no exista y almacena la contraseña con hash.
 */
export async function register(input: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username: input.username }, { email: input.email }],
    },
  });
  if (existing) {
    throw new ApiError(409, "El nombre de usuario o correo ya está en uso");
  }

  // La contraseña nunca se guarda en texto plano (RNF-002).
  const passwordHash = await bcrypt.hash(input.password, env.bcryptRounds);
  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: input.role ?? Role.USER,
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Valida credenciales y devuelve el token JWT + perfil del usuario.
 * No revela si el error es de usuario o contraseña (evita enumeración).
 */
export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { username: input.username },
  });
  if (!user || !user.active) {
    throw new ApiError(401, "Credenciales inválidas");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "Credenciales inválidas");
  }

  const token = signToken(user.id);
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  };
}

/** Devuelve el perfil público de un usuario por su id. */
export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
  if (!user) {
    throw new ApiError(404, "Usuario no encontrado");
  }
  return user;
}
