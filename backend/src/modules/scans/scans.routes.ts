/**
 * scans.routes.ts
 * Definición de rutas del módulo de escaneos.
 * Todo el módulo requiere rol ADMIN (lanzar escaneos).
 */
import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { scanSchema } from "./scans.validator";
import {
  listScansHandler,
  getScanHandler,
  createScanHandler,
  cancelScanHandler,
} from "./scans.controller";

const router = Router();

// Todo el módulo de escaneos: autenticación + rol ADMIN.
router.use(authenticate, authorize(Role.ADMIN));

router.get("/", listScansHandler);
router.get("/:id", getScanHandler);
router.post("/", validate(scanSchema), createScanHandler);
router.post("/:id/cancel", cancelScanHandler);

export default router;
