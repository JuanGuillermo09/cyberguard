# Requisitos No Funcionales — CyberGuard

## 1. Introducción

Los requisitos no funcionales establecen las características de calidad, restricciones técnicas y condiciones bajo las cuales deberá operar CyberGuard.

Estos requisitos complementan los requisitos funcionales y permiten definir aspectos relacionados con seguridad, rendimiento, disponibilidad, escalabilidad, mantenibilidad, compatibilidad y usabilidad.

---

# 2. Seguridad

### RNF-001 — Autenticación segura

CyberGuard deberá implementar un mecanismo de autenticación que permita verificar la identidad de los usuarios antes de acceder a las funcionalidades protegidas.

### RNF-002 — Contraseñas

Las contraseñas de los usuarios no deberán almacenarse en texto plano. Deberán utilizarse mecanismos de hashing seguros para su almacenamiento.

### RNF-003 — Autorización

El sistema deberá implementar control de acceso basado en roles para restringir las funcionalidades según los permisos asignados a cada usuario.

### RNF-004 — Protección de credenciales

Las credenciales, claves secretas y demás información sensible no deberán almacenarse directamente dentro del código fuente.

### RNF-005 — Protección de API

Los endpoints protegidos de la API deberán requerir autenticación y autorización antes de permitir el acceso a información sensible.

### RNF-006 — Validación de datos

El sistema deberá validar los datos recibidos desde el frontend y otras fuentes antes de procesarlos o almacenarlos.

### RNF-007 — Protección contra ataques comunes

La aplicación deberá implementar medidas de protección contra vulnerabilidades comunes de aplicaciones web, incluyendo:

* Inyección SQL.
* Cross-Site Scripting (XSS).
* Cross-Site Request Forgery (CSRF), cuando aplique.
* Manipulación de parámetros.
* Acceso no autorizado.
* Exposición de información sensible.

### RNF-008 — Auditoría

Las operaciones relevantes realizadas por los usuarios deberán poder registrarse para facilitar la trazabilidad y auditoría del sistema.

---

# 3. Rendimiento

### RNF-009 — Tiempo de respuesta

Las operaciones habituales de consulta realizadas desde el dashboard deberán responder, en condiciones normales, en un tiempo objetivo inferior a **3 segundos**.

### RNF-010 — Procesamiento de escaneos

Los escaneos de seguridad deberán ejecutarse como procesos independientes para evitar bloquear las solicitudes normales de la API.

### RNF-011 — Procesamiento de eventos

El sistema deberá poder procesar eventos de seguridad sin afectar significativamente el funcionamiento del dashboard.

### RNF-012 — Consultas de información

Las consultas frecuentes deberán estar optimizadas para evitar tiempos de respuesta innecesarios.

---

# 4. Disponibilidad

### RNF-013 — Disponibilidad de la aplicación

CyberGuard deberá permanecer disponible mientras los servicios necesarios para su funcionamiento se encuentren activos en el equipo Windows.

### RNF-014 — Manejo de errores

El sistema deberá manejar errores de manera controlada evitando que una excepción en un componente provoque el cierre completo de la aplicación.

### RNF-015 — Recuperación

Ante errores de servicios o procesos, el sistema deberá proporcionar información suficiente para identificar la causa del problema y permitir su recuperación.

---

# 5. Escalabilidad

### RNF-016 — Arquitectura modular

CyberGuard deberá utilizar una arquitectura modular que permita agregar nuevos componentes de seguridad sin modificar completamente los componentes existentes.

### RNF-017 — Nuevas fuentes de eventos

La arquitectura deberá permitir incorporar nuevas fuentes de eventos de seguridad en futuras versiones.

### RNF-018 — Crecimiento de información

La base de datos deberá estar diseñada para soportar el crecimiento progresivo de:

* Activos.
* Escaneos.
* Vulnerabilidades.
* Eventos.
* Alertas.
* Incidentes.
* Registros de auditoría.

---

# 6. Mantenibilidad

### RNF-019 — Código estructurado

El código deberá seguir una estructura organizada y modular que facilite su comprensión y mantenimiento.

### RNF-020 — Separación de responsabilidades

Los componentes del sistema deberán mantener responsabilidades independientes.

La arquitectura deberá separar, como mínimo:

* Presentación.
* API.
* Lógica de negocio.
* Acceso a datos.
* Seguridad.
* Procesamiento de eventos.
* Scanner.
* IDS.
* SIEM.

### RNF-021 — Tipado

El backend y frontend deberán utilizar TypeScript para mejorar la seguridad de tipos y facilitar el mantenimiento del código.

### RNF-022 — Documentación

Los componentes principales del sistema deberán contar con documentación técnica suficiente para facilitar su mantenimiento y evolución.

### RNF-023 — Control de versiones

El código fuente deberá mantenerse bajo un sistema de control de versiones utilizando Git.

---

# 7. Usabilidad

### RNF-024 — Interfaz intuitiva

El dashboard deberá presentar la información de seguridad de forma clara y organizada para facilitar su interpretación.

### RNF-025 — Visualización de severidad

Las vulnerabilidades y alertas deberán mostrar claramente su nivel de severidad.

### RNF-026 — Navegación

El usuario deberá poder acceder a las principales funcionalidades mediante una estructura de navegación consistente.

