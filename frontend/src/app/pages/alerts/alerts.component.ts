/**
 * alerts.component.ts
 * Listado de alertas con filtros, paginación y cambio de estado en línea.
 */
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgFor, NgIf, DatePipe } from "@angular/common";
import { ApiService } from "../../core/services/api.service";
import { Alert } from "../../core/models";

@Component({
  selector: "cg-alerts",
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, DatePipe],
  templateUrl: "./alerts.component.html",
  styleUrl: "./alerts.component.scss",
})
export class AlertsComponent implements OnInit {
  items: Alert[] = [];
  total = 0;
  page = 1;
  pageSize = 25;
  filters: Record<string, string> = {};

  /** Páginas totales según el total de registros. */
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  /** Carga las alertas aplicando filtros y paginación. */
  load(): void {
    this.api.alerts({ ...this.filters, page: this.page, pageSize: this.pageSize }).subscribe(
      (res) => {
        this.items = res.items;
        this.total = res.total;
      }
    );
  }

  /** Actualiza el estado de una alerta (NEW/IN_PROGRESS/RESOLVED/DISMISSED). */
  changeStatus(alert: Alert, status: string): void {
    this.api.setAlertStatus(alert.id, status).subscribe({
      next: (updated) => {
        alert.status = updated.status;
      },
      error: (e) => window.alert(e.error?.error || "No se pudo actualizar"),
    });
  }
}
