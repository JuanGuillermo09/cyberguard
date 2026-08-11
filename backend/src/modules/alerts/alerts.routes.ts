/**
 * alerts.routes.ts
 * Definición de rutas del módulo de alertas.
 * Todo el módulo requiere ADMIN o ANALYST.
 */
import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { statusSchema } from "./alerts.validator";
import { listAlertsHandler, getAlertHandler, updateStatusHandler } from "./alerts.controller";

const router = Router();

// Todo el módulo de alertas: autenticación + rol ADMIN o ANALYST.
router.use(authenticate, authorize(Role.ADMIN, Role.ANALYST));

router.get("/", listAlertsHandler);
router.get("/:id", getAlertHandler);
router.patch("/:id/status", validate(statusSchema), updateStatusHandler);

export default router;