### RNF-027 — Mensajes de error

Los errores mostrados al usuario deberán proporcionar información clara sin exponer información técnica o sensible innecesaria.

---

# 8. Compatibilidad

### RNF-028 — Sistema operativo

La aplicación deberá estar diseñada para ejecutarse sobre sistemas operativos Windows compatibles con las versiones soportadas por el proyecto.

### RNF-029 — Navegadores

El dashboard deberá ser compatible con navegadores web modernos basados en Chromium y navegadores compatibles con las características utilizadas por Angular.

### RNF-030 — Herramientas de desarrollo

El entorno de desarrollo deberá poder configurarse utilizando herramientas compatibles con Windows, incluyendo:

* Node.js.
* Python.
* PostgreSQL.
* Git.
* PowerShell.
* Visual Studio Code.

---

# 9. Integridad de datos

### RNF-031 — Integridad

La base de datos deberá mantener la integridad de las relaciones entre usuarios, activos, escaneos, vulnerabilidades, eventos, alertas e incidentes.

### RNF-032 — Persistencia

Los datos registrados por CyberGuard deberán mantenerse disponibles después del cierre y reinicio de la aplicación.

### RNF-033 — Consistencia

Las operaciones de escritura deberán garantizar que los datos almacenados mantengan un estado consistente.

---

# 10. Privacidad

### RNF-034 — Protección de información sensible

CyberGuard deberá limitar el acceso a información sensible únicamente a usuarios autorizados.

### RNF-035 — Minimización de información

El sistema deberá almacenar únicamente la información necesaria para cumplir con las funcionalidades definidas.

### RNF-036 — Información de seguridad

Los eventos, direcciones IP, servicios y demás información recopilada deberán utilizarse únicamente dentro de entornos propios, autorizados o controlados.

---

# 11. Trazabilidad

### RNF-037 — Registro de eventos

Los eventos relevantes deberán conservar información suficiente para identificar:

* Fecha y hora.
* Fuente.
* Tipo de evento.
* Severidad.
* Activo involucrado.
* Información relacionada.

### RNF-038 — Historial

El sistema deberá mantener un historial de escaneos, eventos, alertas e incidentes para permitir su consulta posterior.

### RNF-039 — Identificación de eventos

Cada evento registrado deberá contar con un identificador único.

---

# 12. Interoperabilidad

### RNF-040 — API REST

El backend deberá proporcionar una API REST para permitir la comunicación entre el frontend y los servicios internos de CyberGuard.

### RNF-041 — Formato de intercambio

Los datos intercambiados mediante la API deberán utilizar JSON como formato principal.

### RNF-042 — Comunicación en tiempo real

El sistema podrá utilizar WebSockets para transmitir eventos y actualizaciones de seguridad en tiempo real al dashboard.

---

# 13. Pruebas

### RNF-043 — Pruebas unitarias

Los componentes críticos deberán contar con pruebas unitarias para validar su funcionamiento.

### RNF-044 — Pruebas de integración

Los componentes principales deberán someterse a pruebas de integración para verificar la correcta comunicación entre ellos.

### RNF-045 — Pruebas de seguridad

Las funcionalidades relacionadas con autenticación, autorización, validación de datos y procesamiento de eventos deberán someterse a pruebas de seguridad.

---

# 14. Despliegue y configuración

### RNF-046 — Configuración externa

Las configuraciones específicas del entorno deberán mantenerse separadas del código fuente.

### RNF-047 — Variables de entorno

La información sensible y las configuraciones dependientes del entorno deberán gestionarse mediante variables de entorno o mecanismos equivalentes.

### RNF-048 — Instalación

El proyecto deberá proporcionar documentación suficiente para permitir la instalación y configuración de CyberGuard en un equipo Windows compatible.

---

# 15. Restricciones de seguridad

### RNF-049 — Uso autorizado

Las funcionalidades de análisis, escaneo y detección deberán utilizarse únicamente sobre sistemas propios, autorizados o pertenecientes al laboratorio controlado de CyberGuard.

### RNF-050 — Entorno controlado

Las pruebas de seguridad deberán realizarse en entornos controlados con el objetivo de evitar afectar sistemas o redes no autorizadas.

---

# 16. Resumen

CyberGuard deberá cumplir con los siguientes principios de calidad:

| Categoría         | Requisito principal                          |
| ----------------- | -------------------------------------------- |
| Seguridad         | Proteger usuarios, datos y API               |
| Rendimiento       | Responder rápidamente a consultas habituales |
| Disponibilidad    | Mantener los servicios operativos            |
| Escalabilidad     | Permitir incorporar nuevos componentes       |
| Mantenibilidad    | Mantener código modular y documentado        |
| Usabilidad        | Facilitar la interpretación de información   |
| Compatibilidad    | Ejecutarse sobre Windows                     |
| Integridad        | Mantener información consistente             |
| Privacidad        | Proteger información sensible                |
| Trazabilidad      | Mantener historial de eventos                |
| Interoperabilidad | Permitir comunicación mediante API           |
| Pruebas           | Validar funcionamiento y seguridad           |
| Configuración     | Separar configuración y código               |
| Uso responsable   | Limitar las pruebas a entornos autorizados   |
