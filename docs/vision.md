# Documento de Visión — CyberGuard

## 1. Información general

**Nombre del proyecto:** CyberGuard
**Tipo de proyecto:** Plataforma de ciberseguridad
**Categoría:** Security Operations & Threat Detection Platform
**Plataforma objetivo:** Windows
**Estado:** En desarrollo

---

# 2. Descripción del proyecto

CyberGuard es una plataforma integral de ciberseguridad orientada a la **detección, análisis, monitoreo y gestión de eventos de seguridad** dentro de infraestructuras controladas y autorizadas.

La plataforma busca integrar diferentes capacidades de seguridad en un único sistema, permitiendo identificar vulnerabilidades, analizar servicios expuestos, detectar actividades sospechosas, centralizar eventos y generar alertas de seguridad.

CyberGuard estará compuesto por un **Vulnerability Scanner**, un **Intrusion Detection System (IDS)**, un **Security Information and Event Management (SIEM)**, un sistema de gestión de alertas y un dashboard desarrollado con Angular.

El proyecto será desarrollado y ejecutado principalmente sobre **Windows**, utilizando herramientas y tecnologías compatibles con este entorno.

---

# 3. Problema

Las herramientas de ciberseguridad suelen estar especializadas en tareas específicas.

Por ejemplo:

* Un scanner permite identificar puertos y servicios.
* Un IDS permite detectar actividades sospechosas.
* Un SIEM permite centralizar eventos.
* Un dashboard permite visualizar información.

Sin embargo, para proyectos pequeños, laboratorios educativos o entornos controlados, puede resultar complejo integrar todas estas capacidades en una única plataforma.

Además, los resultados obtenidos por diferentes herramientas pueden encontrarse separados, dificultando su análisis y seguimiento.

CyberGuard busca solucionar este problema mediante la creación de una plataforma centralizada que permita **recolectar, procesar, analizar y visualizar información relacionada con la seguridad de una infraestructura**.

---

# 4. Visión

La visión de CyberGuard es convertirse en una plataforma de seguridad capaz de proporcionar una **visión centralizada del estado de seguridad de una infraestructura**, integrando detección de vulnerabilidades, monitoreo de eventos, detección de actividades sospechosas y gestión de alertas.

El sistema permitirá que un usuario autorizado pueda consultar desde una única interfaz:

* Los activos monitoreados.
* Los puertos y servicios detectados.
* Las vulnerabilidades encontradas.
* Los eventos de seguridad.
* Las alertas generadas.
* Los niveles de severidad.
* El historial de actividades.
* El estado general de seguridad.

A largo plazo, CyberGuard buscará incorporar mecanismos de correlación y automatización que permitan identificar relaciones entre diferentes eventos y facilitar la respuesta ante posibles incidentes de seguridad.

---

# 5. Objetivo general

Desarrollar una plataforma integral de ciberseguridad para Windows capaz de **detectar vulnerabilidades, recopilar y analizar eventos de seguridad, identificar actividades sospechosas y centralizar la información mediante un sistema SIEM y un dashboard web**.

---

# 6. Objetivos específicos

### 6.1 Vulnerability Scanner

Desarrollar un componente capaz de:

* Detectar puertos abiertos.
* Identificar servicios activos.
* Obtener información de versiones cuando sea posible.
* Analizar posibles vulnerabilidades.
* Clasificar los hallazgos según su severidad.
* Mantener un historial de escaneos.

### 6.2 Intrusion Detection System

Implementar un sistema capaz de:

* Detectar eventos sospechosos.
* Analizar información de tráfico disponible.
* Generar eventos de seguridad.
* Registrar las actividades detectadas.
* Enviar información al SIEM.

### 6.3 SIEM

Desarrollar un motor capaz de:

* Recibir eventos de diferentes fuentes.
* Normalizar la información.
* Almacenar eventos.
* Clasificar eventos.
* Correlacionar eventos relacionados.
* Identificar patrones sospechosos.
* Generar alertas.

### 6.4 Gestión de alertas

Implementar un sistema que permita:

* Crear alertas.
* Clasificar alertas por severidad.
* Consultar alertas.
* Cambiar su estado.
* Registrar acciones realizadas sobre ellas.
* Realizar seguimiento hasta su resolución.

### 6.5 Dashboard

Desarrollar una interfaz web que permita visualizar:

* Estado general de seguridad.
* Activos monitoreados.
* Vulnerabilidades.
* Eventos.
* Alertas.
* Incidentes.
* Estadísticas de seguridad.

---

# 7. Usuarios objetivo

CyberGuard estará orientado principalmente a:

### Administradores de sistemas

Personas encargadas de supervisar la infraestructura y conocer su estado de seguridad.

### Analistas de seguridad

