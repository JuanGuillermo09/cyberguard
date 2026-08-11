/**
 * vulnerabilities.controller.ts
 * Controladores HTTP del módulo de vulnerabilidades.
 */
import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { audit } from "../../lib/audit";
import { vulnQuerySchema } from "./vulnerabilities.validator";
import { listVulnerabilities, getVulnerabilityById, updateVulnerabilityStatus } from "./vulnerabilities.service";

/** GET /api/vulnerabilities - Lista vulnerabilidades con filtros y paginación. */
export const listVulnerabilitiesHandler = asyncHandler(async (req: Request, res: Response) => {
  const q = vulnQuerySchema.parse(req.query);
  res.json(await listVulnerabilities(q));
});

/** GET /api/vulnerabilities/:id - Detalle de una vulnerabilidad. */
export const getVulnerabilityHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getVulnerabilityById(req.params.id));
});

/** PATCH /api/vulnerabilities/:id/status - Cambia el estado de la vulnerabilidad. */
export const updateStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const vuln = await updateVulnerabilityStatus(req.params.id, req.body.status);
  await audit({
    userId: req.user!.id,
    action: "VULNERABILITY_STATUS",
    resource: "vulnerability",
    resourceId: vuln.id,
    details: { status: req.body.status, comment: req.body.comment },
    result: "success",
  });
  res.json(vuln);
});
