/**
 * login.component.ts
 * Pantalla de inicio de sesión: recoge credenciales, las envía al backend
 * y redirige al dashboard en caso de éxito.
 */
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "cg-login",
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  username = "";
  password = "";
  loading = false;
  error = "";

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  /** Envía las credenciales; en caso de éxito navega a la raíz del panel. */
  submit(): void {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = "";
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(["/"]);
      },
      error: () => {
        this.loading = false;
        this.error = "Credenciales inválidas";
      },
    });
  }
}
