/**
 * api.service.ts
 * Cliente HTTP tipado para todos los endpoints REST del backend.
 * Centraliza la URL base y la construcción de parámetros de consulta.
 */
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { ConfigService } from "./config.service";
import {
  Alert,
  Asset,
  DashboardSummary,
  Incident,
  Paginated,
  Scan,
  SecurityEvent,
  Vulnerability,
} from "../models";

@Injectable({ providedIn: "root" })
export class ApiService {
  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {}

  /** URL base de la API (definida en environment y/o assets/config.json). */
  private get apiUrl(): string {
    return this.config.apiUrl;
  }

  /** Resumen de métricas para el panel principal. */
  dashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard/summary`);
  }

  /** Lista activos con filtros y paginación. */
  assets(params?: Record<string, string | number>): Observable<Paginated<Asset>> {
    return this.http.get<Paginated<Asset>>(`${this.apiUrl}/assets`, { params: this.toParams(params) });
  }

  /** Crea un activo nuevo. */
  createAsset(body: Partial<Asset>): Observable<Asset> {
    return this.http.post<Asset>(`${this.apiUrl}/assets`, body);
  }

  /** Lanza un escaneo sobre un activo (rango de puertos opcional). */
  createScan(assetId: string, portRange?: string): Observable<Scan> {
    return this.http.post<Scan>(`${this.apiUrl}/scans`, { assetId, portRange });
  }

  /** Lista vulnerabilidades con filtros y paginación. */
  vulnerabilities(params?: Record<string, string | number>): Observable<Paginated<Vulnerability>> {
    return this.http.get<Paginated<Vulnerability>>(`${this.apiUrl}/vulnerabilities`, {
      params: this.toParams(params),
    });
  }

  /** Lista eventos SIEM con filtros y paginación. */
  events(params?: Record<string, string | number>): Observable<Paginated<SecurityEvent>> {
    return this.http.get<Paginated<SecurityEvent>>(`${this.apiUrl}/events`, {
      params: this.toParams(params),
    });
  }

  /** Lista alertas con filtros y paginación. */
  alerts(params?: Record<string, string | number>): Observable<Paginated<Alert>> {
    return this.http.get<Paginated<Alert>>(`${this.apiUrl}/alerts`, { params: this.toParams(params) });
  }

  /** Cambia el estado de una alerta. */
  setAlertStatus(id: string, status: string, comment?: string): Observable<Alert> {
    return this.http.patch<Alert>(`${this.apiUrl}/alerts/${id}/status`, { status, comment });
  }

  /** Lista incidentes con paginación. */
  incidents(params?: Record<string, string | number>): Observable<Paginated<Incident>> {
    return this.http.get<Paginated<Incident>>(`${this.apiUrl}/incidents`, {
      params: this.toParams(params),
    });
  }

  /** Crea un incidente nuevo. */
  createIncident(body: Partial<Incident> & { description?: string }): Observable<Incident> {
    return this.http.post<Incident>(`${this.apiUrl}/incidents`, body);
  }

  /** Convierte un mapa de filtros en parámetros HTTP (ignora valores vacíos). */
  private toParams(params?: Record<string, string | number>): HttpParams {
    let p = new HttpParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== "") {
          p = p.set(k, String(v));
        }
      }
    }
    return p;
  }
}
