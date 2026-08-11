/**
 * assets.controller.ts
 * Controladores HTTP del módulo de activos.
 * Parsean parámetros, delegan en el servicio y registran auditoría.
 */
import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { audit } from "../../lib/audit";
import { assetQuerySchema } from "./assets.validator";
import { listAssets, getAssetById, createAsset, updateAsset, deactivateAsset } from "./assets.service";

/** GET /api/assets - Lista activos con filtros (search, status, type, paginación). */
export const listAssetsHandler = asyncHandler(async (req: Request, res: Response) => {
  const q = assetQuerySchema.parse(req.query);
  res.json(await listAssets(q));
});

/** GET /api/assets/:id - Detalle de un activo con sus relaciones. */
export const getAssetHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getAssetById(req.params.id));
});

/** POST /api/assets - Crea un activo nuevo (ADMIN/ANALYST). */
export const createAssetHandler = asyncHandler(async (req: Request, res: Response) => {
  const asset = await createAsset(req.body, req.user!.id);
  await audit({
    userId: req.user!.id,
    action: "ASSET_CREATE",
    resource: "asset",
    resourceId: asset.id,
    result: "success",
  });
  res.status(201).json(asset);
});

/** PATCH /api/assets/:id - Actualiza un activo (ADMIN/ANALYST). */
export const updateAssetHandler = asyncHandler(async (req: Request, res: Response) => {
  const asset = await updateAsset(req.params.id, req.body);
  await audit({
    userId: req.user!.id,
    action: "ASSET_UPDATE",
    resource: "asset",
    resourceId: asset.id,
    result: "success",
  });
  res.json(asset);
});

/** DELETE /api/assets/:id - Da de baja un activo (ADMIN/ANALYST). */
export const deactivateAssetHandler = asyncHandler(async (req: Request, res: Response) => {
  const asset = await deactivateAsset(req.params.id);
  await audit({
    userId: req.user!.id,
    action: "ASSET_DEACTIVATE",
    resource: "asset",
    resourceId: asset.id,
    result: "success",
  });
  res.json({ id: asset.id, status: asset.status });
});
