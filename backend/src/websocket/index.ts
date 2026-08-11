/**
 * websocket/index.ts
 * Servidor WebSocket para notificaciones en tiempo real.
 * - Autentica cada conexión con el token JWT (parámetro ?token=).
 * - Expone funciones para transmitir eventos y alertas a todos los clientes.
 */
import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "../lib/logger";

let wss: WebSocketServer | null = null;

/** Inicializa el WebSocketServer sobre el servidor HTTP dado, en la ruta /ws. */
export function initWebSocket(server: Server): void {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket, req) => {
    // El token viaja como query param: ws://host/ws?token=...
    const url = new URL(req.url || "/ws", "http://localhost");
    const token = url.searchParams.get("token");

    if (!token) {
      socket.close(1008, "Token requerido");
      return;
    }

    try {
      jwt.verify(token, env.jwtSecret);
    } catch {
      socket.close(1008, "Token inválido");
      return;
    }

    logger.info("[ws] Cliente conectado");
    socket.send(JSON.stringify({ type: "connected" }));

    socket.on("close", () => logger.info("[ws] Cliente desconectado"));
  });
}

/** Envía un mensaje JSON a todos los clientes conectados. */
export function broadcast(payload: unknown): void {
  if (!wss) return;
  const data = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

/** Publica un evento SIEM en tiempo real. */
export function pushEvent(event: unknown): void {
  broadcast({ type: "event", data: event });
}

/** Publica una alerta SIEM en tiempo real. */
export function pushAlert(alert: unknown): void {
  broadcast({ type: "alert", data: alert });
}
