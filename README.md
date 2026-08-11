# CyberGuard

### Security Operations & Threat Detection Platform

CyberGuard es una plataforma integral de ciberseguridad desarrollada para **Windows**, diseñada para detectar, analizar y monitorear vulnerabilidades y eventos de seguridad dentro de una infraestructura controlada.

La plataforma integra un **Vulnerability Scanner**, un **Intrusion Detection System (IDS)**, un **SIEM**, un sistema de gestión de alertas y un **Security Dashboard**, permitiendo centralizar información de seguridad desde una única aplicación.

---

## 🎯 Objetivo

El objetivo de CyberGuard es proporcionar una plataforma capaz de:

* Detectar vulnerabilidades en servicios y aplicaciones.
* Identificar puertos y servicios expuestos.
* Detectar actividades sospechosas en la red.
* Centralizar eventos de seguridad.
* Generar alertas.
* Clasificar eventos según su nivel de severidad.
* Monitorear activos de infraestructura.
* Visualizar el estado general de seguridad.
* Mantener un historial de eventos y vulnerabilidades.
* Facilitar el análisis y seguimiento de incidentes.
* Proporcionar un entorno controlado para realizar pruebas de seguridad.

---

## 🏗️ Arquitectura

```text
                         CYBERGUARD
                              │
                              ▼
                    ┌───────────────────┐
                    │      Angular      │
                    │ Security Dashboard│
                    └─────────┬─────────┘
                              │
                       REST / WebSocket
                              │
                    ┌─────────▼─────────┐
                    │      Node.js      │
                    │      Backend      │
                    └─────────┬─────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ PostgreSQL  │    │ SIEM Engine │    │Alert Manager│
    └─────────────┘    └──────┬──────┘    └─────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
           Vulnerability Scanner       IDS
                    │                   │
                    └─────────┬─────────┘
                              │
                              ▼
                     Windows Security Lab
```

---

# 🔐 Componentes principales

## Vulnerability Scanner

Componente encargado de analizar activos autorizados dentro del entorno de pruebas para identificar:

* Puertos abiertos.
* Servicios activos.
* Versiones de servicios.
* Configuraciones potencialmente inseguras.
* Vulnerabilidades conocidas.
* Nivel de severidad.
* Evidencias asociadas a los hallazgos.

El scanner será desarrollado principalmente con **Python** y estará integrado con el backend de CyberGuard.

---

## IDS — Intrusion Detection System

CyberGuard contará con un sistema de detección de intrusiones encargado de analizar eventos y tráfico de red dentro del entorno controlado.

El IDS permitirá:

* Detectar actividades sospechosas.
* Identificar patrones asociados a amenazas.
* Registrar eventos.
* Generar alertas.
* Enviar eventos al SIEM.

La implementación se realizará de acuerdo con las capacidades disponibles en el entorno Windows.

---

## SIEM Engine

El SIEM será responsable de centralizar y procesar eventos provenientes de diferentes fuentes.

Sus funciones principales serán:

* Recibir eventos.
* Normalizar información.
* Almacenar eventos.
* Clasificar eventos.
* Correlacionar eventos relacionados.
* Identificar patrones sospechosos.
* Generar alertas.
* Mantener historial de eventos.

---

## Alert Manager

Componente encargado de administrar las alertas de seguridad generadas por CyberGuard.

Las alertas podrán clasificarse como:

* Informativa
* Baja
* Media
* Alta
* Crítica

También permitirá realizar seguimiento del estado de las alertas.

Estados posibles:

```text
NEW
IN_PROGRESS
RESOLVED
DISMISSED
```

---

## Security Dashboard

La interfaz desarrollada con Angular permitirá visualizar la información de seguridad de manera centralizada.

El dashboard mostrará:

* Cantidad de activos monitoreados.
* Vulnerabilidades detectadas.
* Vulnerabilidades por severidad.
* Alertas activas.
* Eventos recientes.
* Servicios expuestos.
* Estado general de seguridad.
* Eventos en tiempo real.

---

# 🧪 Windows Security Lab

CyberGuard contará con un entorno de pruebas diseñado para ejecutar análisis de seguridad de forma controlada directamente sobre Windows.

El laboratorio permitirá trabajar con:

* Servicios locales.
* Aplicaciones de prueba.
* APIs de prueba.
* Bases de datos.
* Puertos de red.
* Servicios configurados para pruebas.
* Generación controlada de eventos.
* Pruebas de detección.

El laboratorio estará diseñado para evitar afectar sistemas externos o infraestructura no autorizada.

---

# 🛠️ Tecnologías

## Frontend

* Angular
* TypeScript
* HTML5
* SCSS

## Backend

* Node.js
* TypeScript
* Express
* REST API
* WebSockets

## Security

* Python
* Vulnerability Scanner
* IDS
* CVE Analysis
* Security Event Management

## Database

* PostgreSQL

## Operating System

* Windows 10 / Windows 11

## Development Tools

* Visual Studio Code
* Git
* GitHub
* PowerShell

---

# 📂 Estructura del proyecto

```text
CyberGuard/
│
├── frontend/
│
├── backend/
│
├── scanner/
│
├── ids/
│
├── siem/
│
├── lab/
│   ├── test-services/
│   └── test-data/
│
├── docs/
│   ├── vision.md
│   ├── requisitos-funcionales.md
│   ├── requisitos-no-funcionales.md
│   └── historias-usuario.md
│
├── .env.example
├── .gitignore
└── README.md
```

