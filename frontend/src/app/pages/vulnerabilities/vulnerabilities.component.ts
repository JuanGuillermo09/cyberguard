/**
 * vulnerabilities.component.ts
 * Listado de vulnerabilidades con filtros (severidad/estado) y paginación.
 */
import { Component, OnInit } from "@angular/core";
import { NgFor, NgIf, DatePipe } from "@angular/common";
import { ApiService } from "../../core/services/api.service";
import { Vulnerability } from "../../core/models";

@Component({
  selector: "cg-vulnerabilities",
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: "./vulnerabilities.component.html",
  styleUrl: "./vulnerabilities.component.scss",
})
export class VulnerabilitiesComponent implements OnInit {
  items: Vulnerability[] = [];
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

  /** Carga las vulnerabilidades aplicando filtros y paginación. */
  load(): void {
    this.api
      .vulnerabilities({ ...this.filters, page: this.page, pageSize: this.pageSize })
      .subscribe((res) => {
        this.items = res.items;
        this.total = res.total;
      });
  }
}
