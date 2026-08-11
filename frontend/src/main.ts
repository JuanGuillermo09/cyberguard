/**
 * main.ts
 * Punto de arranque de la aplicación Angular (standalone).
 * Registra el enrutador y el cliente HTTP con el interceptor de autenticación.
 */
import { APP_INITIALIZER } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { authInterceptor } from "./app/core/interceptors/auth.interceptor";
import { ConfigService } from "./app/core/services/config.service";

// Carga assets/config.json antes de arrancar la app para conocer las
// URLs de la API y del WebSocket (despliegue del frontend por separado).
function loadConfig(config: ConfigService): () => Promise<void> {
  return () => config.load();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfig,
      deps: [ConfigService],
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
