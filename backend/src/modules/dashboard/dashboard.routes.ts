/**
 * dashboard.routes.ts
 * Definición de rutas del panel de control.
 */
import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { summaryHandler } from "./dashboard.controller";

const router = Router();

// La ruta requiere autenticación.
router.get("/summary", authenticate, summaryHandler);

export default router;
