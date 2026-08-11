/**
 * environment.ts
 * Configuración de entorno de desarrollo local:
 * la API y el WebSocket se sirven desde el backend local (puerto 3000).
 * En producción (environment.prod.ts) se usan rutas relativas porque
 * el mismo servidor Express sirve tanto la API como el frontend.
 */
export const environment = {
  production: false,
  /** URL base de la API REST. */
  apiUrl: "http://localhost:3000/api",
  /** URL del WebSocket de eventos en vivo. */
  wsUrl: "ws://localhost:3000/ws",
};
