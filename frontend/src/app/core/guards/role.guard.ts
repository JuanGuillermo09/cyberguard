/**
 * role.guard.ts
 * Guard de rutas por rol: verifica que el usuario autenticado tenga uno de
 * los roles permitidos declarados en `data.roles` de la ruta.
 * Si no tiene permiso, redirige a la raíz del panel.
 */
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowed = route.data?.["roles"] as string[] | undefined;
  const user = auth.user();

  // Sin lista de roles permitidos => acceso libre (ya autenticado).
  if (!allowed || (user && allowed.includes(user.role))) {
    return true;
  }
  return router.createUrlTree(["/"]);
};
