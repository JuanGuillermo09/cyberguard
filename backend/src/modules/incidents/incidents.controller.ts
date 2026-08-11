/**
 * incidents.controller.ts
 * Controladores HTTP del módulo de incidentes.
 */
import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { audit } from "../../lib/audit";
import {
  listIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
  linkEvidence,
} from "./incidents.service";

/** GET /api/incidents - Lista incidentes con filtros y paginación. */
export const listIncidentsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { status, severity, assetId } = req.query;
  res.json(
    await listIncidents({
      status: status as string,
      severity: severity as string,
      assetId: assetId as string,
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 50,
    })
  );
});

/** GET /api/incidents/:id - Detalle de un incidente. */
export const getIncidentHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getIncidentById(req.params.id));
});

/** POST /api/incidents - Crea un incidente (ADMIN/ANALYST). */
export const createIncidentHandler = asyncHandler(async (req: Request, res: Response) => {
  const incident = await createIncident(req.body, req.user!.id);
  await audit({
    userId: req.user!.id,
    action: "INCIDENT_CREATE",
    resource: "incident",
    resourceId: incident.id,
    result: "success",
  });
  res.status(201).json(incident);
});

/** PATCH /api/incidents/:id/status - Cambia el estado de un incidente (ADMIN/ANALYST). */
export const updateStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const updated = await updateIncidentStatus(
    req.params.id,
    req.body.status,
    req.user!.id,
    req.body.action,
    req.body.comment
  );

  await audit({
    userId: req.user!.id,
    action: "INCIDENT_STATUS",
    resource: "incident",
    resourceId: req.params.id,
    details: { status: req.body.status },
    result: "success",
  });
  res.json(updated);
});

/** POST /api/incidents/:id/link - Asocia eventos/alertas como evidencia (ADMIN/ANALYST). */
export const linkHandler = asyncHandler(async (req: Request, res: Response) => {
  const updated = await linkEvidence(req.params.id, req.body.eventIds, req.body.alertIds);

  await audit({
    userId: req.user!.id,
    action: "INCIDENT_LINK",
    resource: "incident",
    resourceId: req.params.id,
    details: req.body,
    result: "success",
  });
  res.json(updated);
});
