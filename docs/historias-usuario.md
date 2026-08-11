# Historias de Usuario — CyberGuard

## 1. Introducción

Las historias de usuario describen las necesidades de los diferentes tipos de usuarios de CyberGuard desde una perspectiva funcional.

Cada historia sigue la estructura:

> **Como** [tipo de usuario],
> **quiero** [funcionalidad],
> **para** [beneficio u objetivo].

Las historias incluyen criterios de aceptación que permitirán validar posteriormente si cada funcionalidad fue implementada correctamente.

---

# 2. Épica: Autenticación y gestión de usuarios

## HU-001 — Registro de usuario

**Como** administrador,
**quiero** registrar nuevos usuarios en CyberGuard,
**para** permitir que diferentes personas puedan utilizar la plataforma.

### Criterios de aceptación

* El administrador debe poder acceder al formulario de registro.
* El sistema debe solicitar la información requerida.
* El sistema debe validar los datos ingresados.
* El sistema debe impedir registros duplicados.
* La contraseña no debe almacenarse en texto plano.
* El sistema debe informar si el registro fue exitoso.

**Requisitos relacionados:** RF-001.

---

## HU-002 — Inicio de sesión

**Como** usuario,
**quiero** iniciar sesión mediante mis credenciales,
**para** acceder de forma segura a CyberGuard.

### Criterios de aceptación

* El usuario debe ingresar sus credenciales.
* El sistema debe validar las credenciales.
* Las credenciales incorrectas deben generar un mensaje de error.
* Un usuario autenticado debe poder acceder a las funcionalidades autorizadas.
* El sistema no debe revelar información sensible en caso de error.

**Requisitos relacionados:** RF-002, RF-006.

---

## HU-003 — Gestión de usuarios

**Como** administrador,
**quiero** consultar y administrar los usuarios,
**para** controlar quién tiene acceso a la plataforma.

### Criterios de aceptación

* El administrador debe poder consultar usuarios.
* Debe poder modificar información permitida.
* Debe poder desactivar usuarios.
* El sistema debe registrar las operaciones relevantes.

**Requisitos relacionados:** RF-004.

---

## HU-004 — Gestión de roles

**Como** administrador,
**quiero** asignar roles a los usuarios,
**para** controlar las funcionalidades que puede utilizar cada persona.

### Criterios de aceptación

* El administrador debe poder asignar un rol.
* El sistema debe validar los permisos asociados.
* Un usuario no debe poder acceder a funcionalidades no autorizadas.

**Requisitos relacionados:** RF-005, RF-006.

---

# 3. Épica: Gestión de activos

## HU-005 — Registrar activo

**Como** analista de seguridad,
**quiero** registrar un activo indicando su información básica,
**para** incluirlo dentro de la infraestructura monitoreada.

### Criterios de aceptación

* El sistema debe permitir registrar el nombre del activo.
* Debe permitir registrar su dirección IP.
* Debe permitir indicar el tipo de activo.
* Debe permitir agregar una descripción.
* El activo debe quedar disponible para futuros análisis.

**Requisitos relacionados:** RF-007.

---

## HU-006 — Consultar activos

**Como** analista de seguridad,
**quiero** consultar los activos registrados,
**para** conocer qué infraestructura está siendo monitoreada.

### Criterios de aceptación

* El sistema debe mostrar los activos registrados.
* Debe mostrar información básica de cada activo.
* Debe permitir consultar el detalle de un activo.

**Requisitos relacionados:** RF-008, RF-011.

---

## HU-007 — Gestionar activos

**Como** administrador,
**quiero** modificar o desactivar activos,
**para** mantener actualizada la información de la infraestructura.

### Criterios de aceptación

* El usuario autorizado debe poder modificar la información.
* Debe poder desactivar un activo.
* El historial asociado al activo no debe perderse al desactivarlo.

**Requisitos relacionados:** RF-009, RF-010.

---

# 4. Épica: Vulnerability Scanner

## HU-008 — Ejecutar escaneo

**Como** analista de seguridad,
**quiero** iniciar un escaneo sobre un activo autorizado,
**para** identificar posibles puntos de exposición.

### Criterios de aceptación

* El usuario debe poder seleccionar un activo autorizado.
* El sistema debe iniciar el escaneo.
* El escaneo debe mostrar su estado.
* El resultado debe almacenarse.

