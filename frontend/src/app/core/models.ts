/**
 * core/models.ts
 * Tipos compartidos del frontend que reflejan los modelos del backend.
 */
export type Severity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Role = "ADMIN" | "ANALYST" | "USER";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Asset {
  id: string;
  name: string;
  ipAddress: string;
  type: string;
  os?: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Scan {
  id: string;
  assetId: string;
  status: string;
  portRange: string;
  error?: string;
  createdAt: string;
  asset?: { id: string; name: string; ipAddress: string };
}

export interface Vulnerability {
  id: string;
  cveId?: string;
  title: string;
  severity: Severity;
  status: string;
  service?: string;
  port?: number;
  detectedAt: string;
  asset?: { id: string; name: string; ipAddress: string };
}

export interface SecurityEvent {
  id: string;
  source: string;
  sourceLabel?: string;
  type: string;
  severity: Severity;
  title: string;
  description?: string;
  sourceIp?: string;
  destinationIp?: string;
  port?: number;
  receivedAt: string;
  asset?: { id: string; name: string; ipAddress: string };
}

export interface Alert {
  id: string;
  title: string;
  severity: Severity;
  status: string;
  source: string;
  sourceLabel?: string;
  createdAt: string;
  asset?: { id: string; name: string; ipAddress: string };
}

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: string;
  createdAt: string;
  asset?: { id: string; name: string; ipAddress: string };
}

export interface DashboardSummary {
  assets: number;
  activeAssets: number;
  vulnerabilities: number;
  vulnerabilitiesBySeverity: Record<Severity, number>;
  alerts: number;
  activeAlerts: number;
  alertsBySeverity: Record<Severity, number>;
  incidents: number;
  openIncidents: number;
  events: number;
  eventsLast24h: number;
  scans: number;
  exposedPorts: { port: number; service: string | null }[];
  recentEvents: SecurityEvent[];
  securityScore: number;
  updatedAt: string;
}
