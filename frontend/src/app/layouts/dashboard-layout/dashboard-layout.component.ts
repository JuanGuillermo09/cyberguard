/**
 * dashboard-layout.component.ts
 * Componente contenedor del panel autenticado: barra lateral de navegación,
 * conexión al WebSocket en tiempo real y cierre de sesión.
 */
import { Component, OnInit } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { NgFor } from "@angular/common";
import { AuthService } from "../../core/services/auth.service";
import { WebSocketService } from "../../core/services/websocket.service";

@Component({
  selector: "cg-dashboard-layout",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor],
  templateUrl: "./dashboard-layout.component.html",
  styleUrl: "./dashboard-layout.component.scss",
})
export class DashboardLayoutComponent implements OnInit {
  constructor(
    public auth: AuthService,
    private router: Router,
    private ws: WebSocketService
  ) {}

  /** Elementos del menú lateral (icono + etiqueta + ruta + roles permitidos). */
  nav = [
    { path: "", icon: "📊", label: "Dashboard", roles: ["ADMIN", "ANALYST", "USER"] },
    { path: "assets", icon: "🖥️", label: "Activos", roles: ["ADMIN"] },
    { path: "vulnerabilities", icon: "⚠️", label: "Vulnerabilidades", roles: ["ADMIN", "ANALYST", "USER"] },
    { path: "events", icon: "📡", label: "Eventos", roles: ["ADMIN", "ANALYST", "USER"] },
    { path: "alerts", icon: "🔔", label: "Alertas", roles: ["ADMIN", "ANALYST"] },
    { path: "incidents", icon: "🚨", label: "Incidentes", roles: ["ADMIN", "ANALYST"] },
  ];

  /** Menú filtrado: solo muestra los módulos permitidos para el rol actual. */
  get visibleNav() {
    const role = this.auth.user()?.role;
    return this.nav.filter((item) => !role || item.roles.includes(role));
  }

  ngOnInit(): void {
    // Conecta al WebSocket al entrar al panel (recibe eventos/alertas en vivo).
    this.ws.connect();
  }

  /** Cierra la sesión: desconecta WS, limpia el token y navega al login. */
  logout(): void {
    this.ws.disconnect();
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
}
