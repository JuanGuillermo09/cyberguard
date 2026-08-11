/**
 * incidents.component.ts
 * Gestión de incidentes: crear investigaciones formales y listarlas.
 */
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgFor, NgIf, DatePipe } from "@angular/common";
import { ApiService } from "../../core/services/api.service";
import { Incident, Severity } from "../../core/models";

@Component({
  selector: "cg-incidents",
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, DatePipe],
  templateUrl: "./incidents.component.html",
  styleUrl: "./incidents.component.scss",
})
export class IncidentsComponent implements OnInit {
  items: Incident[] = [];
  total = 0;
  page = 1;
  pageSize = 25;
  form = { title: "", severity: "MEDIUM" } as { title: string; severity: Severity };

  /** Páginas totales según el total de registros. */
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  /** Carga los incidentes con paginación. */
  load(): void {
    this.api.incidents({ page: this.page, pageSize: this.pageSize }).subscribe((res) => {
      this.items = res.items;
      this.total = res.total;
    });
  }

  /** Crea un incidente nuevo y refresca la lista. */
  create(): void {
    if (!this.form.title) return;
    this.api.createIncident(this.form).subscribe(() => {
      this.form = { title: "", severity: "MEDIUM" };
      this.load();
    });
  }
}
