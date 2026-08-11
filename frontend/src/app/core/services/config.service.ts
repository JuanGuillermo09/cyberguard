/**
 * config.service.ts
 * Configuración runtime del frontend: carga `assets/config.json` (solo en
 * producción) y sobreescribe la URL de la API y del WebSocket.
 * Así se puede apuntar a otro backend (p. ej. el de Render) sin recompilar.
 */
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

/** Estructura esperada en assets/config.json. */
export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
}

@Injectable({ providedIn: "root" })
export class ConfigService {
  // Valores base: los del entorno de compilación (local o producción).
  private config: AppConfig = {
    apiUrl: environment.apiUrl,
    wsUrl: environment.wsUrl,
  };

  /** URL base de la API REST. */
  get apiUrl(): string {
    return this.config.apiUrl;
  }

  /** URL del WebSocket de eventos en vivo. */
  get wsUrl(): string {
    return this.config.wsUrl;
  }

  /**
   * Carga assets/config.json si existe y combina los valores con la
   * configuración base. Se invoca desde APP_INITIALIZER antes del arranque.
   */
  async load(): Promise<void> {
    // En desarrollo local se usa environment.ts tal cual.
    if (!environment.production) return;

    try {
      const res = await fetch("assets/config.json");
      if (res.ok) {
        const data = (await res.json()) as Partial<AppConfig>;
        this.config = { ...this.config, ...data };
      }
    } catch {
      // Si no hay config.json se conservan los valores de environment.
    }
  }
}
