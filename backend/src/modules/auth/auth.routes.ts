/**
 * auth.routes.ts
 * Definición de rutas del módulo de autenticación.
 * Aquí NO hay lógica de negocio: solo se enlazan URL -> middleware -> controlador.
 */
import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { loginSchema, registerSchema } from "./auth.validator";
import { loginHandler, registerHandler, meHandler } from "./auth.controller";

const router = Router();

// Inicio de sesión (acceso público)
router.post("/login", validate(loginSchema), loginHandler);

// Registro de usuarios (requiere token y rol de administrador)
router.post("/register", authenticate, validate(registerSchema), registerHandler);

// Perfil del usuario autenticado
router.get("/me", authenticate, meHandler);

export default router;
