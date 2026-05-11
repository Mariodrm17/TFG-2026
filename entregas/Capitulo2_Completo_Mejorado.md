# Capítulo 2: Ingeniería de Requisitos y Modelo del Dominio

---

## 1. Introducción

El presente capítulo constituye el puente fundamental entre el diagnóstico de la problemática operativa actual —descrita en el almacén de Santander gestionado por Intermodal Sea Solutions para la cuenta de James Hardie Iberia S.L.— y el diseño técnico de la solución informática propuesta. Su objetivo principal es **dirigir el desarrollo hacia el sistema correcto**, estableciendo un marco de comprensión unívoco entre todas las partes implicadas: el cliente corporativo, los usuarios finales (operarios y supervisores) y el equipo de ingeniería responsable del desarrollo.

Para alcanzar dicho objetivo, el capítulo se articula en torno a dos grandes bloques metodológicos complementarios:

- **Modelo del Dominio:** abstracción conceptual de la realidad del negocio logístico mediante diagramas UML (clases, objetos y estados), un glosario de términos acordado con el cliente y la especificación de los requisitos suplementarios (no funcionales) que condicionarán las decisiones arquitectónicas del capítulo siguiente.

- **Disciplina de Requisitos:** identificación y priorización de actores y casos de uso, especificación detallada de los flujos de interacción más relevantes, prototipado conceptual de interfaces y diagrama de contexto del sistema. La trazabilidad entre todos estos artefactos garantiza que ningún requisito quede sin origen justificado ni sin implementación prevista.

La información aquí formalizada procede de las sesiones de elicitación realizadas con el supervisor del almacén, la dirección de Intermodal Sea Solutions y la observación directa del trabajo de los operarios. El resultado constituye el acuerdo formal sobre **qué debe hacer el sistema**, base imprescindible para el análisis y diseño que se desarrollarán en el Capítulo 3.

---

## 2. Modelo del Dominio

Con el objetivo de comprender la estructura y la dinámica de interacción logística sin incurrir en restricciones tecnológicas previas, se elabora un Modelo del Dominio que abstrae e identifica los elementos conceptuales del ecosistema de negocio y sus vínculos. El modelado sigue las convenciones de Larman (2004) para la construcción de modelos del dominio conceptuales, diferenciando explícitamente las clases conceptuales de las clases de implementación.

### 2.1 Diagrama de Clases

El siguiente diagrama ilustra las entidades físicas y funcionales que operan interdependientemente en el recinto del almacén. Se han aplicado las convenciones UML estándar: la **composición** (rombo relleno) representa una dependencia existencial entre contenedor y contenido; la **agregación** (rombo vacío) indica una relación de pertenencia sin dependencia vital; y la **asociación simple** denota una interacción navegable entre clases independientes.

> *[Insertar aquí el Diagrama de Clases — archivo: Diagrama de Clases.png]*

**Descripción de las clases del dominio:**

**Almacen** es la entidad física central del sistema. Representa el recinto logístico ubicado en Santander (P.I. Norte) donde se gestiona el inventario de James Hardie. Contiene 38 sectores y una superficie de 4.200 m². Sus operaciones principales son el cálculo de la ocupación global y la autorización de movimientos.

**Sector** representa cada una de las 38 subdivisiones físicas del almacén, identificadas mediante un código alfanumérico único (ej. "B4"). Cada sector tiene una capacidad máxima de palés y un contador dinámico de palés actuales. El método `calcularSaturacion()` devuelve el porcentaje de ocupación en tiempo real, base del sistema de semáforo cromático de la interfaz.

**Pale** (palé) es la unidad mínima de mercancía gestionada por el sistema. Cada palé pertenece a James Hardie, está identificado por un código de referencia único (ej. "JH-8819-A"), tiene un tipo de material, una masa en kilogramos y un estado en el ciclo de vida (modelado mediante `EstadoPale`).

**Movimiento** es el registro transaccional de cada operación que afecta a un palé. Almacena el sello temporal, el tipo de operación (`TipoMovimiento`: ENTRADA, SALIDA, REUBICACION), los sectores de origen y destino, las posibles incidencias y la IP del dispositivo desde el que se registró. Constituye el log de auditoría completo del sistema.

**Operario** representa a cualquier usuario humano del sistema. Posee credenciales de acceso y un rol (`RolOperario`: OPERARIO o ADMINISTRADOR) que determina qué casos de uso puede ejecutar.

**Cliente** representa a James Hardie Iberia S.L., el único cliente corporativo gestionado en este módulo. El modelo permite la extensión futura a múltiples clientes.

**Descripción de las relaciones:**

- `Almacen` ◆── `Sector` *(Composición 1 a 1..*):* Un almacén se compone de uno o varios sectores. Si el almacén desaparece del sistema, sus sectores dejan de tener existencia propia. En el contexto actual: 38 sectores.

- `Sector` ◇── `Pale` *(Agregación 1 a 0..*):* Un sector puede contener cero o más palés en un momento dado. Los palés existen como entidades independientes aunque cambien de sector.

- `Pale` ──► `Movimiento` *(Asociación 1 a 1..*):* Cada palé es objeto de al menos un movimiento a lo largo de su ciclo de vida (entrada). Puede tener múltiples movimientos si es reubicado o expedido.

- `Operario` ──► `Movimiento` *(Asociación 1 a *):* Un operario registra cero o muchos movimientos. Cada movimiento es registrado por exactamente un operario.

- `Almacen` ──── `Cliente` *(Asociación 1 a 1):* El almacén gestiona el inventario de un único cliente corporativo, James Hardie, en el contexto actual.

---

### 2.2 Diagrama de Objetos

El Diagrama de Objetos proyecta una instantánea del recinto logístico en un instante temporal concreto, instanciando el modelo conceptual anterior. Este tipo de diagrama sirve para verificar que el modelo de clases es correcto confrontándolo con datos reales del negocio (Larman, 2004).

