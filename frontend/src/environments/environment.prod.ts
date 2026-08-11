/**
 * environment.prod.ts
 * Valores por defecto de producción (fallback). Al desplegar el frontend
 * como Static Site separado en Render, las URLs reales del backend se
 * definen en src/assets/config.json y se cargan en runtime (ConfigService).
 */
export const environment = {
  production: true,
  /** URL base de la API REST (se sobreescribe con assets/config.json). */
  apiUrl: "/api",
  /** URL del WebSocket (se sobreescribe con assets/config.json). */
  wsUrl: "",
};
