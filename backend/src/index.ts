/**
 * index.ts
 * Punto de entrada del servidor:
 * crea el servidor HTTP, inicializa el WebSocket y gestiona el apagado.
 */
import http from "http";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { initWebSocket } from "./websocket";

// Servidor HTTP sobre el que se montan Express y WebSocket.
const server = http.createServer(app);

// WebSocket en la misma instancia HTTP bajo /ws (tiempo real).
initWebSocket(server);

server.listen(env.port, () => {
  logger.info(`CyberGuard API escuchando en http://localhost:${env.port}`);
  logger.info(`WebSocket en ws://localhost:${env.port}/ws`);
});

/**
 * Apagado ordenado: cierra el servidor HTTP y desconecta la base de datos.
 * Se invoca ante SIGINT/SIGTERM (Ctrl+C, Docker stop, etc.).
 */
async function shutdown(): Promise<void> {
  logger.info("Apagando servidor...");
  server.close(async () => {
    const { prisma } = await import("./lib/prisma");
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