El instante modelado corresponde a una operación de descarga real registrada en turno de tarde el 12 de mayo de 2026:

> *[Insertar aquí el Diagrama de Objetos — archivo: Diagrama de objetos.png]*

El diagrama confirma que el modelo de clases captura correctamente la operativa real: el operario **Diego Martínez** (turno tarde, rol OPERARIO) registra la entrada del palé **JH-8819-A** (840 kg de Pizarras Ensacadas) en el sector **B4** del almacén de Santander, generando el movimiento transaccional **MOV-10234** (ENTRADA, 12-05-2026 16:45:00) que queda vinculado a ambas entidades. El sector B4 pasa de 11 a 12 palés actuales, incrementando su saturación del 91,6% al 100%.

---

### 2.3 Diagrama de Estados

Para garantizar la trazabilidad completa de la mercancía, el siguiente autómata de estados refleja el ciclo de vida por el que transita una unidad de palé desde que llega a los muelles hasta que abandona las instalaciones. Se incorporan estados de excepción imprescindibles para representar situaciones reales de incidencia operativa.

> *[Insertar aquí el Diagrama de Estados — archivo: Diagrama de Estados.png]*

**Descripción de los estados:**

| Estado | Descripción | Condición de entrada |
|---|---|---|
| **Recepcionado** | El palé ha llegado físicamente al muelle de descarga pero no tiene sector asignado en el sistema. El operario ha iniciado el registro de entrada. | `descargaTrailer(camionId)` |
| **Emplazado** | El palé tiene sector asignado en el sistema y está físicamente ubicado. Es el estado de reposo normal. | `asignarSector(sectorId)` con `sector.estaDisponible()` |
| **Reemplazado** | El palé está en tránsito entre dos sectores por una operación de reubicación. Estado transitorio. | `solicitarReubicacion(destinoId)` con `destino.estaDisponible()` |
| **En preparación** | El palé ha sido incluido en una orden de expedición pendiente de aprobación. | `solicitarPicking(ordenId)` con `orden.estaAutorizada()` |
| **Expedido** | El palé ha salido físicamente del almacén tras aprobación del supervisor. Estado terminal normal. | `aprobarCarga(supervisorId)` con `documentacion.valida()` |
| **Incidencia** | El palé presenta una anomalía (daño físico, discrepancia documental) que impide seguir el flujo normal. | `detectarError()` en recepción o emplazado |
| **Cancelado** | La orden de preparación fue rechazada o cancelada antes de la expedición. | `rechazarOrden()` o timeout de aprobación |

---

### 2.4 Glosario de Términos

El siguiente glosario recoge el vocabulario acordado con el cliente (Intermodal Sea Solutions) y los usuarios finales durante las sesiones de elicitación. Su objetivo es establecer un lenguaje común que elimine ambigüedades en la comunicación entre el equipo de desarrollo y las partes interesadas del negocio (Sommerville, 2015).

| Término | Definición en el contexto del sistema |
|---|---|
| **Almacén** | Recinto logístico ubicado en el Polígono Industrial Norte de Santander, gestionado por Intermodal Sea Solutions para la cuenta de James Hardie. Superficie: 4.200 m². Capacidad: 38 sectores. |
| **Sector** | Cada una de las 38 subdivisiones físicas del almacén, identificadas por un código alfanumérico único (ej. "B4", "A1"). Unidad mínima de gestión espacial del sistema. |
| **Palé** | Unidad de carga física que agrupa mercancía de James Hardie sobre una base de madera normalizada. Unidad mínima de gestión de inventario. Identificado por un código de referencia único (ej. "JH-8819-A"). |
| **Entrada** | Operación de registro de la llegada de un palé al almacén. Genera un movimiento de tipo ENTRADA y cambia el estado del palé de *Recepcionado* a *Emplazado*. |
| **Expedición** | Operación de salida autorizada de un palé del almacén hacia el cliente o destino final. Genera un movimiento de tipo SALIDA y cambia el estado del palé a *Expedido*. |
| **Reubicación** | Operación de traslado de un palé entre dos sectores del mismo almacén. Genera un movimiento de tipo REUBICACION. Estado transitorio: *Reemplazado*. |
| **Saturación** | Porcentaje de ocupación de un sector en un momento dado: `(paleActuales / capacidadMax) * 100`. Determina el color del semáforo en el layout virtual (verde / ámbar / rojo). |
| **Layout virtual** | Representación visual interactiva del estado de ocupación de los 38 sectores del almacén en tiempo real. Pantalla principal del módulo web. |
| **Semáforo de saturación** | Sistema de codificación cromática del layout: verde (0–60%), ámbar (61–85%), rojo (86–100%). |
| **Movimiento** | Registro transaccional de cualquier operación que altera el estado o la ubicación de un palé. Constituye el log de auditoría del sistema. |
| **Turno** | Período de trabajo de un operario. Actualmente: mañana (06:00–14:00), tarde (14:00–22:00) y noche (22:00–06:00). |
| **Rollship** | Sistema de gestión corporativo externo utilizado por James Hardie para el seguimiento de su inventario. Consume los datos del módulo logístico mediante API REST. |
| **ETL** | Extract, Transform, Load. Proceso de migración de los datos históricos almacenados en el sistema MS Access legado hacia la nueva base de datos MySQL. |
| **Picking** | Proceso de selección y preparación de palés para su expedición, previo a la aprobación por parte del supervisor. |
| **Incidencia** | Situación anómala que afecta a un palé y que impide el flujo operativo normal: daño físico, discrepancia en el código de referencia o diferencia entre el contenido declarado y el real. |
| **Módulo Logístico Web** | Sistema informático objeto de este TFG. Aplicación web desarrollada con Laravel y MySQL que sustituye al sistema MS Access legado para la gestión del inventario del almacén de Santander. |
| **MVP** | Minimum Viable Product (Producto Mínimo Viable). Versión funcional mínima del sistema que cubre los casos de uso clasificados como *Must Have* (UC-01, UC-02, UC-03). |

