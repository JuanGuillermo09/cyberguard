/**
 * scans.service.ts
 * Lógica de negocio del módulo de escaneos:
 * creación del registro, ejecución asíncrona del scanner Python (RNF-010),
 * persistencia de resultados/CVEs y emisión de eventos SIEM.
 */
import { ScanStatus, EventSource, Severity } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import { ApiError } from "../../lib/asyncHandler";
import { runScanner, type ScannerPortResult } from "./scanner.client";
import { pushEvent } from "../../websocket";

/** Unión entre el resultado del scanner y los CVEs asociados a su puerto. */
interface PortWithCves {
  port: ScannerPortResult;
  cves: { cveId: string; title: string; severity: string }[];
  score: number;
}

/**
 * Tabla local puerto -> servicio.
 * Se usa como respaldo cuando el scanner no puede identificar el servicio
 * (por ejemplo, el banner grabbing no devuelve resultados).
 */
const PORT_SERVICE_MAP: Record<number, string> = {
  21: "ftp", 22: "ssh", 23: "telnet", 25: "smtp", 53: "dns", 80: "http",
  110: "pop3", 111: "rpcbind", 135: "msrpc", 139: "netbios", 143: "imap",
  443: "https", 445: "microsoft-ds", 1433: "mssql", 1521: "oracle",
  3306: "mysql", 3389: "rdp", 5432: "postgresql", 5985: "winrm", 6379: "redis",
  8080: "http-proxy", 8443: "https-alt", 9200: "elasticsearch", 27017: "mongodb",
};

/**
 * Crea el registro del escaneo en estado PENDING.
 * El puerto/range por defecto se toma de la configuración (env).
 */
export async function createScan(assetId: string, initiatedById: string, portRange?: string) {
  return prisma.scan.create({
    data: {
      assetId,
      initiatedById,
      status: ScanStatus.PENDING,
      portRange: portRange || env.scannerPortRange,
    },
  });
}

/**
 * Ejecuta un escaneo de forma asíncrona (no bloquea la API).
 * 1. Marca el escaneo como RUNNING.
 * 2. Llama al scanner Python.
 * 3. Persiste resultados y vulnerabilidades (CVEs) en una transacción.
 * 4. Emite un evento SIEM y marca el escaneo como COMPLETED/FAILED.
 */
export async function startScan(scanId: string): Promise<void> {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { asset: true },
  });
  if (!scan) throw new Error("Escaneo no encontrado");
  if (scan.asset.status !== "ACTIVE") {
    throw new Error("El activo no está activo, el escaneo no se puede ejecutar");
  }

  await prisma.scan.update({
    where: { id: scanId },
    data: { status: ScanStatus.RUNNING, startedAt: new Date() },
  });

  try {
    // Ejecución del script Python con los parámetros del activo.
    const output = await runScanner(
      scan.asset.ipAddress,
      scan.portRange,
      env.scannerTimeoutMs,
      env.scannerMaxThreads
    );

    const open = output.ports.filter((p) => p.state === "open");

    // Completar el servicio con la tabla local cuando el scanner no lo identifica.
    const withCves: PortWithCves[] = open.map((port) => {
      const service = port.service || PORT_SERVICE_MAP[port.port] || "unknown";
      const cves = port.cves ?? [];
      return { port: { ...port, service }, cves, score: 0 };
    });

    // Transacción: cada puerto abierto -> ScanResult; cada CVE -> Vulnerability.
    await prisma.$transaction(async (tx) => {
      for (const entry of withCves) {
        const scanResult = await tx.scanResult.create({
          data: {
            scanId,
            port: entry.port.port,
            protocol: entry.port.protocol,
            state: entry.port.state,
            service: entry.port.service,
            version: entry.port.version,
            cveCount: entry.cves.length,
          },
        });

        for (const cve of entry.cves) {
          await tx.vulnerability.create({
            data: {
              assetId: scan.assetId,
              scanResultId: scanResult.id,
              cveId: cve.cveId,
              title: cve.title,
              severity: cve.severity as Severity,
              service: entry.port.service,
              port: entry.port.port,
            },
          });
        }
      }
    });

    // Evento SIEM informativo del escaneo completado (se publica por WebSocket).
    const event = await prisma.event.create({
      data: {
        source: EventSource.SCANNER,
        sourceLabel: "vulnerability-scanner",
        type: "SCAN_COMPLETED",
        severity: open.length > 0 ? Severity.MEDIUM : Severity.INFO,
        title: `Escaneo completado en ${scan.asset.ipAddress}`,
        description: `${open.length} puertos abiertos encontrados en ${output.durationMs} ms`,
        destinationIp: scan.asset.ipAddress,
        assetId: scan.assetId,
        raw: output as unknown as object,
      },
    });
    pushEvent(event);

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: ScanStatus.COMPLETED, finishedAt: new Date() },
    });
  } catch (err) {
    // En caso de error el escaneo queda como FAILED y se registra un evento SIEM.
    const message = (err as Error).message;
    logger.error(`[scanner] Escaneo ${scanId} falló: ${message}`);

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: ScanStatus.FAILED, finishedAt: new Date(), error: message },
    });
    await prisma.event.create({
      data: {
        source: EventSource.SCANNER,
        sourceLabel: "vulnerability-scanner",
        type: "SCAN_FAILED",
        severity: Severity.HIGH,
        title: `Escaneo fallido en ${scan.asset.ipAddress}`,
        description: message,
        assetId: scan.assetId,
      },
    });
  }
}

/** Lista escaneos con filtros opcionales (activo y estado) y paginación. */
export async function listScans(filters: { assetId?: string; status?: string; page?: number; pageSize?: number }) {
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = Math.min(filters.pageSize ?? 50, 100);
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (filters.assetId) where.assetId = filters.assetId;
  if (filters.status) where.status = filters.status;

  const [items, total] = await Promise.all([
    prisma.scan.findMany({
      where: where as never,
      include: {
        asset: { select: { id: true, name: true, ipAddress: true } },
        initiatedBy: { select: { id: true, username: true } },
        _count: { select: { results: true } },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip,
    }),
    prisma.scan.count({ where: where as never }),
  ]);

  return { items, total, page, pageSize };
}

/** Devuelve el detalle de un escaneo con sus resultados y vulnerabilidades. */
export async function getScanById(id: string) {
  const scan = await prisma.scan.findUnique({
    where: { id },
    include: {
      asset: { select: { id: true, name: true, ipAddress: true } },
      initiatedBy: { select: { id: true, username: true } },
      results: {
        include: { vulnerabilities: true },
        orderBy: { port: "asc" },
      },
    },
  });
  if (!scan) throw new ApiError(404, "Escaneo no encontrado");
  return scan;
}

/** Cancela un escaneo que esté pendiente o en ejecución. */
export async function cancelScan(id: string) {
  const scan = await prisma.scan.findUnique({ where: { id } });
  if (!scan) throw new ApiError(404, "Escaneo no encontrado");
  if (scan.status !== "PENDING" && scan.status !== "RUNNING") {
    throw new ApiError(400, "Solo se pueden cancelar escaneos pendientes o en ejecución");
  }

  return prisma.scan.update({
    where: { id },
    data: { status: ScanStatus.CANCELLED, finishedAt: new Date() },
  });
}