**Requisitos relacionados:** RF-012, RF-013, RF-020.

---

## HU-009 — Detectar puertos abiertos

**Como** analista de seguridad,
**quiero** conocer qué puertos están abiertos en un activo,
**para** identificar servicios potencialmente expuestos.

### Criterios de aceptación

* El scanner debe analizar los puertos configurados.
* Debe identificar los puertos abiertos.
* Los resultados deben asociarse con el activo.
* Los resultados deben almacenarse.

**Requisitos relacionados:** RF-014, RF-015, RF-018.

---

## HU-010 — Detectar servicios y versiones

**Como** analista de seguridad,
**quiero** identificar los servicios y versiones asociados a los puertos encontrados,
**para** obtener información útil para el análisis de vulnerabilidades.

### Criterios de aceptación

* El sistema debe intentar identificar el servicio.
* Debe registrar la versión cuando sea posible.
* La información debe relacionarse con el resultado del escaneo.

**Requisitos relacionados:** RF-016, RF-017.

---

## HU-011 — Identificar vulnerabilidades

**Como** analista de seguridad,
**quiero** identificar vulnerabilidades relacionadas con los servicios detectados,
**para** conocer los posibles riesgos de los activos.

### Criterios de aceptación

* El sistema debe analizar los resultados del scanner.
* Debe identificar vulnerabilidades conocidas cuando exista información disponible.
* Debe asociar la vulnerabilidad con el activo y servicio correspondiente.

**Requisitos relacionados:** RF-021, RF-022.

---

## HU-012 — Clasificar vulnerabilidades

**Como** analista de seguridad,
**quiero** que las vulnerabilidades tengan un nivel de severidad,
**para** poder priorizar los riesgos más importantes.

### Criterios de aceptación

* Cada vulnerabilidad debe tener una severidad.
* Los niveles deben incluir INFO, LOW, MEDIUM, HIGH y CRITICAL.
* El usuario debe poder filtrar vulnerabilidades por severidad.

**Requisitos relacionados:** RF-023, RF-025.

---

## HU-013 — Consultar historial de escaneos

**Como** analista de seguridad,
**quiero** consultar los escaneos realizados anteriormente,
**para** comparar resultados y realizar seguimiento de la seguridad de los activos.

### Criterios de aceptación

* El sistema debe mostrar los escaneos realizados.
* Debe mostrar su estado.
* Debe permitir consultar sus resultados.
* Los resultados deben permanecer disponibles después de finalizar el escaneo.

**Requisitos relacionados:** RF-019, RF-020.

---

# 5. Épica: Intrusion Detection System

## HU-014 — Detectar actividad sospechosa

**Como** analista de seguridad,
**quiero** que CyberGuard detecte actividades sospechosas,
**para** identificar posibles amenazas dentro del entorno controlado.

### Criterios de aceptación

* El IDS debe procesar eventos disponibles.
* Debe identificar eventos que coincidan con reglas configuradas.
* Debe generar un evento de seguridad.
* El evento debe ser enviado al sistema de gestión de eventos.

**Requisitos relacionados:** RF-026, RF-027.

---

## HU-015 — Registrar eventos del IDS

**Como** analista de seguridad,
**quiero** que los eventos detectados por el IDS sean almacenados,
**para** poder analizarlos posteriormente.

### Criterios de aceptación

* Los eventos deben almacenarse.
* Deben incluir fecha y hora.
* Deben indicar su origen.
* Deben incluir severidad cuando corresponda.

**Requisitos relacionados:** RF-028, RF-029, RF-030.

---

# 6. Épica: Gestión de eventos

## HU-016 — Centralizar eventos

**Como** analista de seguridad,
**quiero** recibir eventos de diferentes componentes en un único sistema,
**para** tener una visión centralizada de la actividad de seguridad.

### Criterios de aceptación

* CyberGuard debe recibir eventos del Scanner.
* Debe recibir eventos del IDS.
* Debe permitir incorporar otras fuentes.
* Los eventos deben almacenarse de forma estructurada.

**Requisitos relacionados:** RF-031, RF-039.

---

## HU-017 — Normalizar eventos

**Como** analista de seguridad,
**quiero** que los eventos tengan una estructura común,
**para** poder analizarlos independientemente de su fuente.

### Criterios de aceptación

