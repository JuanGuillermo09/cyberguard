# Requisitos Funcionales — CyberGuard

## 1. Introducción

Los requisitos funcionales definen las funcionalidades que deberá proporcionar CyberGuard para cumplir con los objetivos establecidos en el documento de visión.

El sistema estará compuesto por módulos de autenticación, gestión de usuarios, gestión de activos, análisis de vulnerabilidades, detección de intrusiones, gestión de eventos, SIEM, alertas, incidentes, dashboard y reportes.

---

# 2. Autenticación y usuarios

### RF-001 — Registro de usuarios

El sistema deberá permitir registrar nuevos usuarios proporcionando la información requerida para crear una cuenta.

### RF-002 — Inicio de sesión

El sistema deberá permitir a los usuarios autenticarse mediante sus credenciales.

### RF-003 — Cierre de sesión

El sistema deberá permitir al usuario cerrar su sesión de forma segura.

### RF-004 — Gestión de usuarios

Los usuarios con permisos administrativos deberán poder consultar, crear, modificar y desactivar cuentas de usuario.

### RF-005 — Gestión de roles

El sistema deberá permitir asignar roles a los usuarios.

Los roles iniciales serán:

* Administrador.
* Analista de seguridad.
* Usuario.

### RF-006 — Control de permisos

El sistema deberá restringir el acceso a funcionalidades de acuerdo con el rol y los permisos asignados al usuario.

---

# 3. Gestión de activos

### RF-007 — Registrar activo

El sistema deberá permitir registrar activos que serán objeto de monitoreo y análisis.

La información podrá incluir:

* Nombre.
* Dirección IP.
* Tipo de activo.
* Sistema operativo.
* Descripción.
* Estado.

### RF-008 — Consultar activos

El sistema deberá permitir consultar los activos registrados.

### RF-009 — Modificar activo

Los usuarios autorizados deberán poder modificar la información de un activo.

### RF-010 — Desactivar activo

Los usuarios autorizados deberán poder desactivar un activo sin eliminar necesariamente su historial.

### RF-011 — Consultar información de activo

El sistema deberá permitir consultar el historial asociado a un activo, incluyendo:

* Escaneos.
* Vulnerabilidades.
* Eventos.
* Alertas.

---

# 4. Vulnerability Scanner

### RF-012 — Crear escaneo

El sistema deberá permitir a un usuario autorizado iniciar un análisis de seguridad sobre un activo registrado.

### RF-013 — Validar objetivo

Antes de ejecutar un escaneo, el sistema deberá verificar que el objetivo corresponda a un activo autorizado dentro del entorno configurado.

### RF-014 — Escanear puertos

El scanner deberá identificar los puertos TCP disponibles dentro del rango definido para el análisis.

### RF-015 — Detectar puertos abiertos

El scanner deberá identificar y registrar los puertos que se encuentren abiertos.

### RF-016 — Detectar servicios

El scanner deberá intentar identificar los servicios asociados a los puertos encontrados.

### RF-017 — Detectar versiones

Cuando sea posible, el scanner deberá identificar la versión del servicio detectado.

### RF-018 — Registrar resultados

Los resultados obtenidos durante un escaneo deberán almacenarse en PostgreSQL.

### RF-019 — Historial de escaneos

El sistema deberá permitir consultar el historial de escaneos realizados.

### RF-020 — Estado del escaneo

Cada escaneo deberá mantener un estado.

Los estados iniciales serán:

```text
PENDING
RUNNING
COMPLETED
FAILED
CANCELLED
```

### RF-021 — Identificar vulnerabilidades

El sistema deberá analizar los resultados obtenidos por el scanner para identificar posibles vulnerabilidades conocidas.

### RF-022 — Integración con CVE

El sistema deberá permitir relacionar servicios y versiones detectadas con información de vulnerabilidades conocidas mediante identificadores CVE.

### RF-023 — Clasificar vulnerabilidades

Las vulnerabilidades identificadas deberán clasificarse según su nivel de severidad.

Los niveles serán:

```text
INFO
LOW
MEDIUM
HIGH
CRITICAL
```

### RF-024 — Consultar vulnerabilidades

El usuario autorizado deberá poder consultar las vulnerabilidades detectadas.

### RF-025 — Filtrar vulnerabilidades

El sistema deberá permitir filtrar vulnerabilidades por:

* Severidad.
* Activo.
* Servicio.
* Estado.
* Fecha de detección.

---

# 5. Intrusion Detection System

### RF-026 — Capturar eventos de seguridad

El IDS deberá recopilar eventos relacionados con actividades sospechosas detectadas dentro del entorno controlado.

### RF-027 — Identificar actividad sospechosa

El sistema deberá identificar patrones de actividad que coincidan con reglas o firmas configuradas.

### RF-028 — Registrar eventos IDS

Los eventos generados por el IDS deberán almacenarse en CyberGuard.

### RF-029 — Clasificar eventos IDS

