/**
 * prisma/seed.ts
 * Datos iniciales para desarrollo y demo:
 * - Usuarios con roles (admin / analyst / user).
 * - Activo de laboratorio (localhost).
 * - Reglas de correlación SIEM por defecto.
 * - Eventos de ejemplo.
 * Ejecución: npm run prisma:seed
 */
import { PrismaClient, Role, RuleStatus, RuleType, Severity, AssetType, EventSource } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Contraseña común de demo (en producción usar un gestor de secretos).
  const passwordHash = await bcrypt.hash("CyberGuard2026!", 10);

  // Usuarios por defecto: ADMIN (admin), ANALYST (analyst), USER (user).
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@cyberguard.local",
      passwordHash,
      fullName: "Administrador",
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { username: "analyst" },
    update: {},
    create: {
      username: "analyst",
      email: "analyst@cyberguard.local",
      passwordHash,
      fullName: "Analista de seguridad",
      role: Role.ANALYST,
    },
  });

  await prisma.user.upsert({
    where: { username: "user" },
    update: {},
    create: {
      username: "user",
      email: "user@cyberguard.local",
      passwordHash,
      fullName: "Usuario",
      role: Role.USER,
    },
  });

  // Activos de ejemplo del laboratorio (localhost)
  const labHost = await prisma.asset.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Laboratorio Local",
      ipAddress: "127.0.0.1",
      type: AssetType.SERVER,
      os: "Windows",
      description: "Activo del laboratorio controlado de CyberGuard",
      createdById: admin.id,
    },
  });

  // Reglas de correlación por defecto
  const defaultRules = [
    {
      name: "Intentos de acceso fallidos",
      description: "Detecta múltiples intentos fallidos de autenticación desde un mismo origen",
      type: RuleType.CORRELATION as const,
      status: RuleStatus.ACTIVE as const,
      severity: Severity.HIGH as const,
      windowMs: 60000,
      condition: {
        op: "and",
        conditions: [
          { field: "type", op: "eq", value: "LOGIN_FAILED" },
          { field: "severity", op: "gte", value: 3 },
        ],
      },
    },
    {
      name: "Evento de alta severidad",
      description: "Genera alerta ante cualquier evento HIGH o CRITICAL",
      type: RuleType.CORRELATION as const,
      status: RuleStatus.ACTIVE as const,
      severity: Severity.CRITICAL as const,
      windowMs: 60000,
      condition: {
        op: "or",
        conditions: [
          { field: "severity", op: "eq", value: "HIGH" },
          { field: "severity", op: "eq", value: "CRITICAL" },
        ],
      },
    },
    {
      name: "Escaneo de puertos",
      description: "Detecta actividad de escaneo de múltiples puertos",
      type: RuleType.CORRELATION as const,
      status: RuleStatus.ACTIVE as const,
      severity: Severity.MEDIUM as const,
      windowMs: 60000,
      condition: {
        op: "and",
        conditions: [{ field: "type", op: "contains", value: "SCAN" }],
      },
    },
  ];

  for (const rule of defaultRules) {
    await prisma.correlationRule.upsert({
      where: { name: rule.name },
      update: {},
      create: rule as never,
    });
  }

  // Eventos de ejemplo
  const events = [
    {
      source: EventSource.IDS,
      sourceLabel: "ids-local",
      type: "LOGIN_FAILED",
      severity: Severity.MEDIUM,
      title: "Intento de acceso fallido",
      description: "Se registró un intento de autenticación fallido",
      sourceIp: "192.168.1.50",
      destinationIp: "127.0.0.1",
      port: 445,
      protocol: "tcp",
      assetId: labHost.id,
    },
    {
      source: EventSource.SCANNER,
      sourceLabel: "vulnerability-scanner",
      type: "SCAN_COMPLETED",
      severity: Severity.INFO,
      title: "Escaneo completado",
      description: "Escaneo de puertos del laboratorio completado",
      destinationIp: "127.0.0.1",
      assetId: labHost.id,
    },
    {
      source: EventSource.APPLICATION,
      sourceLabel: "test-app",
      type: "ANOMALY_DETECTED",
      severity: Severity.HIGH,
      title: "Anomalía detectada en aplicación de prueba",
      sourceIp: "192.168.1.75",
      destinationIp: "127.0.0.1",
      port: 8080,
      protocol: "tcp",
      assetId: labHost.id,
    },
  ];

  for (const event of events) {
    const exists = await prisma.event.findFirst({
      where: { type: event.type, title: event.title, source: event.source },
    });
    if (!exists) {
      await prisma.event.create({ data: event });
    }
  }

  console.log("Seed completado:");
  console.log("  - Usuarios: admin / analyst / user (contraseña: CyberGuard2026!)");
  console.log("  - Activo de laboratorio: 127.0.0.1");
  console.log("  - Reglas de correlación y eventos de ejemplo");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