* Los eventos deben transformarse a una estructura común.
* Deben conservar información relevante de su fuente.
* Deben poder ser procesados por el SIEM.

**Requisitos relacionados:** RF-032, RF-036.

---

## HU-018 — Consultar y filtrar eventos

**Como** analista de seguridad,
**quiero** consultar y filtrar eventos,
**para** encontrar rápidamente información relevante.

### Criterios de aceptación

* Debe ser posible consultar eventos.
* Debe poder filtrarse por fecha.
* Debe poder filtrarse por fuente.
* Debe poder filtrarse por tipo.
* Debe poder filtrarse por severidad.
* Debe poder filtrarse por activo o dirección IP.

**Requisitos relacionados:** RF-037, RF-038.

---

# 7. Épica: SIEM

## HU-019 — Procesar eventos

**Como** analista de seguridad,
**quiero** que el SIEM procese los eventos recibidos,
**para** determinar su relevancia y clasificación.

### Criterios de aceptación

* El SIEM debe recibir eventos.
* Debe procesarlos.
* Debe clasificarlos.
* Debe mantener la información original necesaria para su análisis.

**Requisitos relacionados:** RF-040.

---

## HU-020 — Correlacionar eventos

**Como** analista de seguridad,
**quiero** relacionar eventos que compartan características,
**para** identificar patrones que individualmente podrían no ser evidentes.

### Criterios de aceptación

* El sistema debe permitir utilizar criterios de correlación.
* Los criterios pueden incluir IP, activo, tipo y tiempo.
* Los eventos relacionados deben poder identificarse como parte de un mismo patrón.

**Requisitos relacionados:** RF-041.

---

## HU-021 — Crear reglas de correlación

**Como** administrador de seguridad,
**quiero** configurar reglas de correlación,
**para** definir qué patrones deben generar una alerta.

### Criterios de aceptación

* El usuario autorizado debe poder crear reglas.
* Debe poder definir condiciones.
* Debe poder activar o desactivar una regla.
* El SIEM debe utilizar las reglas activas durante el procesamiento.

**Requisitos relacionados:** RF-042, RF-044.

---

# 8. Épica: Alertas

## HU-022 — Generar alerta

**Como** analista de seguridad,
**quiero** recibir una alerta cuando se detecte una condición sospechosa,
**para** poder investigar el evento.

### Criterios de aceptación

* Una alerta debe generarse cuando se cumpla una regla.
* Debe estar asociada al evento o eventos correspondientes.
* Debe tener una severidad.
* Debe registrar fecha y hora.

**Requisitos relacionados:** RF-043, RF-045, RF-046.

---

## HU-023 — Gestionar alertas

**Como** analista de seguridad,
**quiero** gestionar el estado de las alertas,
**para** realizar seguimiento de las investigaciones.

### Criterios de aceptación

* El usuario debe poder consultar alertas.
* Debe poder cambiar su estado.
* Debe poder registrar acciones realizadas.
* El sistema debe conservar el historial.

**Requisitos relacionados:** RF-047, RF-048, RF-049, RF-050.

---

# 9. Épica: Gestión de incidentes

## HU-024 — Crear incidente

**Como** analista de seguridad,
**quiero** crear un incidente a partir de una alerta,
**para** iniciar formalmente una investigación.

### Criterios de aceptación

* El usuario debe poder crear un incidente desde una alerta.
* El incidente debe conservar la relación con la alerta.
* Debe tener un estado inicial.
* Debe tener una severidad.

**Requisitos relacionados:** RF-051, RF-054, RF-055.

---

## HU-025 — Investigar incidente

**Como** analista de seguridad,
**quiero** asociar eventos y alertas a un incidente,
**para** tener toda la información relacionada en un único lugar.

### Criterios de aceptación

* El incidente debe permitir asociar múltiples eventos.
* Debe permitir asociar múltiples alertas.
* Debe permitir registrar acciones.
* Debe mantener un historial de investigación.

**Requisitos relacionados:** RF-052, RF-053, RF-056, RF-057.

---

## HU-026 — Resolver incidente

**Como** analista de seguridad,
**quiero** cambiar el estado de un incidente hasta su resolución,
**para** mantener seguimiento del ciclo de vida del incidente.

### Criterios de aceptación

* El incidente debe poder pasar por diferentes estados.
* El sistema debe registrar los cambios.
* El incidente debe poder marcarse como resuelto y posteriormente cerrado.

