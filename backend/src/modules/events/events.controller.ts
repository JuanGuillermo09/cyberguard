/**
 * events.controller.ts
 * Controladores HTTP del módulo de eventos SIEM.
 * La ingesta delega en siem.service (normalización + correlación).
 */
import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { ingestEvent } from "../siem/siem.service";
import { eventQuerySchema } from "./events.validator";
import { listEvents, getEventById } from "./events.service";

/**
 * POST /api/events/ingest
 * Recibe un evento de cualquier fuente (IDS, scanner, collector...).
 * Se autentica con token JWT o con la cabecera X-Api-Key.
 */
export const ingestEventHandler = asyncHandler(async (req: Request, res: Response) => {
  const event = await ingestEvent(req.body);
  res.status(201).json(event);
});

/** GET /api/events - Lista eventos con filtros y paginación. */
export const listEventsHandler = asyncHandler(async (req: Request, res: Response) => {
  const q = eventQuerySchema.parse(req.query);
  res.json(await listEvents(q));
});

/** GET /api/events/:id - Detalle de un evento. */
export const getEventHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getEventById(req.params.id));
});
