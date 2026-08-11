/**
 * auth.interceptor.ts
 * Interceptor HTTP: agrega la cabecera Authorization con el token JWT
 * a cada petición saliente cuando la sesión existe.
 */
import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("cg_token");
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req);
};