**Requisitos relacionados:** RF-055, RF-056.

---

# 10. Épica: Dashboard

## HU-027 — Consultar estado general

**Como** analista de seguridad,
**quiero** visualizar un resumen del estado de seguridad,
**para** conocer rápidamente la situación actual de la infraestructura.

### Criterios de aceptación

El dashboard debe mostrar:

* Activos.
* Vulnerabilidades.
* Eventos.
* Alertas.
* Incidentes.

**Requisitos relacionados:** RF-058, RF-059.

---

## HU-028 — Visualizar vulnerabilidades

**Como** analista de seguridad,
**quiero** visualizar las vulnerabilidades agrupadas por severidad,
**para** identificar rápidamente los riesgos prioritarios.

### Criterios de aceptación

* El dashboard debe mostrar las vulnerabilidades.
* Debe diferenciar los niveles de severidad.
* Debe permitir acceder al detalle.

**Requisitos relacionados:** RF-060.

---

## HU-029 — Visualizar alertas

**Como** analista de seguridad,
**quiero** visualizar las alertas activas,
**para** saber qué situaciones requieren atención.

### Criterios de aceptación

* El dashboard debe mostrar alertas activas.
* Debe mostrar su severidad.
* Debe permitir acceder al detalle de una alerta.

**Requisitos relacionados:** RF-061.

---

## HU-030 — Visualizar eventos recientes

**Como** analista de seguridad,
**quiero** visualizar los eventos de seguridad recientes,
**para** identificar rápidamente actividad relevante.

### Criterios de aceptación

* El dashboard debe mostrar eventos recientes.
* Debe indicar la fecha y hora.
* Debe indicar la severidad.
* Debe indicar el origen.

**Requisitos relacionados:** RF-062.

---

## HU-031 — Monitorear eventos en tiempo real

**Como** analista de seguridad,
**quiero** recibir nuevos eventos en tiempo real,
**para** reaccionar rápidamente ante actividades sospechosas.

### Criterios de aceptación

* Los nuevos eventos deben aparecer sin necesidad de recargar manualmente la página.
* El dashboard debe actualizar la información relevante.
* Los eventos deben conservar su información de origen.

**Requisitos relacionados:** RF-064.

---

# 11. Épica: Reportes

## HU-032 — Generar reporte de vulnerabilidades

**Como** analista de seguridad,
**quiero** generar un reporte de vulnerabilidades,
**para** documentar el estado de seguridad de los activos.

### Criterios de aceptación

* El reporte debe incluir los hallazgos encontrados.
* Debe indicar la severidad.
* Debe indicar el activo afectado.
* Debe permitir consultar la información generada.

**Requisitos relacionados:** RF-068.

---

## HU-033 — Exportar información

**Como** analista de seguridad,
**quiero** exportar información de CyberGuard,
**para** utilizar los datos en herramientas externas o documentación.

### Criterios de aceptación

* El usuario debe poder seleccionar la información.
* El sistema debe generar un archivo en un formato soportado.
* La información exportada debe conservar los datos relevantes.

**Requisitos relacionados:** RF-071.

---

# 12. Épica: Auditoría

## HU-034 — Consultar auditoría

**Como** administrador,
**quiero** consultar las acciones realizadas por los usuarios,
**para** mantener trazabilidad sobre el uso de la plataforma.

### Criterios de aceptación

* El sistema debe registrar acciones relevantes.
* Debe identificar al usuario.
* Debe registrar fecha y hora.
* Debe identificar el recurso afectado.
* Los administradores deben poder consultar los registros.

**Requisitos relacionados:** RF-072, RF-073, RF-074.

---

# 13. Épica: Configuración

## HU-035 — Configurar reglas de seguridad

**Como** administrador de seguridad,
**quiero** administrar las reglas utilizadas por CyberGuard,
**para** adaptar la detección a las necesidades del entorno.

### Criterios de aceptación

* El usuario autorizado debe poder crear reglas.
* Debe poder modificar reglas.
* Debe poder activar o desactivar reglas.
* El sistema debe utilizar las reglas activas.

**Requisitos relacionados:** RF-076.

---

# 14. Épica: Security Lab

## HU-036 — Registrar servicios de prueba