---

### 2.5 Requisitos Suplementarios

Los requisitos suplementarios —también denominados requisitos no funcionales— especifican las propiedades de calidad que debe exhibir el sistema más allá de lo que hace: cómo de rápido, seguro, fiable, usable y mantenible debe ser (Sommerville, 2015; Pressman & Maxim, 2020). Estos requisitos condicionarán directamente las decisiones de arquitectura, tecnología y diseño del Capítulo 3.

#### RS-01 — Rendimiento

| Identificador | RS-01 |
|---|---|
| **Categoría** | Rendimiento |
| **Descripción** | El layout virtual debe cargarse y renderizarse completamente en menos de **1,5 segundos** desde la solicitud HTTP, medido en la red interna del almacén (LAN 100 Mbps). Las operaciones de escritura (registro de entrada, expedición, reubicación) deben confirmarse al usuario en menos de **2 segundos**. |
| **Justificación** | Los operarios trabajan en entornos dinámicos con alta presión temporal. Una respuesta lenta genera errores operativos y pérdida de confianza en el sistema. |
| **Métrica de verificación** | Prueba de carga con Apache JMeter simulando 5 operarios concurrentes. |

#### RS-02 — Disponibilidad

| Identificador | RS-02 |
|---|---|
| **Categoría** | Fiabilidad |
| **Descripción** | El sistema debe estar disponible el **99,5%** del tiempo durante el horario operativo del almacén (06:00–22:00, de lunes a sábado). Las ventanas de mantenimiento deben planificarse fuera de dicho horario. |
| **Justificación** | El almacén opera en tres turnos. Una caída del sistema en horario de trabajo paraliza el registro de operaciones y obliga a un retorno al papel, generando inconsistencias en el inventario. |
| **Métrica de verificación** | Monitorización de uptime con herramienta de alertas (ej. UptimeRobot). |

#### RS-03 — Seguridad y Control de Acceso

| Identificador | RS-03 |
|---|---|
| **Categoría** | Seguridad |
| **Descripción** | El acceso al sistema requiere autenticación mediante credenciales únicas por usuario. Las contraseñas se almacenarán con hash bcrypt (factor de coste ≥ 12). Las sesiones expirarán tras **30 minutos** de inactividad. El rol OPERARIO no podrá modificar ni eliminar registros de movimientos ya confirmados; solo el ADMINISTRADOR dispondrá de dicho privilegio. |
| **Justificación** | La trazabilidad del inventario tiene implicaciones legales y contractuales con James Hardie. La manipulación no autorizada de registros históricos comprometería la integridad del sistema. |
| **Métrica de verificación** | Revisión de código y pruebas de penetración básicas (OWASP Top 10). |

#### RS-04 — Usabilidad

| Identificador | RS-04 |
|---|---|
| **Categoría** | Usabilidad |
| **Descripción** | La interfaz debe ser operable con **guantes de trabajo** y en condiciones de **iluminación variable**. Los elementos interactivos (botones, celdas del layout) tendrán un área táctil mínima de **60×60 px**. El contraste de los colores del semáforo cumplirá el estándar WCAG 2.1 nivel AA. Un operario sin formación técnica previa debe ser capaz de registrar una entrada o expedición correctamente tras una sesión de entrenamiento de **menos de 15 minutos**. |
| **Justificación** | El perfil de usuario primario (Operario de Pista) trabaja en condiciones físicas exigentes. Una interfaz no adaptada a su contexto físico real derivará en errores de registro o abandono del sistema. |
| **Métrica de verificación** | Test de usabilidad con 3 operarios reales utilizando el protocolo *think-aloud*. |

#### RS-05 — Compatibilidad y Portabilidad

| Identificador | RS-05 |
|---|---|
| **Categoría** | Portabilidad |
| **Descripción** | El sistema debe funcionar correctamente en los navegadores **Chrome 110+**, **Firefox 110+** y **Safari 16+**, tanto en dispositivos de escritorio como en tablets y smartphones con resolución mínima de 375×667 px (iPhone SE). No se requerirá instalación de software adicional en los dispositivos de los operarios. |
| **Justificación** | Los operarios utilizan dispositivos móviles heterogéneos proporcionados por la empresa. La dependencia de una aplicación nativa complicaría el despliegue y el mantenimiento. |
| **Métrica de verificación** | Pruebas manuales en Chrome, Firefox y Safari en dispositivos físicos. |

#### RS-06 — Mantenibilidad

| Identificador | RS-06 |
|---|---|
| **Categoría** | Mantenibilidad |
| **Descripción** | El código fuente seguirá el patrón arquitectónico MVC de Laravel, con separación estricta de capas. Las rutas, controladores, modelos y vistas estarán organizados según la convención de directorios de Laravel 10. La cobertura de pruebas unitarias sobre la lógica de negocio (cálculo de saturación, validación de movimientos) será de al menos el **70%**. |
| **Justificación** | El sistema deberá ser mantenible por el equipo técnico de Intermodal Sea Solutions una vez finalizado el TFG. Una arquitectura limpia reduce el coste de incorporación de nuevos desarrolladores. |
| **Métrica de verificación** | Informe de cobertura generado por PHPUnit. |

#### RS-07 — Integridad de Datos

| Identificador | RS-07 |
|---|---|
| **Categoría** | Fiabilidad |
| **Descripción** | Todas las operaciones de escritura (entradas, expediciones, reubicaciones) se ejecutarán dentro de **transacciones ACID** (motor InnoDB de MySQL 8.0). Ante cualquier error en mitad de una transacción, el sistema realizará rollback completo, garantizando que no existan registros parciales ni estados inconsistentes en la base de datos. |
| **Justificación** | La integridad del inventario es el activo principal del sistema. Un registro parcial (ej. palé sin movimiento asociado o movimiento sin palé) generaría discrepancias que podrían tener consecuencias económicas y contractuales. |
| **Métrica de verificación** | Pruebas de integración que simulen fallos en mitad de transacciones. |

