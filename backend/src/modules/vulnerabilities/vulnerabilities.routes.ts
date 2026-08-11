/**
 * vulnerabilities.routes.ts
 * Definición de rutas del módulo de vulnerabilidades.
 */
import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { statusSchema } from "./vulnerabilities.validator";
import {
  listVulnerabilitiesHandler,
  getVulnerabilityHandler,
  updateStatusHandler,
} from "./vulnerabilities.controller";

const router = Router();

// Todas las rutas requieren autenticación.
router.use(authenticate);

router.get("/", listVulnerabilitiesHandler);
router.get("/:id", getVulnerabilityHandler);
router.patch("/:id/status", validate(statusSchema), updateStatusHandler);

export default router;
