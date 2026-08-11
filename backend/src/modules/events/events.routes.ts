/**
 * events.routes.ts
 * Definición de rutas del módulo de eventos SIEM.
 * `/ingest` acepta token JWT o API key (componentes internos sin sesión).
 */
import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticate } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { env } from "../../config/env";
import { ingestSchema } from "./events.validator";
import { ingestEventHandler, listEventsHandler, getEventHandler } from "./events.controller";

const router = Router();

/**
 * Autenticación doble para la ingesta:
 * - Componentes internos (IDS, scanner, collector) usan la cabecera X-Api-Key.
 * - Usuarios de la plataforma usan el token JWT normal.
 */
const ingestAuth = (req: Request, _res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  if (env.apiKey && apiKey === env.apiKey) {
    return next();
  }
  authenticate(req, _res, next);
};

// La ingesta es el punto de entrada del pipeline SIEM (acceso mixto).
router.post("/ingest", ingestAuth, validate(ingestSchema), ingestEventHandler);

// Consultas: requieren autenticación con token.
router.get("/", authenticate, listEventsHandler);
router.get("/:id", authenticate, getEventHandler);

export default router;