**Como** administrador del laboratorio,
**quiero** registrar los servicios utilizados en el entorno de pruebas,
**para** mantener identificados los componentes sobre los cuales se realizarán los análisis.

### Criterios de aceptación

* El servicio debe estar asociado a un activo autorizado.
* Debe registrarse su información básica.
* Debe poder consultarse posteriormente.

**Requisitos relacionados:** RF-083.

---

## HU-037 — Ejecutar pruebas de seguridad

**Como** analista de seguridad,
**quiero** ejecutar análisis sobre los activos del laboratorio,
**para** comprobar el funcionamiento de los componentes de CyberGuard.

### Criterios de aceptación

* El objetivo debe pertenecer al laboratorio autorizado.
* El análisis debe ejecutarse correctamente.
* Los resultados deben registrarse.
* Los eventos generados deben poder ser procesados por CyberGuard.

**Requisitos relacionados:** RF-084.

---

## HU-038 — Generar eventos controlados

**Como** analista de seguridad,
**quiero** generar eventos controlados dentro del laboratorio,
**para** comprobar que el IDS y SIEM detectan y procesan correctamente las actividades.

### Criterios de aceptación

* Las pruebas deben realizarse únicamente dentro del entorno autorizado.
* Deben generar eventos identificables.
* El IDS debe poder detectar los eventos correspondientes.
* El SIEM debe recibir y procesar los eventos.

**Requisitos relacionados:** RF-085.

---

## HU-039 — Validar detecciones

**Como** analista de seguridad,
**quiero** verificar si CyberGuard detectó correctamente una actividad de prueba,
**para** validar el funcionamiento del sistema de seguridad.

### Criterios de aceptación

* El evento generado debe aparecer en CyberGuard.
* Debe registrarse correctamente.
* El SIEM debe procesarlo.
* Cuando corresponda, debe generarse una alerta.
* El resultado de la prueba debe poder verificarse.

**Requisitos relacionados:** RF-086.

---

# 15. Resumen de historias de usuario

| Épica                    | Historias       |
| ------------------------ | --------------- |
| Autenticación y usuarios | HU-001 — HU-004 |
| Gestión de activos       | HU-005 — HU-007 |
| Vulnerability Scanner    | HU-008 — HU-013 |
| IDS                      | HU-014 — HU-015 |
| Gestión de eventos       | HU-016 — HU-018 |
| SIEM                     | HU-019 — HU-021 |
| Alertas                  | HU-022 — HU-023 |
| Incidentes               | HU-024 — HU-026 |
| Dashboard                | HU-027 — HU-031 |
| Reportes                 | HU-032 — HU-033 |
| Auditoría                | HU-034          |
| Configuración            | HU-035          |
| Security Lab             | HU-036 — HU-039 |

**Total: 39 historias de usuario.**

---

# 16. Priorización inicial

Para facilitar el desarrollo, las historias se podrán priorizar de la siguiente manera:

### 🔴 Alta prioridad — MVP

* HU-001 — Registro de usuario
* HU-002 — Inicio de sesión
* HU-005 — Registrar activo
* HU-006 — Consultar activos
* HU-008 — Ejecutar escaneo
* HU-009 — Detectar puertos
* HU-010 — Detectar servicios
* HU-018 — Consultar y filtrar eventos
* HU-019 — Procesar eventos
* HU-022 — Generar alerta
* HU-027 — Consultar estado general

### 🟡 Media prioridad

* HU-011 — Identificar vulnerabilidades
* HU-012 — Clasificar vulnerabilidades
* HU-013 — Historial de escaneos
* HU-014 — Detectar actividad sospechosa
* HU-017 — Normalizar eventos
* HU-020 — Correlacionar eventos
* HU-023 — Gestionar alertas
* HU-024 — Crear incidente
* HU-025 — Investigar incidente
* HU-028 — Visualizar vulnerabilidades
* HU-029 — Visualizar alertas
* HU-030 — Visualizar eventos

### 🟢 Evolución

* HU-021 — Crear reglas de correlación
* HU-026 — Resolver incidente
* HU-031 — Tiempo real
* HU-032 — Reportes
* HU-033 — Exportación
* HU-034 — Auditoría
* HU-035 — Configuración
* HU-036 — Security Lab
* HU-037 — Pruebas de seguridad
* HU-038 — Eventos controlados
* HU-039 — Validación de detecciones
