/**
 * assets.routes.ts
 * Definición de rutas del módulo de activos.
 * Todo el módulo requiere rol ADMIN (gestión de infraestructura).
 */
import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { assetSchema } from "./assets.validator";
import {
  listAssetsHandler,
  getAssetHandler,
  createAssetHandler,
  updateAssetHandler,
  deactivateAssetHandler,
} from "./assets.controller";

const router = Router();

// Todo el módulo de activos: autenticación + rol ADMIN.
router.use(authenticate, authorize(Role.ADMIN));

router.get("/", listAssetsHandler);
router.get("/:id", getAssetHandler);
router.post("/", validate(assetSchema), createAssetHandler);
router.patch("/:id", validate(assetSchema.partial()), updateAssetHandler);
router.delete("/:id", deactivateAssetHandler);

export default router;
