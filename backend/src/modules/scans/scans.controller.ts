/**
 * scans.controller.ts
 * Controladores HTTP del módulo de escaneos.
 * Validan el activo destino, delegan en el servicio y registran auditoría.
 */
import type { Request, Response } from "express";
import { ApiError, asyncHandler } from "../../lib/asyncHandler";
import { audit } from "../../lib/audit";
import { prisma } from "../../lib/prisma";
import { createScan, startScan, listScans, getScanById, cancelScan } from "./scans.service";

/** GET /api/scans - Lista escaneos con filtros y paginación. */
export const listScansHandler = asyncHandler(async (req: Request, res: Response) => {
  const { assetId, status } = req.query;
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 50;
  res.json(await listScans({ assetId: assetId as string, status: status as string, page, pageSize }));
});

/** GET /api/scans/:id - Detalle de un escaneo. */
export const getScanHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getScanById(req.params.id));
});

/**
 * POST /api/scans - Lanza un escaneo.
 * Verifica que el activo exista y esté activo, crea el registro,
 * escribe auditoría y ejecuta el escaneo de forma asíncrona.
 */
export const createScanHandler = asyncHandler(async (req: Request, res: Response) => {
  const asset = await prisma.asset.findUnique({ where: { id: req.body.assetId } });
  if (!asset) throw new ApiError(404, "Activo no encontrado");
  if (asset.status !== "ACTIVE") {
    throw new ApiError(400, "El activo debe estar activo para ser escaneado");
  }

  const scan = await createScan(req.body.assetId, req.user!.id, req.body.portRange);
  await audit({
    userId: req.user!.id,
    action: "SCAN_START",
    resource: "scan",
    resourceId: scan.id,
    details: { assetId: asset.id, ipAddress: asset.ipAddress },
    result: "success",
  });

  // Ejecutar de forma asíncrona sin bloquear la API (RNF-010).
  void startScan(scan.id);

  res.status(201).json(scan);
});

/** POST /api/scans/:id/cancel - Cancela un escaneo pendiente o en ejecución. */
export const cancelScanHandler = asyncHandler(async (req: Request, res: Response) => {
  const scan = await cancelScan(req.params.id);
  await audit({
    userId: req.user!.id,
    action: "SCAN_CANCEL",
    resource: "scan",
    resourceId: scan.id,
    result: "success",
  });
  res.json(scan);
});