---

## 3. Disciplina de Requisitos

Esta sección define los requisitos funcionales del sistema, estableciendo qué debe hacer el Módulo Logístico Web, quién interactúa con él, en qué orden de prioridad deben implementarse las funcionalidades y cómo se articula el flujo de información entre el sistema y su entorno.

### 3.1 Identificación de Actores

Un actor, en el sentido UML, es cualquier entidad externa al sistema que interactúa con él, ya sea una persona, un rol organizativo o un sistema informático externo (Larman, 2004). La identificación de actores delimita la frontera del sistema y es el punto de partida para la construcción de los casos de uso.

#### Actor 1 — Operario de Pista *(actor principal humano)*

Es el protagonista funcional activo del sistema. Interactúa con la interfaz web desde un dispositivo móvil para registrar las operaciones transaccionales físicas: entradas, expediciones y reubicaciones de palés. Sus interacciones son en tiempo real y tienen impacto directo e inmediato sobre el estado del inventario.

**Características relevantes para el diseño:** opera con guantes de trabajo, en nave industrial con iluminación variable y conectividad Wi-Fi interna. Necesita respuestas del sistema en menos de 2 segundos y elementos táctiles de gran tamaño. No tiene perfil técnico avanzado.

**Casos de uso accesibles:** UC-01, UC-02, UC-03, UC-04.

#### Actor 2 — Supervisor / Administrador *(actor humano privilegiado)*

Monitoriza de forma holística la saturación del almacén, extrae informes de flujo de mercancías y posee credenciales privilegiadas para rectificar registros erróneos, gestionar incidencias y lanzar procesos de migración. Su interacción es predominantemente de consulta y supervisión, con operaciones de escritura menos frecuentes pero de mayor impacto.

**Casos de uso accesibles:** UC-01, UC-02, UC-03, UC-04, UC-05, UC-06.

#### Actor 3 — Motor Rollship *(actor sistema externo, receptor)*

Sistema de gestión corporativo externo utilizado por James Hardie para el seguimiento de su inventario global. Consume los datos procesados por el Módulo Logístico mediante API REST para obtener el estado actualizado del inventario en el almacén de Santander. Es un actor receptor; no inicia operaciones sobre el almacén.

**Casos de uso accesibles:** UC-03 (lectura del estado del layout vía API).

#### Actor 4 — Sistema MS Access / Legado *(actor transitorio)*

Relevante únicamente durante la fase de migración (UC-06). Actúa como fuente de datos del proceso ETL. Contiene el histórico de operaciones desde 2025. Una vez completada la migración, este actor deja de ser relevante para el sistema y puede considerarse retirado.

**Casos de uso accesibles:** UC-06 (como fuente de datos).

---

### 3.2 Diagrama de Contexto

El diagrama de contexto sitúa el **Módulo Logístico Web** en su entorno operativo, mostrando los flujos de información entre el sistema y cada actor externo. Constituye la vista de más alto nivel del sistema y es el punto de partida para verificar que ningún flujo relevante ha quedado sin modelar (Pressman & Maxim, 2020).

```
                    ┌──────────────────────────────────────────────────────┐
                    │                                                      │
  ┌─────────────┐   │              MÓDULO LOGÍSTICO WEB                   │
  │  Operario   │──►│  Credenciales de acceso                             │
  │  de Pista   │◄──│  Confirmación de operación / Error                  │
  └─────────────┘   │  Mapa de sectores actualizado                       │
                    │                                                      │
  ┌─────────────┐   │  [UC-01] Registro de entrada de palé                │
  │Supervisor / │──►│  Credenciales de acceso (rol ADMIN)                 │
  │Administrador│◄──│  Informes de flujo / Estadísticas                   │
  └─────────────┘   │  Panel de gestión de incidencias                    │
                    │                                                      │
  ┌─────────────┐   │  [UC-02] Consignación de expedición                 │
  │   Motor     │──►│  Solicitud de estado del inventario (API REST)      │
  │  Rollship   │◄──│  Estado actual de los 38 sectores (JSON)            │
  └─────────────┘   │                                                      │
                    │  [UC-03] Layout interactivo en tiempo real          │
  ┌─────────────┐   │                                                      │
  │ MS Access   │──►│  Datos históricos de palés y movimientos (CSV/ODBC) │
  │  (Legado)   │   │                                                      │
  └─────────────┘   │  [UC-06] Migración ETL                             │
                    │                                                      │
                    │  ┌─────────────────────┐                            │
                    │  │   Base de datos      │                            │
                    │  │   MySQL 8.0          │                            │
                    │  │   (InnoDB / ACID)    │                            │
                    │  └─────────────────────┘                            │
                    └──────────────────────────────────────────────────────┘
```

**Descripción de los flujos de información:**

- **Operario → Sistema:** credenciales de login, código de referencia del palé, sector destino seleccionado, tipo de operación.
- **Sistema → Operario:** mapa de sectores con saturación en tiempo real, confirmación/error de la operación, listado de palés por sector.
- **Supervisor → Sistema:** credenciales de login (rol ADMIN), parámetros de filtrado para informes, datos de corrección de registros.
- **Sistema → Supervisor:** informes de flujo, estadísticas de ocupación histórica, panel de incidencias activas.
- **Rollship → Sistema:** solicitud HTTP GET al endpoint API del layout.
- **Sistema → Rollship:** representación JSON del estado actual de los 38 sectores (identificador, palés actuales, capacidad máxima, porcentaje de saturación).
- **MS Access → Sistema:** exportación de datos históricos en formato CSV o conexión ODBC para el proceso ETL de migración (flujo unidireccional, fase de migración únicamente).

---

### 3.3 Diagrama de Casos de Uso

El siguiente diagrama representa las interacciones entre los actores identificados y las funcionalidades del sistema, agrupadas dentro de los límites del Módulo Logístico Web y etiquetadas según su prioridad MoSCoW.

