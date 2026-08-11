/**
 * auth.guard.ts
 * Guard de rutas: bloquea el acceso al panel si no hay sesión activa
 * y redirige al usuario a la pantalla de inicio de sesión.
 */
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(["/login"]);
};
