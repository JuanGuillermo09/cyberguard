/**
 * lib/audit.ts
 * Registro de auditoría: guarda en la tabla AuditLog una traza de las
 * acciones sensibles de los usuarios (logins, escaneos, cambios de estado...).
 */
import { prisma } from "./prisma";

/** Entrada de auditoría registrada por los controladores. */
export interface AuditEntry {
  userId?: string | null;
  action: string;
  resource?: string | null;
  resourceId?: string | null;
  result?: string | null;
  details?: unknown;
}

/**
 * Persiste una entrada de auditoría.
 * Si falla, solo se loguea el error sin romper la operación principal.
 */
export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        resource: entry.resource ?? null,
        resourceId: entry.resourceId ?? null,
        result: entry.result ?? null,
        details: (entry.details as object) ?? undefined,
      },
    });
  } catch (err) {
    console.error("[audit] No se pudo registrar auditoría:", err);
  }
}
