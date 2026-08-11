/**
 * assets.component.ts
 * Gestión de activos: registrar nuevos activos, listar/buscar los existentes
 * y lanzar escaneos de vulnerabilidad desde la propia tabla.
 */
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgFor, NgIf } from "@angular/common";
import { ApiService } from "../../core/services/api.service";
import { Asset } from "../../core/models";

@Component({
  selector: "cg-assets",
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: "./assets.component.html",
  styleUrl: "./assets.component.scss",
})
export class AssetsComponent implements OnInit {
  items: Asset[] = [];
  total = 0;
  search = "";
  form = { name: "", ipAddress: "", type: "SERVER", description: "" };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  /** Carga los activos (con búsqueda por nombre o IP si existe). */
  load(): void {
    this.api
      .assets({ search: this.search, pageSize: 100 })
      .subscribe((res) => {
        this.items = res.items;
        this.total = res.total;
      });
  }

  /** Registra un activo nuevo y refresca la lista. */
  create(): void {
    if (!this.form.name || !this.form.ipAddress) return;
    this.api.createAsset(this.form).subscribe(() => {
      this.form = { name: "", ipAddress: "", type: "SERVER", description: "" };
      this.load();
    });
  }

  /** Lanza un escaneo de vulnerabilidades sobre el activo (puertos 1-1000). */
  scan(asset: Asset): void {
    this.api.createScan(asset.id, "1-1000").subscribe({
      next: () => alert(`Escaneo iniciado sobre ${asset.name}`),
      error: (e) => alert(e.error?.error || "Error al iniciar escaneo"),
    });
  }
}
