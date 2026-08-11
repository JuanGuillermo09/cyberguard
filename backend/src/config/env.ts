/**
 * config/env.ts
 * Carga y centraliza las variables de entorno.
 * Los valores secretos (JWT_SECRET, DATABASE_URL, API_KEY) NO deben
 * estar en el código fuente: se leen desde backend/node-api/.env
 * (véase .env.example para la lista completa).
 */
import dotenv from "dotenv";
import path from "path";

// Carga el .env situado junto al paquete (Prisma también lo usa allí).
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Variables imprescindibles para arrancar.
const required = ["DATABASE_URL", "JWT_SECRET"];

/** Lee una variable de entorno con valor por defecto opcional. */
function get(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value !== undefined && value !== "") return value;
  if (fallback !== undefined) return fallback;
  return "";
}

/** Configuración centralizada accesible desde toda la aplicación. */
export const env = {
  nodeEnv: get("NODE_ENV", "development"),
  port: Number(get("PORT", "3000")),
  databaseUrl: get("DATABASE_URL"),
  jwtSecret: get("JWT_SECRET"),
  jwtExpiresIn: get("JWT_EXPIRES_IN", "8h"),
  bcryptRounds: Number(get("BCRYPT_ROUNDS", "10")),
  corsOrigin: get("CORS_ORIGIN", "http://localhost:4200").split(","),
  apiKey: get("API_KEY", ""),
  scannerPortRange: get("SCANNER_PORT_RANGE", "1-1000"),
  scannerTimeoutMs: Number(get("SCANNER_TIMEOUT_MS", "1500")),
  scannerMaxThreads: Number(get("SCANNER_MAX_THREADS", "50")),
  nvdApiUrl: get("NVD_API_URL", "https://services.nvd.nist.gov/rest/json/cves/2.0"),
  nvdApiKey: get("NVD_API_KEY", ""),
  correlationWindowMs: Number(get("SIEM_CORRELATION_WINDOW_MS", "60000")),
};

// Aviso si faltan variables críticas al arrancar.
for (const name of required) {
  if (!process.env[name]) {
    console.warn(`[config] Falta variable de entorno: ${name} (copia .env.example a .env)`);
  }
}