> *[Insertar aquí el Diagrama de Casos de Uso — archivo: Modelos y casos de uso.png]*

**Descripción del diagrama:**

El sistema expone seis casos de uso principales. UC-01 (Anotar entrada de palé) se extiende mediante UC-08 (Registrar incidencia operativa) cuando se detecta un error en recepción. UC-03 (Renderizar layout interactivo) incluye UC-07 (Calcular saturación de sector), que es un subflujo interno obligatorio para la renderización del semáforo cromático. Tanto UC-01 como UC-03 comparten el flujo incluido UC-07.

| Actor | Casos de uso accesibles |
|---|---|
| Operario de Pista | UC-01, UC-02, UC-03, UC-04 |
| Administrador | UC-01, UC-02, UC-03, UC-04, UC-05, UC-06 |
| Motor Rollship | UC-03 (lectura vía API) |
| MS Access (legado) | UC-06 (fuente de datos ETL) |

---

### 3.4 Priorización de Casos de Uso (Técnica MoSCoW)

La técnica MoSCoW clasifica los requisitos en cuatro niveles de prioridad para orientar el desarrollo iterativo hacia el mayor valor de negocio en el menor tiempo posible (Pressman & Maxim, 2020).

| Prioridad | ID | Nombre | Justificación |
|---|---|---|---|
| **Must Have** | UC-01 | Anotar entrada de palé | Sin registro de entradas el sistema no tiene razón operativa de existir. Es la operación más frecuente del almacén. |
| **Must Have** | UC-02 | Consignar expedición de palé | Cierra el ciclo de vida del palé. Sin salidas, el inventario no puede depurarse. |
| **Must Have** | UC-03 | Renderizar layout interactivo | Es la principal aportación frente al sistema Access: visibilidad en tiempo real de los 38 sectores. Base de UC-01 y UC-02. |
| **Should Have** | UC-04 | Reubicar palé entre sectores | Operación frecuente (reorganización de stock) pero no bloqueante si no está disponible en la primera iteración. |
| **Should Have** | UC-06 | Lanzar volcado migratorio (ETL) | Necesario para trasladar el histórico desde el sistema Access, pero puede ejecutarse como proceso puntual post-MVP. |
| **Could Have** | UC-05 | Analizar estadísticas de flujo | Gráficas avanzadas de gerencia. Añaden valor analítico pero no son necesarias para la operativa diaria. |

**Definición del MVP:** El Producto Mínimo Viable incluye exclusivamente los casos de uso *Must Have* (UC-01, UC-02, UC-03). Su implementación completa constituye un sistema operativamente funcional para la actividad diaria del almacén.

---

### 3.5 Detalle Expandido de Casos de Uso

#### UC-01 — Anotar Entrada de Palé

| Campo | Valor |
|---|---|
| **Denominación** | UC-01 — Anotar entrada de palé |
| **Actor principal** | Operario de Pista |
| **Actores secundarios** | Sistema MySQL (interno) |
| **Prioridad** | Must Have (MVP) |

**Precondiciones:**
- El operario tiene sesión iniciada en la aplicación web desde su dispositivo móvil.
- El dispositivo tiene conectividad a la red interna del almacén (Wi-Fi).
- El palé físico está presente en el muelle de descarga.

**Flujo principal (escenario de éxito):**
1. El operario accede al layout interactivo o pulsa el botón "Nueva entrada".
2. El sistema recupera asincrónicamente el mapa de saturación actualizado sin recargar la página completa (patrón AJAX).
3. El operario introduce el código de referencia del palé en el campo de texto (con autocompletado activado).
4. El operario selecciona el tipo de material y la masa aproximada en kilogramos.
5. El operario pulsa sobre el sector destino, que aparece en color verde (disponible) en el mapa.
6. El sistema valida que el sector seleccionado tiene capacidad disponible mediante consulta a la base de datos.
7. El sistema ejecuta la escritura en MySQL dentro de una transacción ACID, generando un registro en la tabla `Movimiento` con `tipoOperacion = ENTRADA` y actualizando el estado del palé a `Emplazado`.
8. El sistema confirma la operación al operario mediante un mensaje de notificación en pantalla ("Entrada registrada correctamente").
9. El layout se actualiza en tiempo real reflejando el nuevo palé en el sector seleccionado.

**Postcondiciones:**
- Existe un nuevo registro `Pale` en la base de datos con estado `Emplazado`.
- Existe un registro `Movimiento` vinculado con `selloTiempo`, `sectorDestino` e `idOperario`.
- El porcentaje de ocupación del sector destino se ha recalculado y actualizado en pantalla.

**Flujos alternativos y excepciones:**

*A1 — Sector lleno por operación concurrente:* Si entre el paso 5 y el paso 6 otro operario ha ocupado el último hueco del sector (condición de carrera), el mecanismo de control de concurrencia de InnoDB detectará la inconsistencia y rechazará la operación, mostrando: "Capacidad del sector superada. Seleccione otro sector." El mapa se actualiza automáticamente.

*A2 — Código de referencia duplicado:* Si el código introducido en el paso 3 ya existe en la base de datos como palé activo (estado `Emplazado` o `En preparación`), el sistema advierte: "Referencia ya registrada en el sistema" y no genera ningún registro hasta que el operario confirme si es una entrada complementaria o un error de tipeo.

*A3 — Pérdida de conexión:* Si el dispositivo pierde conectividad entre los pasos 1 y 7, el sistema muestra "Sin conexión" y deshabilita los controles de escritura hasta recuperar la red, garantizando que no se generen registros parciales.

---

#### UC-02 — Consignar Expedición de Palé

| Campo | Valor |
|---|---|
| **Denominación** | UC-02 — Consignar expedición de palé |
| **Actor principal** | Operario de Pista |
| **Actores secundarios** | Supervisor / Administrador (aprobación), Sistema MySQL (interno) |
| **Prioridad** | Must Have (MVP) |

