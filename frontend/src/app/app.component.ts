/**
 * app.component.ts
 * Componente raíz: solo contiene el router-outlet donde se montan las rutas.
 */
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "cg-root",
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}