Los eventos deberán clasificarse de acuerdo con su tipo y severidad.

### RF-030 — Asociar eventos con activos

Cuando sea posible, el sistema deberá relacionar un evento IDS con el activo de origen y/o destino correspondiente.

---

# 6. Gestión de eventos

### RF-031 — Recibir eventos

CyberGuard deberá permitir recibir eventos provenientes de diferentes fuentes.

Las fuentes iniciales serán:

* Vulnerability Scanner.
* IDS.
* Aplicaciones.
* Servicios del sistema.

### RF-032 — Normalizar eventos

El sistema deberá transformar los eventos recibidos a una estructura común para facilitar su análisis.

### RF-033 — Identificar eventos

Cada evento deberá contar con un identificador único.

### RF-034 — Registrar fecha y hora

Cada evento deberá almacenar la fecha y hora en que fue generado o recibido.

### RF-035 — Registrar origen

El sistema deberá registrar la fuente que generó cada evento.

### RF-036 — Clasificar eventos

Los eventos deberán clasificarse según:

* Tipo.
* Fuente.
* Severidad.
* Activo relacionado.

### RF-037 — Consultar eventos

El usuario autorizado deberá poder consultar los eventos almacenados.

### RF-038 — Filtrar eventos

El sistema deberá permitir filtrar eventos por:

* Fecha.
* Fuente.
* Tipo.
* Severidad.
* Activo.
* Dirección IP.

---

# 7. SIEM

### RF-039 — Centralizar eventos

El SIEM deberá centralizar los eventos provenientes de los diferentes componentes de CyberGuard.

### RF-040 — Procesar eventos

El SIEM deberá procesar los eventos recibidos para determinar su clasificación y relevancia.

### RF-041 — Correlacionar eventos

El SIEM deberá permitir relacionar eventos que compartan características comunes, como:

* Dirección IP.
* Activo.
* Tipo de evento.
* Intervalo de tiempo.
* Patrón de actividad.

### RF-042 — Detectar patrones

El SIEM deberá ejecutar reglas de correlación para identificar patrones potencialmente relacionados con incidentes de seguridad.

### RF-043 — Generar alertas

Cuando un evento o conjunto de eventos cumpla una regla de seguridad, el SIEM deberá generar una alerta.

### RF-044 — Registrar reglas de correlación

El sistema deberá permitir definir reglas utilizadas para identificar patrones de seguridad.

---

# 8. Gestión de alertas

### RF-045 — Crear alerta

CyberGuard deberá crear automáticamente alertas cuando se cumplan las condiciones definidas por el sistema.

### RF-046 — Clasificar alerta

Cada alerta deberá tener un nivel de severidad:

```text
INFO
LOW
MEDIUM
HIGH
CRITICAL
```

### RF-047 — Consultar alertas

Los usuarios autorizados deberán poder consultar las alertas generadas.

### RF-048 — Filtrar alertas

El sistema deberá permitir filtrar alertas por:

* Severidad.
* Estado.
* Fecha.
* Fuente.
* Activo.

### RF-049 — Cambiar estado de alerta

Los usuarios autorizados deberán poder cambiar el estado de una alerta.

Estados iniciales:

```text
NEW
IN_PROGRESS
RESOLVED
DISMISSED
```

### RF-050 — Registrar acciones

El sistema deberá registrar las acciones realizadas sobre una alerta.

---

# 9. Gestión de incidentes

### RF-051 — Crear incidente

Los usuarios autorizados deberán poder crear un incidente a partir de una alerta o evento de seguridad.

### RF-052 — Asociar eventos

Un incidente deberá poder relacionarse con uno o varios eventos de seguridad.

### RF-053 — Asociar alertas

Un incidente deberá poder relacionarse con una o varias alertas.

### RF-054 — Clasificar incidente

Los incidentes deberán clasificarse según su nivel de severidad.

### RF-055 — Gestionar estado

Los incidentes deberán manejar diferentes estados:

```text
OPEN
INVESTIGATING
CONTAINED
RESOLVED
CLOSED
```

### RF-056 — Registrar acciones del incidente

El sistema deberá permitir registrar las acciones realizadas durante la investigación y resolución de un incidente.

### RF-057 — Consultar historial

El sistema deberá permitir consultar el historial completo de un incidente.

---

# 10. Dashboard

### RF-058 — Mostrar resumen de seguridad

El dashboard deberá mostrar un resumen general del estado de seguridad.

### RF-059 — Mostrar estadísticas

El sistema deberá mostrar estadísticas relacionadas con:

* Activos.
* Vulnerabilidades.
* Eventos.
* Alertas.
* Incidentes.

### RF-060 — Mostrar vulnerabilidades por severidad

El dashboard deberá mostrar la distribución de vulnerabilidades según su nivel de severidad.

### RF-061 — Mostrar alertas activas

El dashboard deberá mostrar las alertas que requieran atención.

### RF-062 — Mostrar eventos recientes

El dashboard deberá mostrar los eventos de seguridad más recientes.