**Precondiciones:**
- El operario tiene sesión iniciada en la aplicación web.
- El palé a expedir existe en el sistema con estado `Emplazado`.
- El supervisor ha emitido una orden de expedición para el palé en cuestión.

**Flujo principal (escenario de éxito):**
1. El operario accede a la sección "Expediciones" o busca el palé por código de referencia en el layout.
2. El sistema muestra el listado de palés con estado `En preparación` o el resultado de la búsqueda.
3. El operario selecciona el palé a expedir.
4. El sistema muestra el detalle del palé: código de referencia, tipo de material, sector actual, fecha de entrada y número de orden de expedición asociada.
5. El operario confirma que el palé físico está en el área de carga y pulsa "Registrar salida".
6. El sistema solicita confirmación al operario: "¿Confirma la expedición del palé [código]? Esta acción no se puede deshacer."
7. El operario confirma la acción.
8. El sistema valida que el palé aún se encuentra en estado `En preparación` (no ha sido cancelado ni ya expedido por otro operario).
9. El sistema ejecuta la escritura en MySQL dentro de una transacción ACID: actualiza el estado del palé a `Expedido`, genera un registro en `Movimiento` con `tipoOperacion = SALIDA` y libera la plaza del sector origen.
10. El sistema notifica la expedición al Supervisor mediante alerta en su panel.
11. El sistema confirma la operación al operario: "Expedición registrada correctamente. Palé [código] fuera del almacén."
12. El layout se actualiza, desapareciendo el palé del sector correspondiente.

**Postcondiciones:**
- El registro `Pale` tiene estado `Expedido` y fecha de salida registrada.
- Existe un registro `Movimiento` de tipo SALIDA con `selloTiempo`, `sectorOrigen` e `idOperario`.
- El contador `paleActuales` del sector origen se ha decrementado en una unidad.
- El Motor Rollship, en su próxima consulta, recibirá el inventario actualizado sin el palé expedido.

**Flujos alternativos y excepciones:**

*A1 — Palé ya expedido por otro operario:* Si en el paso 8 el sistema detecta que el estado del palé ya es `Expedido`, rechaza la operación y muestra: "Este palé ya ha sido dado de salida por otro operario. Consulte el historial de movimientos."

*A2 — Palé en estado Incidencia:* Si el palé presenta estado `Incidencia`, el sistema impide la expedición y redirige al operario al panel de gestión de incidencias: "No se puede expedir un palé con incidencia activa. Contacte con el supervisor."

*A3 — Orden de expedición cancelada:* Si la orden asociada fue cancelada por el supervisor (estado `Cancelado`), el sistema informa al operario y actualiza el estado del palé a `Emplazado` en el sector actual.

---

#### UC-03 — Renderizar Layout Interactivo

| Campo | Valor |
|---|---|
| **Denominación** | UC-03 — Renderizar mapa / layout interactivo |
| **Actor principal** | Operario de Pista / Administrador |
| **Actores secundarios** | Motor Rollship (lectura vía API) |
| **Prioridad** | Must Have (MVP) |

**Precondiciones:**
- El usuario tiene sesión iniciada (o el sistema externo dispone de token de API válido).
- La base de datos MySQL está accesible.

**Flujo principal:**
1. El usuario accede a la pantalla principal del módulo.
2. El sistema lanza una consulta asíncrona a MySQL para obtener el estado de ocupación actual de los 38 sectores.
3. El sistema renderiza la cuadrícula de 38 sectores con código de color dinámico según la saturación de cada sector: verde (0–60%), ámbar (61–85%), rojo (86–100%).
4. Al pulsar sobre cualquier sector, el sistema despliega un panel lateral sin recargar la página con el listado completo de palés ubicados en él: referencia, tipo de material, fecha de entrada y masa en kg.
5. El layout se refresca automáticamente cada 30 segundos mediante polling AJAX o, en su versión extendida, mediante conexión WebSocket para actualizaciones en tiempo real.

**Postcondiciones:**
- El usuario dispone de una visión actualizada del estado del almacén en menos de 1,5 segundos desde la carga inicial (RS-01).

**Flujos alternativos:**

*A1 — Solicitud vía API (Motor Rollship):* Cuando el actor es el Motor Rollship, la respuesta no es HTML sino un objeto JSON estructurado con el estado de cada sector: `{idSector, identificador, paleActuales, capacidadMax, porcentajeSaturacion, pales:[{codigoRef, tipoMaterial, fechaEntrada}]}`.

---

#### UC-04 — Reubicar Palé entre Sectores

| Campo | Valor |
|---|---|
| **Denominación** | UC-04 — Reubicar palé entre sectores |
| **Actor principal** | Operario de Pista |
| **Actores secundarios** | Sistema MySQL (interno) |
| **Prioridad** | Should Have |

**Precondiciones:**
- El operario tiene sesión iniciada.
- El palé a reubicar existe en el sistema con estado `Emplazado`.
- El sector destino tiene capacidad disponible (al menos una plaza libre).

**Flujo principal (escenario de éxito):**
1. El operario localiza el palé a reubicar: buscando por código de referencia o pulsando sobre su sector actual en el layout.
2. El sistema muestra el detalle del palé y su sector actual.
3. El operario pulsa "Reubicar" y selecciona el sector destino desde el layout (solo sectores en verde o ámbar son seleccionables).
4. El sistema valida: (a) que el sector destino tiene capacidad disponible; (b) que el sector destino es distinto del sector origen; (c) que el palé no está en estado `En preparación`, `Expedido` ni `Incidencia`.
5. El sistema ejecuta dentro de una transacción ACID: actualiza el estado del palé a `Reemplazado`, genera un movimiento de tipo REUBICACION con `sectorOrigen` y `sectorDestino`, decrementa el contador del sector origen e incrementa el del sector destino, y actualiza el estado final del palé a `Emplazado` en el nuevo sector.
6. El sistema confirma la operación: "Palé [código] reubicado correctamente al sector [destino]."
7. El layout se actualiza reflejando el cambio en ambos sectores.

