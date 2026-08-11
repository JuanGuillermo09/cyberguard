/**
 * auth.service.ts
 * Gestión de la sesión en el cliente:
 * guarda el token y el perfil en localStorage y los expone como signals.
 */
import { Injectable, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { ConfigService } from "./config.service";
import { LoginResponse, User } from "../models";

@Injectable({ providedIn: "root" })
export class AuthService {
  // Estado reactivo inicializado desde localStorage (persistencia entre recargas).
  private tokenSignal = signal<string | null>(localStorage.getItem("cg_token"));
  private userSignal = signal<User | null>(this.readUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {}

  /**
   * Inicia sesión contra el backend y guarda token + perfil.
   * Devuelve un observable que emite la respuesta del servidor.
   */
  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(`${this.config.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem("cg_token", res.token);
          localStorage.setItem("cg_user", JSON.stringify(res.user));
          this.tokenSignal.set(res.token);
          this.userSignal.set(res.user);
        })
      );
  }

  /** Cierra la sesión: limpia token y perfil (localStorage + signals). */
  logout(): void {
    localStorage.removeItem("cg_token");
    localStorage.removeItem("cg_user");
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  /** Recupera el perfil guardado en localStorage (con tolerancia a JSON corrupto). */
  private readUser(): User | null {
    const raw = localStorage.getItem("cg_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
