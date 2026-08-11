/**
 * prisma/seed.ts
 * Datos iniciales para desarrollo y demo:
 * - Usuarios con roles (admin / analyst / user).
 * - Activo de laboratorio (localhost).
 * - Reglas de correlación SIEM por defecto.
 * - Eventos de ejemplo.
 * Ejecución: npm run prisma:seed
 */
import {
  PrismaClient,
  Role,
  RuleStatus,
  RuleType,
  Severity,
  AssetType,
  EventSource,
  ScanStatus,
  AlertStatus,
  IncidentStatus,
  VulnerabilityStatus,
} from "@prisma/client";
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

  const analyst = await prisma.user.upsert({
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

  // --- Datos demo para el dashboard ------------------------------------

  // Escaneo completado con resultados (puertos/servicios expuestos).
  const existingScan = await prisma.scan.findFirst({
    where: { assetId: labHost.id, status: ScanStatus.COMPLETED },
  });
  if (!existingScan) {
    const scan = await prisma.scan.create({
      data: {
        assetId: labHost.id,
        status: ScanStatus.COMPLETED,
        portRange: "1-1000",
        startedAt: new Date(Date.now() - 3600_000),
        finishedAt: new Date(),
        initiatedById: admin.id,
      },
    });

    const openPorts = [
      { port: 22, service: "ssh", version: "OpenSSH 9.2" },
      { port: 80, service: "http", version: "Apache 2.4.57" },
      { port: 445, service: "microsoft-ds", version: "SMB" },
      { port: 3306, service: "mysql", version: "MySQL 8.0" },
      { port: 8080, service: "http-alt", version: "Apache Tomcat 9.0" },
    ];

    for (const p of openPorts) {
      await prisma.scanResult.create({
        data: { scanId: scan.id, port: p.port, service: p.service, version: p.version },
      });
    }

    // Vulnerabilidades asociadas a los puertos detectados.
    const vulnData = [
      { cveId: "CVE-2023-25690", title: "Apache HTTP Server SSRF via mod_proxy", severity: Severity.HIGH, port: 80, service: "http" },
      { cveId: "CVE-2023-21980", title: "MySQL privilege escalation vulnerability", severity: Severity.HIGH, port: 3306, service: "mysql" },
      { cveId: "CVE-2023-25615", title: "Apache Tomcat request smuggling", severity: Severity.MEDIUM, port: 8080, service: "http-alt" },
      { cveId: "CVE-2023-48795", title: "SSH Terrapin prefix truncation attack", severity: Severity.MEDIUM, port: 22, service: "ssh" },
      { cveId: "CVE-2023-38545", title: "SMB exposed to local network", severity: Severity.LOW, port: 445, service: "microsoft-ds" },
    ];

    for (const v of vulnData) {
      const exists = await prisma.vulnerability.findFirst({
        where: { cveId: v.cveId, assetId: labHost.id },
      });
      if (!exists) {
        await prisma.vulnerability.create({
          data: {
            assetId: labHost.id,
            cveId: v.cveId,
            title: v.title,
            severity: v.severity,
            port: v.port,
            service: v.service,
            status: VulnerabilityStatus.OPEN,
            description: `Vulnerabilidad de ejemplo detectada en el servicio ${v.service} (puerto ${v.port}).`,
          },
        });
      }
    }
  }

  // Alertas derivadas de eventos y vulnerabilidades de ejemplo.
  const existingAlerts = await prisma.alert.count();
  if (existingAlerts === 0) {
    const highEvent = await prisma.event.findFirst({
      where: { sourceLabel: "test-app" },
    });
    await prisma.alert.create({
      data: {
        title: "Anomalía detectada en aplicación de prueba",
        description: "Comportamiento anómalo detectado desde 192.168.1.75 hacia el puerto 8080.",
        severity: Severity.HIGH,
        status: AlertStatus.NEW,
        source: EventSource.APPLICATION,
        sourceLabel: "test-app",
        assetId: labHost.id,
        eventId: highEvent?.id,
      },
    });

    const loginEvent = await prisma.event.findFirst({
      where: { sourceLabel: "ids-local" },
    });
    await prisma.alert.create({
      data: {
        title: "Intentos de acceso fallidos",
        description: "Múltiples intentos de autenticación fallidos detectados por el IDS.",
        severity: Severity.MEDIUM,
        status: AlertStatus.IN_PROGRESS,
        source: EventSource.IDS,
        sourceLabel: "ids-local",
        assetId: labHost.id,
        eventId: loginEvent?.id,
        assignedToId: analyst.id,
      },
    });

    // Incidente abierto vinculado a la alerta crítica del laboratorio.
    await prisma.incident.create({
      data: {
        title: "Investigación de anomalía en aplicación de prueba",
        description: "Incidente de ejemplo creado para la demo: anomalía detectada en el laboratorio local.",
        severity: Severity.HIGH,
        status: IncidentStatus.INVESTIGATING,
        assetId: labHost.id,
        createdById: analyst.id,
      },
    });
  }

  console.log("Seed completado:");
  console.log("  - Usuarios: admin / analyst / user (contraseña: CyberGuard2026!)");
  console.log("  - Activo de laboratorio: 127.0.0.1");
  console.log("  - Reglas de correlación y eventos de ejemplo");
  console.log("  - Datos demo: escaneo, vulnerabilidades, alertas e incidente");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
