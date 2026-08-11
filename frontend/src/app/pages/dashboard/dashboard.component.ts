/**
 * dashboard.component.ts
 * Panel principal: carga el resumen de métricas (con refresco periódico) y
 * muestra eventos/alertas en tiempo real recibidos por WebSocket.
 */
import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgFor, NgIf, DatePipe } from "@angular/common";
import { interval, Subscription } from "rxjs";
import { ApiService } from "../../core/services/api.service";
import { WebSocketService } from "../../core/services/websocket.service";
import { DashboardSummary, Severity } from "../../core/models";

@Component({
  selector: "cg-dashboard",
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit, OnDestroy {
  summary?: DashboardSummary;
  severityOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"] as const;
  private refresh: Subscription | undefined;

  constructor(
    private api: ApiService,
    public ws: WebSocketService
  ) {}

  ngOnInit(): void {
    this.load();
    // Refresca las métricas cada 15 segundos.
    this.refresh = interval(15000).subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.refresh?.unsubscribe();
  }

  /** Carga el resumen de métricas del backend. */
  load(): void {
    this.api.dashboardSummary().subscribe({
      next: (s) => (this.summary = s),
      error: () => (this.summary = undefined),
    });
  }

  /** Eventos recibidos en vivo por WebSocket. */
  liveEvents() {
    return this.ws.liveEvents();
  }

  /** Alertas recibidas en vivo por WebSocket. */
  liveAlerts() {
    return this.ws.liveAlerts();
  }

  /** Ancho de la barra proporcional a la cantidad por severidad. */
  barWidth(sev: string, kind: "vuln" | "alert"): string {
    const total = kind === "vuln" ? this.summary!.vulnerabilities : this.summary!.alerts;
    if (total === 0) return "0%";
    const map =
      kind === "vuln"
        ? this.summary!.vulnerabilitiesBySeverity
        : this.summary!.alertsBySeverity;
    const count = map[sev as Severity] ?? 0;
    return `${Math.max(2, Math.round((count / total) * 100))}%`;
  }
}
