/**
 * lib/prisma.ts
 * Instancia única del cliente Prisma compartida por toda la aplicación.
 * Se exporta para usarse en servicios y middlewares sin recrearla.
 */
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