**Postcondiciones:**
- El palé tiene estado `Emplazado` en el nuevo sector.
- Existe un registro `Movimiento` de tipo REUBICACION con `sectorOrigen`, `sectorDestino`, `selloTiempo` e `idOperario`.
- Los contadores de paleActuales de ambos sectores son coherentes con el nuevo estado.

**Flujos alternativos y excepciones:**

*A1 — Sector destino lleno:* El sistema rechaza la selección del sector con el mensaje "Sector [id] al 100% de capacidad. Seleccione otro sector." El sector aparece en rojo no seleccionable en el layout.

*A2 — Palé en estado incompatible:* Si el palé está `En preparación`, `Expedido` o `Incidencia`, el sistema muestra: "No es posible reubicar un palé en estado [estado]. Finalice o resuelva la operación pendiente."

---

### 3.6 Prototipado Conceptual de Interfaz (Wireframing)

Dado que los operarios trabajan en condiciones físicas exigentes —distancia variable a la pantalla, uso de guantes, iluminación industrial—, el diseño de interfaces se proyecta bajo los principios de usabilidad definidos en RS-04 (Sección 2.5). Los prototipos siguientes representan la disposición funcional de los elementos en pantalla, sin implicar decisiones de diseño visual definitivas.

#### Pantalla 1 — Layout Virtual (Pantalla Principal)

La pantalla principal consiste en una cuadrícula de 38 celdas que representan los sectores del almacén, organizadas espacialmente respetando la distribución física real del recinto (basada en el PlanoAlmacén de referencia). Cada celda muestra:

- **Identificador del sector** (ej. "B4") en tipografía de tamaño grande.
- **Porcentaje de ocupación** numérico (ej. "91%").
- **Número actual / capacidad máxima** (ej. "11/12").
- **Color de fondo dinámico** según umbral de saturación: verde / ámbar / rojo.

Al pulsar sobre cualquier celda se despliega un panel modal con el listado de palés alojados en ese sector (referencia, tipo de material, fecha de entrada, masa), sin abandonar la pantalla principal (patrón SPA). En la barra superior se muestran los botones de acceso rápido: "Nueva entrada" y "Registrar expedición".

```
┌─────────────────────────────────────────────────────────────────┐
│  MÓDULO LOGÍSTICO WEB — ALMACÉN SANTANDER          [Diego M. ▼] │
│  ┌──────────────┬──────────────────────────────────────────────┐ │
│  │ Nueva entrada│ Registrar expedición │ Reubicar │ Informes   │ │
│  └──────────────┴──────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │  A1    │ │  A2    │ │  A3    │ │  B1    │ │  B2    │  ...    │
│  │  45%   │ │  78%   │ │  91%   │ │  12%   │ │ 100%   │         │
│  │  5/11  │ │  7/9   │ │ 11/12  │ │  2/17  │ │ 12/12  │         │
│  │ [verde]│ │[ámbar] │ │ [rojo] │ │ [verde]│ │ [rojo] │         │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘         │
│                                                                   │
│  ... (38 sectores en total) ...                                   │
│                                                                   │
│  Última actualización: hace 12 segundos      [Actualizar ahora]  │
└─────────────────────────────────────────────────────────────────┘
```

#### Pantalla 2 — Formulario de Registro de Entrada

Formulario minimalista con los campos estrictamente necesarios para UC-01. Diseño de una sola columna, elementos de gran tamaño táctil (mínimo 60px de altura, RS-04):

