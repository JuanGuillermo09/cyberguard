/**
 * alerts.controller.ts
 * Controladores HTTP del módulo de alertas.
 */
import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { audit } from "../../lib/audit";
import { alertQuerySchema } from "./alerts.validator";
import { listAlerts, getAlertById, updateAlertStatus } from "./alerts.service";

/** GET /api/alerts - Lista alertas con filtros y paginación. */
export const listAlertsHandler = asyncHandler(async (req: Request, res: Response) => {
  const q = alertQuerySchema.parse(req.query);
  res.json(await listAlerts(q));
});

/** GET /api/alerts/:id - Detalle de una alerta. */
export const getAlertHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getAlertById(req.params.id));
});

/** PATCH /api/alerts/:id/status - Cambia el estado de una alerta (ADMIN/ANALYST). */
export const updateStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const updated = await updateAlertStatus(
    req.params.id,
    req.body.status,
    req.user!.id,
    req.body.action,
    req.body.comment
  );

  await audit({
    userId: req.user!.id,
    action: "ALERT_STATUS",
    resource: "alert",
    resourceId: req.params.id,
    details: { status: req.body.status, comment: req.body.comment },
    result: "success",
  });
  res.json(updated);
});
