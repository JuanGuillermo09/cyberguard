# Guía de instalación — CyberGuard

CyberGuard se ejecuta sobre **Windows** y requiere: Docker (para PostgreSQL), Node.js y Python.

## 1. Requisitos previos

| Herramienta | Versión mínima | Uso |
| ----------- | -------------- | --- |
| Docker Desktop | 24+ | PostgreSQL 16 |
| Node.js | 20+ | Backend y Frontend |
| Python | 3.10+ | Scanner, IDS, SIEM collector, Lab |
| Git | Cualquiera | Control de versiones |

Verificar la instalación:

```powershell
node --version
python --version
docker --version
```

## 2. Base de datos (PostgreSQL)

Levantar PostgreSQL con Docker:

```powershell
docker compose up -d
```

Esto inicia el contenedor `cyberguard-db` con la base `cyberguard`
(usuario/contraseña: `postgres` / `postgres`) en `localhost:5432`.

Para detenerlo:

```powershell
docker compose down
```

## 3. Variables de entorno

Copiar la plantilla al directorio del backend:

```powershell
Copy-Item .env.example backend\.env
```

Editar `backend\.env` según el entorno. Cambiar `JWT_SECRET` en producción.

## 4. Backend (Node.js + Express + Prisma)

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:push     # crea las tablas en PostgreSQL
npm run seed            # usuarios demo, activo de laboratorio y reglas
npm run dev             # inicia la API en http://localhost:3000
```

Usuarios creados por el seed (contraseña: `CyberGuard2026!`):

| Usuario | Rol |
| ------- | --- |
| `admin` | Administrador |
| `analyst` | Analista de seguridad |
| `user` | Usuario |

### Verificación rápida de la API

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

## 5. Frontend (Angular)

```powershell
cd frontend
npm install
npm start       # abre http://localhost:4200
```

Ingresar con `admin` / `CyberGuard2026!`.

El dashboard muestra resumen de seguridad, vulnerabilidades por severidad,
alertas, eventos recientes y actualizaciones en tiempo real vía WebSocket.

## 6. Laboratorio (servicios de prueba)

Levantar los servicios controlados del lab (solo `127.0.0.1`):

```powershell
Start-Process python -ArgumentList "lab\test-services\http_server.py","--port","8080" -WindowStyle Hidden
Start-Process python -ArgumentList "lab\test-services\echo_service.py","--port","9999" -WindowStyle Hidden
```

## 7. Vulnerability Scanner (Python)

Prueba directa:

```powershell
python scanner\main.py --host 127.0.0.1 --ports 8080,9999
```

Para escanear desde la plataforma: en el dashboard, sección **Activos** →
botón **Escanear**. El escaneo se ejecuta como proceso independiente y los
resultados quedan almacenados en la base de datos (visibles en el resumen
del dashboard y como vulnerabilidades detectadas).

## 8. IDS (detección de intrusos)

Envía eventos del Security Log de Windows al SIEM (requiere permisos elevados
para leer el registro):

```powershell
python ids\ids.py --simulate          # eventos de prueba
python ids\ids.py --loop --interval 10 # monitoreo continuo
```

## 9. SIEM collector

Alimenta el pipeline con eventos normalizados del laboratorio:

```powershell
python siem\collector.py
python siem\collector.py --loop --interval 15
python siem\collector.py --file lab\test-data\event_samples.json
```

## 10. Endpoints principales

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| POST | `/api/auth/login` | Iniciar sesión (JWT) |
| POST | `/api/auth/register` | Registrar usuario (admin) |
| GET | `/api/dashboard/summary` | Resumen de seguridad |
| GET/POST | `/api/assets` | Listar / registrar activos |
| POST | `/api/scans` | Crear e iniciar escaneo |
| GET | `/api/vulnerabilities` | Vulnerabilidades (filtrable) |
| GET/POST | `/api/events` | Consultar / ingerir eventos |
| POST | `/api/events/ingest` | Ingesta desde componentes (X-Api-Key) |
| GET | `/api/alerts` | Alertas |
| PATCH | `/api/alerts/:id/status` | Cambiar estado de alerta |
| GET/POST | `/api/incidents` | Incidentes |
| WS | `/ws?token=JWT` | Eventos y alertas en tiempo real |

## 11. Solución de problemas

- **`DATABASE_URL` no encontrada** al usar Prisma: asegurarse de que el archivo
  `.env` esté en `backend\.env`.
- **Scanner falla con "can't open file"**: confirmar que la ruta
  `scanner/main.py` existe y que `python` está en el PATH.
- **El IDS no lee eventos**: el Security Log requiere ejecutar PowerShell como
  administrador.
- **CORS**: si el frontend corre en otro puerto, ajustar `CORS_ORIGIN` en `.env`.
