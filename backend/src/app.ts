/**
 * app.ts
 * Configuración principal de la aplicación Express:
 * middlewares globales, registro de rutas y manejo de errores.
 * El arranque real del servidor vive en index.ts.
 */
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middlewares/error";
import authRoutes from "./modules/auth/auth.routes";
import assetsRoutes from "./modules/assets/assets.routes";
import scansRoutes from "./modules/scans/scans.routes";
import vulnerabilitiesRoutes from "./modules/vulnerabilities/vulnerabilities.routes";
import eventsRoutes from "./modules/events/events.routes";
import alertsRoutes from "./modules/alerts/alerts.routes";
import incidentsRoutes from "./modules/incidents/incidents.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

const app = express();

// Seguridad de cabeceras HTTP (RNF-004) y CORS restringido a orígenes configurados.
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// Endpoint de verificación de salud (usado por Docker y pruebas).
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "cyberguard-api", time: new Date().toISOString() });
});

// Límite de intentos sobre la autenticación para mitigar fuerza bruta (RNF-005).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Registro de los routers de cada módulo bajo /api.
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/scans", scansRoutes);
app.use("/api/vulnerabilities", vulnerabilitiesRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/incidents", incidentsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Manejo de errores y rutas no existentes (siempre al final).
app.use(notFound);
app.use(errorHandler);

export default app;
