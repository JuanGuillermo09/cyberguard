/**
 * app.routes.ts
 * Definición de rutas de la aplicación.
 * Las páginas se cargan de forma diferida (lazy loading), el panel está
 * protegido por el guard de autenticación y cada módulo declara en
 * `data.roles` qué roles pueden acceder a él (roleGuard).
 */
import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { roleGuard } from "./core/guards/role.guard";

export const routes: Routes = [
  {
    // Página de inicio de sesión (pública).
    path: "login",
    loadComponent: () =>
      import("./pages/login/login.component").then((m) => m.LoginComponent),
  },
  {
    // Panel principal: solo accesible con sesión iniciada.
    path: "",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./layouts/dashboard-layout/dashboard-layout.component").then(
        (m) => m.DashboardLayoutComponent
      ),
    children: [
      {
        path: "",
        pathMatch: "full",
        canActivate: [roleGuard],
        data: { roles: ["ADMIN", "ANALYST", "USER"] },
        loadComponent: () =>
          import("./pages/dashboard/dashboard.component").then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: "assets",
        canActivate: [roleGuard],
        data: { roles: ["ADMIN"] },
        loadComponent: () =>
          import("./pages/assets/assets.component").then((m) => m.AssetsComponent),
      },
      {
        path: "vulnerabilities",
        canActivate: [roleGuard],
        data: { roles: ["ADMIN", "ANALYST", "USER"] },
        loadComponent: () =>
          import("./pages/vulnerabilities/vulnerabilities.component").then(
            (m) => m.VulnerabilitiesComponent
          ),
      },
      {
        path: "events",
        canActivate: [roleGuard],
        data: { roles: ["ADMIN", "ANALYST", "USER"] },
        loadComponent: () =>
          import("./pages/events/events.component").then((m) => m.EventsComponent),
      },
      {
        path: "alerts",
        canActivate: [roleGuard],
        data: { roles: ["ADMIN", "ANALYST"] },
        loadComponent: () =>
          import("./pages/alerts/alerts.component").then((m) => m.AlertsComponent),
      },
      {
        path: "incidents",
        canActivate: [roleGuard],
        data: { roles: ["ADMIN", "ANALYST"] },
        loadComponent: () =>
          import("./pages/incidents/incidents.component").then(
            (m) => m.IncidentsComponent
          ),
      },
    ],
  },
  // Cualquier ruta desconocida redirige al panel.
  { path: "**", redirectTo: "" },
];