```
┌──────────────────────────────────────────┐
│  NUEVA ENTRADA DE PALÉ                   │
│                                          │
│  Código de referencia:                   │
│  ┌────────────────────────────────────┐  │
│  │  JH-____-_                         │  │
│  └────────────────────────────────────┘  │
│  (autocompletado activo)                 │
│                                          │
│  Tipo de material:                       │
│  ┌────────────────────────────────────┐  │
│  │  ▼ Seleccionar tipo...             │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Masa aproximada (kg):                   │
│  ┌────────────────────────────────────┐  │
│  │  _____ kg                          │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Sector destino:                         │
│  [Seleccionar en el mapa ▼ o desplegable]│
│                                          │
│  ┌──────────────────────────────────┐    │
│  │   CONFIRMAR ENTRADA  (60px alto) │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

#### Pantalla 3 — Panel Lateral de Sector (overlay sobre el layout)

Al pulsar sobre un sector en el layout, se despliega un panel lateral sin recargar la página:

```
┌───────────────────────────────────────────┐
│  SECTOR B4  —  11/12 palés (91%)   [✕]   │
│  Zona: Bloque B — Fachada Norte           │
├───────────────────────────────────────────┤
│  REF             MATERIAL    ENTRADA       │
│  JH-8819-A   Pizarras Ens. 12/05/2026    │
│  JH-7203-B   Fibrocemento  08/05/2026    │
│  JH-6541-C   Fibrocemento  08/05/2026    │
│  ...                                      │
├───────────────────────────────────────────┤
│  [Reubicar palé]   [Registrar expedición] │
└───────────────────────────────────────────┘
```

---

## 4. Metodología de Elicitación Aplicada

Esta sección describe el protocolo metodológico seguido para la captura de requisitos con el cliente (Intermodal Sea Solutions) y los usuarios finales del sistema.

### 4.1 Técnicas de Elicitación Empleadas

**Observación directa (Job Shadowing).** Se acompañó a los operarios en sus turnos de trabajo para observar el flujo real de registro de entradas y salidas sin intermediación. Esta técnica permitió detectar requisitos de usabilidad que no habrían emergido en una entrevista formal: la necesidad de áreas táctiles ampliadas, la dificultad para escribir con guantes y la importancia de la retroalimentación visual inmediata. Los hallazgos de esta técnica se formalizaron directamente en los requisitos suplementarios RS-04.

**Entrevistas estructuradas.** Se mantuvieron reuniones con el supervisor del almacén y la dirección de Intermodal Sea Solutions para identificar: (1) los procesos de negocio prioritarios; (2) los umbrales de saturación operativos (que dieron lugar a los valores de RS-01 y la parametrización del semáforo en UC-03); (3) los requisitos de integración con el Motor Rollship; y (4) el alcance y cronograma de la migración del sistema legado (UC-06).

**Análisis documental del sistema heredado.** Se analizaron exportaciones y estructuras del sistema MS Access actual para comprender el modelo de datos existente, identificar las entidades y relaciones del dominio (que fundamentan el Diagrama de Clases de la Sección 2.1) y definir la estrategia de migración ETL.

### 4.2 Orden de Investigación Seguido

La elicitación se realizó en el orden recomendado por Larman (2004), respetando la secuencia Dominio → Actores → Casos de Uso → Prototipado:

1. **Dominio:** acordar el vocabulario estricto con el cliente (Glosario, Sección 2.4) y delimitar las fronteras del sistema (38 sectores, ciclo de vida del palé, integración con Rollship).
2. **Actores:** censar las figuras que interactúan con el almacén y con el sistema informático (Sección 3.1).
3. **Casos de uso:** identificar y priorizar las interacciones necesarias mediante técnica MoSCoW (Sección 3.4).
4. **Prototipado:** validar con usuarios finales el diseño de interfaces antes de codificar (Sección 3.6).

### 4.3 Artefactos Producidos

Los resultados de las sesiones de elicitación se formalizaron en los siguientes entregables, todos documentados en el presente capítulo:

- Diagrama de Clases Conceptuales (Sección 2.1).
- Diagrama de Objetos (Sección 2.2).
- Diagrama de Estados del Palé (Sección 2.3).
- Glosario de términos acordado con el cliente (Sección 2.4).
- Especificación de requisitos suplementarios / no funcionales (Sección 2.5).
- Diagrama de contexto del sistema (Sección 3.2).
- Diagrama de Casos de Uso con priorización MoSCoW (Sección 3.3).
- Detalle textual expandido de los casos de uso UC-01, UC-02, UC-03 y UC-04 (Sección 3.5).
- Prototipos de interfaz de usuario (Sección 3.6).

### 4.4 Estimación de Esfuerzo

La fase de requisitos fue llevada a cabo por un equipo de dos ingenieros analistas, configuración que mantiene la cohesión y agilidad sin sobrecarga burocrática (Larman, 2004). La estimación de dedicación por actividad se detalla en la siguiente tabla:

| Actividad | Horas estimadas |
|---|---|
| Observación directa en almacén (Job Shadowing) | 8 h |
| Entrevistas con supervisor y dirección | 6 h |
| Análisis del sistema MS Access legado | 10 h |
| Modelado del dominio (clases, objetos, estados) | 12 h |
| Elicitación y especificación de casos de uso | 14 h |
| Especificación de requisitos suplementarios | 4 h |
| Prototipado de interfaces (wireframing) | 6 h |
| **Total estimado** | **60 h** |

---

## 5. Matriz de Trazabilidad

La matriz de trazabilidad garantiza que existe correspondencia explícita entre los requisitos capturados en este capítulo y los artefactos que los satisfacen. Constituye evidencia de que el sistema es coherente con el escenario descrito en el Capítulo 1.

| Requisito | Origen (Capítulo 1) | Artefacto en Cap. 2 | Capítulo que lo implementa |
|---|---|---|---|
| Registro de entradas en tiempo real | Problema: registro manual en papel | UC-01, RS-01, RS-07 | Cap. 3 (diseño), Cap. 4 (solución) |
| Registro de salidas autorizado | Proceso de expedición actual ineficiente | UC-02, RS-03 | Cap. 3, Cap. 4 |
| Visibilidad del estado del almacén | Falta de visión global en tiempo real | UC-03, RS-01, Glosario "Layout virtual" | Cap. 3, Cap. 4 |
| Reubicación de palés | Operativa real del almacén | UC-04 | Cap. 3, Cap. 4 |
| Integración con Rollship | Requisito contractual con James Hardie | Actor 3, UC-03 (API), RS-05 | Cap. 3, Cap. 4 |
| Migración del histórico | Legado en MS Access desde 2025 | UC-06, Actor 4 | Cap. 4 |
| Operabilidad con guantes | Observación directa en almacén | RS-04, Wireframes | Cap. 3 (diseño UI) |
| Integridad del inventario | Requisito contractual y operativo | RS-07 (ACID), RS-03 | Cap. 3 (arquitectura) |
| Seguridad por roles | Distinción operario/supervisor | RS-03, Actores 1 y 2 | Cap. 3 (diseño) |

---

## 6. Referencias Bibliográficas del Capítulo

Date, C. J. (2004). *An introduction to database systems* (8.ª ed.). Addison-Wesley.

Elmasri, R., & Navathe, S. B. (2016). *Fundamentals of database systems* (7.ª ed.). Pearson.

Larman, C. (2004). *Applying UML and patterns: An introduction to object-oriented analysis and design and iterative development* (3.ª ed.). Prentice Hall.

Object Management Group. (2017). *Unified Modeling Language specification version 2.5.1*. OMG. https://www.omg.org/spec/UML/2.5.1/

Oracle Corporation. (2023). *MySQL 8.0 reference manual: InnoDB storage engine*. Oracle. https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html

Pressman, R. S., & Maxim, B. R. (2020). *Software engineering: A practitioner's approach* (9.ª ed.). McGraw-Hill.

Sommerville, I. (2015). *Software engineering* (10.ª ed.). Pearson.

W3C. (2018). *Web content accessibility guidelines (WCAG) 2.1*. World Wide Web Consortium. https://www.w3.org/TR/WCAG21/

Wiegers, K. E., & Beatty, J. (2013). *Software requirements* (3.ª ed.). Microsoft Press.

---

*Fin del Capítulo 2*
