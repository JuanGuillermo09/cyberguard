/**
 * events.component.ts
 * Listado de eventos SIEM con filtros (severidad, fuente, IP) y paginación.
 */
import { Component, OnInit } from "@angular/core";
import { NgFor, NgIf, DatePipe } from "@angular/common";
import { ApiService } from "../../core/services/api.service";
import { SecurityEvent } from "../../core/models";

@Component({
  selector: "cg-events",
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: "./events.component.html",
  styleUrl: "./events.component.scss",
})
export class EventsComponent implements OnInit {
  items: SecurityEvent[] = [];
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

  /** Carga los eventos aplicando filtros y paginación. */
  load(): void {
    this.api
      .events({ ...this.filters, page: this.page, pageSize: this.pageSize })
      .subscribe((res) => {
        this.items = res.items;
        this.total = res.total;
      });
  }
}