---

# 🔄 Flujo general

```text
                       ACTIVO
                          │
                          ▼
                Vulnerability Scanner
                          │
                          ▼
                    Vulnerabilidades
                          │
                          ├──────────────┐
                          │              │
                          ▼              ▼
                       SIEM             IDS
                          │              │
                          │              ▼
                          │        Eventos de red
                          │              │
                          └──────┬───────┘
                                 │
                                 ▼
                         Alert Manager
                                 │
                                 ▼
                           Dashboard
```

---

# 📊 Flujo de eventos

```text
Fuente de evento
      │
      ▼
┌────────────────┐
│ Event Collector│
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Event Normalizer│
└───────┬────────┘
        │
        ▼
┌────────────────┐
│   SIEM Engine  │
└───────┬────────┘
        │
        ├──────────────► PostgreSQL
        │
        ▼
┌────────────────┐
│ Alert Manager  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│    Angular     │
│   Dashboard    │
└────────────────┘
```

---

# 📋 Funcionalidades

## Gestión

* [x] Inicio de sesión.
* [x] Control de acceso.
* [x] Gestión de activos.

## Vulnerability Scanner

* [x] Escaneo de puertos.
* [x] Detección de servicios.
* [x] Detección de versiones.
* [x] Identificación de vulnerabilidades.
* [x] Integración con CVE.
* [x] Clasificación por severidad.
* [x] Historial de escaneos.

## IDS

* [x] Captura de eventos.
* [x] Detección de actividad sospechosa.
* [x] Registro de eventos.
* [x] Generación de alertas.
* [x] Integración con SIEM.

## SIEM

* [x] Recolección de eventos.
* [x] Normalización.
* [x] Almacenamiento.
* [x] Clasificación.
* [x] Correlación.
* [x] Generación de alertas.
* [x] Historial de eventos.

## Dashboard

* [x] Dashboard general.
* [x] Gestión de activos.
* [x] Visualización de vulnerabilidades.
* [x] Visualización de eventos.
* [x] Gestión de alertas.
* [x] Gestión de incidentes.
* [x] Eventos en tiempo real.
* [x] Gráficas de seguridad.

---

# 🔒 Seguridad y uso responsable

CyberGuard está diseñado exclusivamente para realizar pruebas de seguridad sobre infraestructura propia, autorizada o perteneciente al laboratorio controlado del proyecto.

Las funcionalidades de análisis y escaneo deberán utilizarse únicamente sobre sistemas donde se cuente con autorización.

El proyecto no está diseñado para atacar sistemas externos ni para realizar actividades de explotación no autorizadas.

---

# 🎯 Alcance

CyberGuard busca integrar conceptos relacionados con:

* Ciberseguridad.
* Vulnerability Management.
* Intrusion Detection.
* Security Operations.
* SIEM.
* Network Monitoring.
* Event Correlation.
* Incident Management.
* Secure Software Development.
* Security Automation.
* DevSecOps.

---

# 🚀 Roadmap

## Fase 1 — Arquitectura y entorno

* [x] Crear estructura del proyecto.
* [x] Configurar Git.
* [x] Configurar PostgreSQL.
* [x] Configurar variables de entorno.
* [x] Definir arquitectura.

## Fase 2 — Backend

* [x] Crear API Node.js.
* [x] Configurar TypeScript.
* [x] Configurar Prisma.
* [x] Crear modelos de datos.
* [x] Implementar autenticación.
* [x] Implementar autorización.

## Fase 3 — Vulnerability Scanner

* [x] Escaneo de puertos.
* [x] Detección de servicios.
* [x] Detección de versiones.
* [x] Análisis de vulnerabilidades.
* [x] Integración con CVE.
* [x] Integración con API.

## Fase 4 — IDS

* [x] Configurar IDS.
* [x] Capturar eventos.
* [x] Procesar eventos.
* [x] Integrar eventos con SIEM.

## Fase 5 — SIEM

* [x] Event Collector.
* [x] Normalización.
* [x] Correlación.
* [x] Sistema de alertas.
* [x] Gestión de incidentes.

## Fase 6 — Frontend

* [x] Crear dashboard.
* [x] Gestión de activos.
* [x] Vulnerabilidades.
* [x] Eventos.
* [x] Alertas.
* [x] Incidentes.
* [x] Gráficas.
* [x] Tiempo real.

## Fase 7 — Testing y documentación

* [ ] Tests unitarios.
* [ ] Tests de integración.
* [ ] Pruebas de seguridad.
* [ ] Documentación técnica.
* [x] Documentación de instalación.
* [ ] Demo del proyecto.

---

# 📚 Documentación

La documentación técnica se encuentra en la carpeta `docs/`.

* `vision.md` — Documento de visión.
* `requisitos-funcionales.md` — Requerimientos funcionales.
* `requisitos-no-funcionales.md` — Requerimientos no funcionales.
* `historias-usuario.md` — Historias de usuario.
* `instalacion.md` — Guía de instalación y puesta en marcha.

---

# 👨‍💻 Autor

**Juan Guillermo Cárdenas Miranda**

Software Engineering | Full Stack Development | Cybersecurity

---

# 📄 Licencia

Este proyecto se distribuirá bajo la licencia MIT.
