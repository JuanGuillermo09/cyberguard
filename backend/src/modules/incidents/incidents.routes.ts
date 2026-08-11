/**
 * incidents.routes.ts
 * Definición de rutas del módulo de incidentes.
 * Todo el módulo requiere ADMIN o ANALYST.
 */
import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { incidentSchema, statusSchema, linkSchema } from "./incidents.validator";
import {
  listIncidentsHandler,
  getIncidentHandler,
  createIncidentHandler,
  updateStatusHandler,
  linkHandler,
} from "./incidents.controller";

const router = Router();

// Todo el módulo de incidentes: autenticación + rol ADMIN o ANALYST.
router.use(authenticate, authorize(Role.ADMIN, Role.ANALYST));

router.get("/", listIncidentsHandler);
router.get("/:id", getIncidentHandler);

router.post("/", validate(incidentSchema), createIncidentHandler);
router.patch("/:id/status", validate(statusSchema), updateStatusHandler);
router.post("/:id/link", validate(linkSchema), linkHandler);

export default router;
