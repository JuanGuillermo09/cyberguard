/**
 * websocket.service.ts
 * Conexión en tiempo real con el backend (ws://localhost:3000/ws en local,
 * wss://<backend>.onrender.com/ws en producción vía assets/config.json).
 * Escucha eventos y alertas SIEM y los expone como signals para la UI.
 */
import { Injectable, signal } from "@angular/core";
import { AuthService } from "./auth.service";
import { ConfigService } from "./config.service";
import { SecurityEvent, Alert } from "../models";

@Injectable({ providedIn: "root" })
export class WebSocketService {
  private socket: WebSocket | null = null;

  /** Últimos eventos recibidos en vivo (máximo 50). */
  readonly liveEvents = signal<SecurityEvent[]>([]);

  /** Últimas alertas recibidas en vivo (máximo 50). */
  readonly liveAlerts = signal<Alert[]>([]);

  constructor(
    private auth: AuthService,
    private config: ConfigService
  ) {}

  /** Conecta al WebSocket autenticado con el token JWT (una única conexión). */
  connect(): void {
    if (this.socket || !this.auth.token()) return;

    const ws = new WebSocket(`${this.config.wsUrl}?token=${encodeURIComponent(this.auth.token()!)}`);

    // Distribuye los mensajes según su tipo: evento o alerta.
    ws.onmessage = (msg) => {
      try {
        const payload = JSON.parse(msg.data);
        if (payload.type === "event") {
          const ev = payload.data as SecurityEvent;
          this.liveEvents.update((list) => [ev, ...list].slice(0, 50));
        } else if (payload.type === "alert") {
          const al = payload.data as Alert;
          this.liveAlerts.update((list) => [al, ...list].slice(0, 50));
        }
      } catch {
        /* ignora mensajes no JSON */
      }
    };

    // Al cerrarse, se permite volver a conectar.
    ws.onclose = () => {
      this.socket = null;
    };

    this.socket = ws;
  }

  /** Cierra la conexión WebSocket. */
  disconnect(): void {
    this.socket?.close();
    this.socket = null;
  }
}