Usuarios que necesitan analizar eventos, vulnerabilidades y alertas.

### Desarrolladores

Personas interesadas en evaluar la seguridad de aplicaciones y servicios dentro de entornos controlados.

### Estudiantes

Personas que buscan aprender conceptos relacionados con:

* Ciberseguridad.
* Redes.
* SIEM.
* IDS.
* Vulnerability Management.
* Seguridad de aplicaciones.
* Monitoreo de infraestructura.

---

# 8. Alcance

CyberGuard incluirá inicialmente:

* Autenticación de usuarios.
* Gestión de roles.
* Gestión de activos.
* Scanner de puertos.
* Detección de servicios.
* Análisis de vulnerabilidades.
* Integración con información de CVE.
* Recolección de eventos.
* IDS.
* SIEM.
* Correlación de eventos.
* Sistema de alertas.
* Gestión de incidentes.
* Dashboard web.
* Estadísticas.
* Historial de eventos.
* Historial de escaneos.
* Reportes básicos.

Todas las pruebas de seguridad estarán orientadas exclusivamente a **sistemas propios, autorizados o pertenecientes al entorno controlado de pruebas de CyberGuard**.

---

# 9. Fuera del alcance inicial

Las siguientes funcionalidades no forman parte de la primera versión:

* Ataques contra sistemas externos.
* Explotación automática de vulnerabilidades.
* Malware.
* Persistencia en sistemas.
* Evasión de sistemas de seguridad.
* Ataques de denegación de servicio.
* Automatización de ataques contra infraestructura no autorizada.
* Inteligencia artificial avanzada para respuesta automática.

Estas funcionalidades podrían ser consideradas en investigaciones futuras únicamente dentro de entornos controlados y autorizados.

---

# 10. Arquitectura conceptual

La plataforma seguirá una arquitectura modular:

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
    PostgreSQL          SIEM Engine         Alert Manager
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

# 11. Tecnologías

## Frontend

* Angular
* TypeScript
* HTML
* SCSS

## Backend

* Node.js
* TypeScript
* Express
* REST API
* WebSocket

## Base de datos

* PostgreSQL
* Prisma ORM

## Security

* Python
* Vulnerability Scanner
* IDS
* SIEM
* CVE
* Security Event Management

## Sistema operativo

* Windows 10
* Windows 11

## Herramientas de desarrollo

* Visual Studio Code
* Git
* GitHub
* PowerShell

---

# 12. Beneficios esperados

CyberGuard permitirá:

* Centralizar información de seguridad.
* Detectar vulnerabilidades de manera organizada.
* Identificar actividades sospechosas.
* Facilitar el análisis de eventos.
* Mejorar la visibilidad sobre los activos.
* Priorizar vulnerabilidades según su severidad.
* Mantener trazabilidad de alertas e incidentes.
* Facilitar el aprendizaje de conceptos de ciberseguridad.
* Integrar desarrollo de software con prácticas de seguridad.

---

# 13. Resultado esperado

Al finalizar el proyecto se espera contar con una plataforma funcional capaz de recibir información de diferentes componentes de seguridad, procesarla, almacenarla y presentarla mediante una interfaz web.

El usuario podrá registrar activos, ejecutar análisis, consultar vulnerabilidades, visualizar eventos, recibir alertas y realizar seguimiento de posibles incidentes desde CyberGuard.

El resultado será una aplicación que combine conceptos de **Full Stack Development, Cybersecurity, Network Monitoring, Vulnerability Management y SIEM** en un único proyecto.

---

# 14. Evolución futura

Una vez completada la primera versión, CyberGuard podrá evolucionar mediante la incorporación de:

* Correlación avanzada de eventos.
* Automatización de respuestas.
* Análisis de comportamiento.
* Nuevas fuentes de eventos.
* Integración con servicios externos de inteligencia de amenazas.
* Sistema avanzado de reportes.
* Métricas de seguridad.
* Machine Learning para clasificación de eventos.
* Automatización de tareas de Security Operations.

Estas funcionalidades serán consideradas como parte de futuras versiones y no serán necesarias para la primera versión funcional.

---

# 15. Criterio de éxito

CyberGuard se considerará exitoso cuando sea capaz de:

1. Registrar y administrar activos.
2. Ejecutar análisis de seguridad autorizados.
3. Detectar puertos y servicios.
4. Identificar vulnerabilidades.
5. Recibir y almacenar eventos.
6. Detectar actividades sospechosas.
7. Generar alertas.
8. Correlacionar eventos básicos.
9. Mostrar la información mediante un dashboard.
10. Mantener un historial de las actividades realizadas.

El sistema deberá funcionar de forma estable sobre Windows y mantener una arquitectura modular que permita incorporar nuevas capacidades de seguridad en futuras versiones.
