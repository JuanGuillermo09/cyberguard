/**
 * dashboard.controller.ts
 * Controladores HTTP del panel de control.
 */
import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { getDashboardSummary } from "./dashboard.service";

/** GET /api/dashboard/summary - Métricas resumidas del panel. */
export const summaryHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getDashboardSummary());
});