### RF-063 — Mostrar actividad temporal

El sistema deberá permitir visualizar la cantidad de eventos y alertas durante diferentes períodos de tiempo.

### RF-064 — Actualización en tiempo real

El dashboard deberá actualizar información relevante en tiempo real mediante WebSockets cuando esta funcionalidad esté disponible.

---

# 11. Búsqueda y filtros

### RF-065 — Búsqueda global

El sistema deberá permitir buscar información relevante dentro de los módulos disponibles.

### RF-066 — Filtrar información

Los módulos de activos, vulnerabilidades, eventos, alertas e incidentes deberán proporcionar mecanismos de filtrado.

### RF-067 — Ordenar resultados

El sistema deberá permitir ordenar resultados según los campos relevantes de cada módulo.

---

# 12. Reportes

### RF-068 — Generar reporte de vulnerabilidades

El sistema deberá permitir generar un reporte con las vulnerabilidades detectadas.

### RF-069 — Generar reporte de eventos

El sistema deberá permitir generar reportes relacionados con eventos de seguridad.

### RF-070 — Generar reporte de alertas

El sistema deberá permitir generar reportes de alertas generadas durante un período determinado.

### RF-071 — Exportar información

El sistema deberá permitir exportar información seleccionada en formatos adecuados para su análisis posterior.

---

# 13. Auditoría

### RF-072 — Registrar acciones de usuarios

CyberGuard deberá registrar las operaciones relevantes realizadas por usuarios autenticados.

### RF-073 — Consultar registros de auditoría

Los usuarios con permisos administrativos deberán poder consultar los registros de auditoría.

### RF-074 — Registrar información de auditoría

Los registros deberán incluir, cuando corresponda:

* Usuario.
* Acción.
* Fecha.
* Hora.
* Recurso afectado.
* Resultado de la operación.

---

# 14. Configuración del sistema

### RF-075 — Configurar parámetros

Los usuarios administradores deberán poder configurar parámetros generales del sistema.

### RF-076 — Configurar reglas de seguridad

Los usuarios autorizados deberán poder administrar las reglas utilizadas por el sistema de detección y correlación.

### RF-077 — Configurar niveles de severidad

El sistema deberá permitir establecer los criterios utilizados para clasificar eventos, vulnerabilidades y alertas.

---

# 15. Integración entre componentes

### RF-078 — Comunicación Frontend-Backend

Angular deberá comunicarse con el backend mediante la API REST de CyberGuard.

### RF-079 — Comunicación con Scanner

El backend deberá poder iniciar y consultar procesos de análisis ejecutados por el Vulnerability Scanner.

### RF-080 — Comunicación con IDS

El backend deberá poder recibir eventos generados por el IDS.

### RF-081 — Comunicación con SIEM

Los diferentes componentes deberán enviar información al SIEM para su procesamiento y correlación.

### RF-082 — Persistencia

Los resultados generados por los componentes deberán almacenarse en PostgreSQL cuando corresponda.

---

# 16. Gestión del laboratorio de seguridad

### RF-083 — Registrar servicios de prueba

El sistema deberá permitir identificar y registrar los servicios utilizados dentro del entorno controlado de pruebas.

### RF-084 — Ejecutar análisis sobre laboratorio

El usuario deberá poder ejecutar análisis de seguridad sobre los activos autorizados del laboratorio.

### RF-085 — Generar eventos de prueba

El entorno de pruebas deberá permitir generar eventos controlados para validar el funcionamiento del IDS, SIEM y sistema de alertas.

### RF-086 — Validar detecciones

El sistema deberá permitir comprobar si los eventos generados durante las pruebas fueron correctamente detectados, procesados y registrados.

---

# 17. Resumen de módulos funcionales

| Módulo                   | Requisitos      |
| ------------------------ | --------------- |
| Autenticación y usuarios | RF-001 — RF-006 |
| Gestión de activos       | RF-007 — RF-011 |
| Vulnerability Scanner    | RF-012 — RF-025 |
| IDS                      | RF-026 — RF-030 |
| Eventos                  | RF-031 — RF-038 |
| SIEM                     | RF-039 — RF-044 |
| Alertas                  | RF-045 — RF-050 |
| Incidentes               | RF-051 — RF-057 |
| Dashboard                | RF-058 — RF-064 |
| Búsqueda y filtros       | RF-065 — RF-067 |
| Reportes                 | RF-068 — RF-071 |
| Auditoría                | RF-072 — RF-074 |
| Configuración            | RF-075 — RF-077 |
| Integraciones            | RF-078 — RF-082 |
| Security Lab             | RF-083 — RF-086 |

---

# 18. Criterio general

Cada requisito funcional deberá poder ser validado mediante pruebas que permitan determinar si la funcionalidad correspondiente fue implementada correctamente.

Los requisitos deberán mantenerse relacionados con las historias de usuario, casos de prueba y componentes técnicos de CyberGuard durante el desarrollo.
