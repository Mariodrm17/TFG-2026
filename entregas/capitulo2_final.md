# Capítulo 2: Disciplina de Requisitos

---

## 1. Introducción

El presente capítulo da respuesta al **Objetivo Específico I** del Trabajo de Fin de Grado: ejecutar la disciplina de requisitos que conduzca al diseño y desarrollo del sistema WMS para el almacén de Santander de Intermodal Sea Solutions, gestionado para la cuenta de James Hardie Iberia S.L. El modelado del dominio sigue las convenciones de Larman (2004) y Pressman y Maxim (2020).

Su propósito es **dirigir el desarrollo hacia el sistema correcto**, describiendo los requisitos del sistema de tal forma que se alcance el acuerdo entre el cliente, los usuarios y el equipo de ingeniería sobre qué debe hacer el sistema. La información aquí formalizada procede de las sesiones de elicitación realizadas con el supervisor del almacén, la dirección de Intermodal Sea Solutions y la observación directa del trabajo diario de los operarios.

El capítulo se estructura en dos bloques metodológicos complementarios, siguiendo la secuencia indicada en la asignatura de Ingeniería del Software:

- **Modelo del Dominio:** establece el vocabulario común (glosario), abstrae la realidad del negocio logístico en diagramas UML conceptuales (clases, objetos, estados) y especifica los requisitos suplementarios (no funcionales).

- **Disciplina de Requisitos:** identifica actores y casos de uso, los diagrama por actor, los prioriza, los detalla con sus flujos de interacción, los prototipos en interfaces y estructura el modelo con relaciones de inclusión y extensión.

---

## 2. Modelo del Dominio

### 2.1 Glosario de Términos

El siguiente glosario establece el vocabulario acordado con el cliente durante las sesiones de elicitación. Su objetivo es eliminar ambigüedades en la comunicación entre el equipo de desarrollo y las partes interesadas del negocio (Larman, 2004).

| Término | Definición en el contexto del sistema |
|---|---|
| **Almacén** | Recinto logístico ubicado en el Polígono Industrial Norte de Santander, gestionado por Intermodal Sea Solutions para la cuenta de James Hardie. 38 sectores, 4.200 m² de superficie. |
| **Sector** | Cada una de las 38 subdivisiones físicas del almacén, identificadas por un código alfanumérico único (p. ej., "B4", "A1"). Unidad mínima de gestión espacial. |
| **Palé** | Unidad de carga física que agrupa mercancía de James Hardie sobre una base de madera normalizada. Unidad mínima de gestión de inventario. Identificado por un código de referencia único (p. ej., "JH-8819-A"). |
| **Entrada** | Operación de registro de la llegada de un palé al almacén. Genera un movimiento de tipo ENTRADA y cambia el estado del palé a *Emplazado*. |
| **Expedición** | Operación de salida autorizada de un palé del almacén. Genera un movimiento de tipo SALIDA y cambia el estado del palé a *Expedido*. |
| **Reubicación** | Traslado de un palé entre dos sectores del mismo almacén. Genera un movimiento de tipo REUBICACION. |
| **Saturación** | Porcentaje de ocupación de un sector: `(paleActuales / capacidadMax) × 100`. Determina el color del indicador visual (verde / ámbar / rojo). |
| **Layout virtual** | Representación visual interactiva del estado de ocupación de los 38 sectores en tiempo real. Pantalla principal del módulo web. |
| **Semáforo de saturación** | Sistema de codificación cromática: verde (0–60 %), ámbar (61–85 %), rojo (86–100 %). |
| **Movimiento** | Registro transaccional de cualquier operación que altera el estado o la ubicación de un palé. Constituye el log de auditoría del sistema. |
| **Turno** | Período de trabajo de un operario: mañana (06:00–14:00), tarde (14:00–22:00) y noche (22:00–06:00). |
| **Rollship** | Sistema de gestión corporativo externo de James Hardie. Consume los datos del módulo logístico mediante API para el seguimiento del inventario. |
| **ETL** | *Extract, Transform, Load*. Proceso de migración de los datos históricos desde el sistema MS Access legado hacia la nueva base de datos. |
| **Picking** | Proceso de selección y preparación de palés para su expedición, previo a la aprobación del supervisor. |
| **Incidencia** | Situación anómala que afecta a un palé e impide el flujo operativo normal: daño físico, discrepancia en el código de referencia o diferencia entre el contenido declarado y el real. |
| **Módulo Logístico Web** | Sistema informático objeto de este TFG. Aplicación web que sustituye al sistema MS Access legado para la gestión del inventario del almacén de Santander. |
| **Operario de pista** | Trabajador del almacén que registra las operaciones físicas de entrada, salida y reubicación de palés a través del módulo web. |
| **Administrador** | Usuario con privilegios de supervisión, gestión de incidencias y acceso a estadísticas. Rol con acceso completo al sistema. |

---

### 2.2 Diagrama de Clases Conceptuales

El diagrama de clases del dominio representa las entidades conceptuales más importantes del negocio logístico y sus relaciones. Es una abstracción de la realidad, expresada en el lenguaje del cliente, sin dependencias de ningún entorno tecnológico ni restricciones de implementación (Larman, 2004). Los diagramas se expresan en UML, estándar de modelado visual definido por el Object Management Group (OMG, 2017). Por este motivo, no incluye métodos ni artefactos de diseño.

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0
title Figura 1: Diagrama de Clases Conceptuales — WMS Almacén Santander

class Almacen {
  + idAlmacen : int
  + ubicacion : String
  + numSectores : int
  + superficie : float
}

class Sector {
  + idSector : int
  + identificador : String
  + capacidadMax : int
  + paleActuales : int
  + zona : String
}

class Pale {
  + idPale : int
  + codigoRef : String
  + tipoMaterial : String
  + masaKg : float
  + fechaEntrada : Date
  + estado : EstadoPale
}

class Movimiento {
  + idMovimiento : int
  + selloTiempo : DateTime
  + tipoOperacion : TipoMovimiento
  + sectorOrigen : String
  + sectorDestino : String
  + incidencias : String
}

class Operario {
  + idOperario : int
  + credencial : String
  + nombreCompleto : String
  + turno : String
  + rol : RolOperario
}

class Cliente {
  + idCliente : int
  + razonSocial : String
  + cif : String
  + contacto : String
}

enum EstadoPale {
  RECEPCIONADO
  EMPLAZADO
  REEMPLAZADO
  EN_PREPARACION
  EXPEDIDO
  INCIDENCIA
  CANCELADO
}

enum TipoMovimiento {
  ENTRADA
  SALIDA
  REUBICACION
}

enum RolOperario {
  OPERARIO
  ADMINISTRADOR
}

Almacen "1" *-- "1..*" Sector         : compone >
Sector  "1" o-- "0..*" Pale           : aloja >
Pale    "1" --> "1..*" Movimiento     : origina >
Operario "1" --> "0..*" Movimiento   : registra >
Almacen "1" -- "1"     Cliente        : gestiona inventario de >
Pale   ..>  EstadoPale
Movimiento ..> TipoMovimiento
Operario ..> RolOperario
@enduml
```

**Figura 1.** Diagrama de Clases Conceptuales — WMS Almacén Santander.

**Descripción de las relaciones:**

| Relación | Tipo | Cardinalidad | Significado |
|---|---|---|---|
| `Almacen` → `Sector` | Composición | 1 a 1..* | Un almacén se compone de sectores. Sin almacén no hay sectores. Contexto actual: 38 sectores. |
| `Sector` → `Palé` | Agregación | 1 a 0..* | Un sector aloja cero o más palés en un momento dado. Los palés existen independientemente del sector. |
| `Palé` → `Movimiento` | Asociación | 1 a 1..* | Cada palé origina al menos un movimiento (la entrada). Puede originar muchos más a lo largo de su ciclo de vida. |
| `Operario` → `Movimiento` | Asociación | 1 a 0..* | Un operario registra cero o muchos movimientos. Cada movimiento es registrado por exactamente un operario. |
| `Almacen` → `Cliente` | Asociación | 1 a 1 | El almacén gestiona el inventario de un único cliente corporativo (James Hardie). |

---

### 2.3 Diagrama de Objetos

El diagrama de objetos proyecta una instantánea del recinto logístico en un instante concreto, instanciando el modelo de clases con datos reales. Sirve para verificar la corrección del modelo conceptual (Larman, 2004).

El instante modelado corresponde a una operación de descarga registrada el 12 de mayo de 2026 en turno de tarde:

```plantuml
@startuml
!theme plain
title Figura 2: Diagrama de Objetos — Turno tarde, 12/05/2026 16:45

object "almacenSantander : Almacen" as almacen {
  idAlmacen = 1
  ubicacion = "Santander, P.I. Norte"
  numSectores = 38
  superficie = 4200.0
}

object "jamesHardie : Cliente" as cliente {
  idCliente = 7
  razonSocial = "James Hardie Iberia S.L."
  cif = "B-8871234"
}

object "sectorB4 : Sector" as sector {
  idSector = 4
  identificador = "B4"
  capacidadMax = 12
  paleActuales = 11
  zona = "Bloque B — Fachada Norte"
}

object "paleJH8819 : Pale" as pale {
  idPale = 1055
  codigoRef = "JH-8819-A"
  tipoMaterial = "Pizarras Ensacadas"
  masaKg = 840.0
  fechaEntrada = 2026-05-12
  estado = EMPLAZADO
}

object "diegoMD : Operario" as operario {
  idOperario = 72
  credencial = "OP-MD72"
  nombreCompleto = "Diego Martínez"
  turno = "Tarde (14:00-22:00)"
  rol = OPERARIO
}

object "mov10234 : Movimiento" as mov {
  idMovimiento = 10234
  selloTiempo = 2026-05-12T16:45:00
  tipoOperacion = ENTRADA
  sectorOrigen = null
  sectorDestino = "B4"
  incidencias = null
}

almacen --> cliente   : gestiona inventario de
almacen --> sector    : segmentado en
sector  --> pale      : aloja
pale    --> mov       : origina
operario --> mov      : registra
@enduml
```

**Figura 2.** Diagrama de Objetos — Turno tarde, 12/05/2026, 16:45.

El diagrama confirma que el modelo conceptual captura correctamente la operativa real: el operario Diego Martínez registra la entrada del palé JH-8819-A (840 kg de Pizarras Ensacadas) en el sector B4, generando el movimiento MOV-10234 que queda vinculado al palé, al sector y al operario.

---

### 2.4 Diagrama de Estados del Palé

El diagrama de estados refleja el ciclo de vida completo de un palé desde su llegada al muelle de descarga hasta que abandona las instalaciones, incluyendo los estados de excepción que representan situaciones reales de incidencia operativa.

```plantuml
@startuml
!theme plain
title Figura 3: Diagrama de Estados — Ciclo de vida del Palé

[*] --> Recepcionado : descargaTrailer(camionId)

Recepcionado --> Emplazado    : asignarSector(sectorId)\n[sector disponible]
Recepcionado --> Incidencia   : detectarError()\n[daño físico o discrepancia documental]

Emplazado --> Reemplazado     : solicitarReubicacion(destinoId)\n[destino disponible]
Emplazado --> EnPreparacion   : solicitarExpedicion(ordenId)\n[orden autorizada]
Emplazado --> Incidencia      : detectarError()

Reemplazado --> Emplazado     : reubicacionConfirmada()

EnPreparacion --> Expedido    : aprobarCarga(supervisorId)\n[documentación válida]
EnPreparacion --> Cancelado   : rechazarOrden() or timeout

Incidencia --> Emplazado      : resolverIncidencia()\n[incidencia cerrada]
Incidencia --> Cancelado      : cancelarPale()

Expedido --> [*]
Cancelado --> [*]

state Recepcionado  : Palé presente en muelle.\nRegistro de entrada iniciado.
state Emplazado     : Palé ubicado en sector.\nEstado de reposo normal.
state Reemplazado   : Palé en tránsito entre sectores.\nEstado transitorio.
state EnPreparacion : Palé incluido en orden de expedición.\nPendiente de aprobación.
state Expedido      : Palé fuera del almacén.\nEstado terminal normal.
state Incidencia    : Anomalía detectada.\nSupervisor notificado.
state Cancelado     : Orden rechazada o cancelada.\nSector liberado.
@enduml
```

**Figura 3.** Diagrama de Estados — Ciclo de vida del Palé.

| Estado | Condición de entrada | Descripción |
|---|---|---|
| **Recepcionado** | Llegada física al muelle | El palé está presente pero sin sector asignado en el sistema. |
| **Emplazado** | Asignación de sector | El palé tiene sector asignado. Estado de reposo normal. |
| **Reemplazado** | Solicitud de reubicación | El palé está en tránsito entre dos sectores. Estado transitorio. |
| **En preparación** | Orden de expedición autorizada | El palé está reservado para su salida, pendiente de confirmación. |
| **Expedido** | Aprobación de carga confirmada | El palé ha salido del almacén. Estado terminal normal. |
| **Incidencia** | Detección de anomalía | El palé presenta un problema que impide el flujo normal. |
| **Cancelado** | Rechazo u orden anulada | La expedición fue rechazada o cancelada antes de producirse. |

---

### 2.5 Requisitos Suplementarios (No Funcionales)

Los requisitos suplementarios especifican las propiedades de calidad del sistema: cómo de rápido, seguro, fiable y usable debe ser (Sommerville, 2015). Condicionarán directamente las decisiones de arquitectura del Capítulo 3.

| ID | Categoría | Descripción | Métrica de verificación |
|---|---|---|---|
| **RS-01** | Rendimiento | El layout virtual se carga en menos de **1,5 s** en la red interna del almacén. Las operaciones de escritura se confirman en menos de **2 s**. | Prueba de carga con 5 operarios concurrentes. |
| **RS-02** | Disponibilidad | El sistema estará disponible el **99,5 %** del tiempo en horario operativo (06:00–22:00, lunes a sábado). | Monitorización de uptime. |
| **RS-03** | Seguridad | Acceso mediante credenciales únicas. Sesiones con expiración a los **30 minutos** de inactividad. El rol OPERARIO no puede modificar registros confirmados. | Revisión de código y pruebas básicas OWASP Top 10. |
| **RS-04** | Usabilidad | Interfaz operable con guantes de trabajo. Elementos táctiles ≥ **60×60 px**. Un operario sin formación técnica debe dominar el registro de entradas en menos de **15 minutos** de entrenamiento. Cumplimiento WCAG 2.1 nivel AA (W3C, 2018). | Test de usabilidad *think-aloud* con 3 operarios. |
| **RS-05** | Portabilidad | Compatible con Chrome 110+, Firefox 110+ y Safari 16+, en escritorio, tablet y smartphone (≥ 375×667 px). No requiere instalación de software adicional. | Pruebas manuales en los navegadores indicados. |
| **RS-06** | Mantenibilidad | Separación estricta de capas (MVC). Cobertura de pruebas unitarias sobre lógica de negocio ≥ **70 %**. | Informe de cobertura de pruebas. |
| **RS-07** | Integridad | Todas las operaciones de escritura son atómicas: ante cualquier error, el sistema garantiza que no existen registros parciales ni estados inconsistentes. | Pruebas de integración con simulación de fallos. |

---

## 3. Disciplina de Requisitos

### 3.1 Identificación de Actores y Casos de Uso

Un actor, en el sentido UML, es cualquier entidad externa al sistema que interactúa con él, ya sea una persona, un rol organizativo o un sistema informático externo (Larman, 2004). La identificación de actores delimita la frontera del sistema y es el punto de partida para la construcción de los casos de uso (Wiegers y Beatty, 2013).

#### Actores identificados

| Actor | Tipo | Descripción | CdU accesibles |
|---|---|---|---|
| **Operario de Pista** | Humano principal | Registra las operaciones físicas de entrada, salida y reubicación de palés desde un dispositivo móvil en tiempo real. | UC-01, 02, 03, 04, 10, 12 |
| **Administrador** | Humano privilegiado | Supervisa la ocupación del almacén, gestiona incidencias, extrae informes, rectifica registros y administra usuarios del sistema. | UC-01 a UC-12 |
| **Motor Rollship** | Sistema externo receptor | Sistema corporativo de James Hardie. Consulta el estado del inventario del almacén mediante API. | UC-03 |
| **MS Access (legado)** | Sistema externo transitorio | Fuente de datos históricos durante el proceso de migración ETL. Relevante únicamente en la fase de migración. | UC-06 |

#### Casos de Uso identificados

| ID | Nombre | Breve descripción |
|---|---|---|
| **UC-01** | Registrar entrada de palé | El operario registra la llegada de un palé al almacén y le asigna un sector. |
| **UC-02** | Registrar salida de palé | El operario registra la salida autorizada de un palé del almacén. |
| **UC-03** | Consultar layout interactivo | El usuario consulta el mapa de ocupación en tiempo real de los 38 sectores. |
| **UC-04** | Reubicar palé entre sectores | El operario traslada un palé de un sector a otro dentro del almacén. |
| **UC-05** | Consultar estadísticas de flujo | El administrador obtiene informes de movimientos históricos y ocupación. |
| **UC-06** | Migrar datos legado (ETL) | El administrador lanza el proceso de importación de datos desde MS Access. |
| **UC-07** | Calcular saturación de sector | El sistema calcula el porcentaje de ocupación de un sector. (*Subflujo incluido.*) |
| **UC-08** | Registrar incidencia operativa | El operario notifica una anomalía detectada en un palé. (*Flujo extendido desde UC-01.*) |
| **UC-09** | Autenticar usuario | El sistema verifica las credenciales del usuario antes de conceder acceso. (*Subflujo incluido.*) |
| **UC-10** | Buscar palé por referencia | El usuario localiza un palé concreto introduciendo su código de referencia en el buscador. |
| **UC-11** | Gestionar usuarios del sistema | El administrador crea, modifica y desactiva cuentas de operario. |
| **UC-12** | Consultar historial de palé | El usuario consulta la traza completa de movimientos de un palé concreto (trazabilidad). |

---

#### Figura 4 — Diagrama de Casos de Uso: Visión General

```plantuml
@startuml
!theme plain
title Figura 4: Diagrama de Casos de Uso — Visión General

left to right direction

actor "Operario\nde Pista" as OP
actor "Administrador" as AD
actor "Motor Rollship\n<<sistema>>" as RS
actor "MS Access\n<<legado>>" as MS

rectangle "Módulo Logístico Web" {
  usecase "UC-01\nRegistrar entrada\nde palé" as UC01
  usecase "UC-02\nRegistrar salida\nde palé" as UC02
  usecase "UC-03\nConsultar layout\ninteractivo" as UC03
  usecase "UC-04\nReubicar palé\nentre sectores" as UC04
  usecase "UC-05\nConsultar\nestadísticas" as UC05
  usecase "UC-06\nMigrar datos\nlegado (ETL)" as UC06
  usecase "UC-07\nCalcular saturación\nde sector" as UC07
  usecase "UC-08\nRegistrar incidencia\noperativa" as UC08
  usecase "UC-09\nAutenticar\nusuario" as UC09
  usecase "UC-10\nBuscar palé\npor referencia" as UC10
  usecase "UC-11\nGestionar\nusuarios" as UC11
  usecase "UC-12\nConsultar historial\nde palé" as UC12
}

OP --> UC01
OP --> UC02
OP --> UC03
OP --> UC04
OP --> UC10
OP --> UC12
AD --> UC01
AD --> UC02
AD --> UC03
AD --> UC04
AD --> UC05
AD --> UC06
AD --> UC10
AD --> UC11
AD --> UC12
RS --> UC03
MS --> UC06

UC01 ..> UC09 : <<include>>
UC02 ..> UC09 : <<include>>
UC03 ..> UC09 : <<include>>
UC04 ..> UC09 : <<include>>
UC10 ..> UC09 : <<include>>
UC11 ..> UC09 : <<include>>
UC12 ..> UC09 : <<include>>
UC01 ..> UC07 : <<include>>
UC03 ..> UC07 : <<include>>
UC01 ..> UC08 : <<extend>>\n[errorDetectado]
@enduml
```

**Figura 4.** Diagrama de Casos de Uso — Visión General del sistema.

---

#### Figura 5 — Diagrama de Casos de Uso: Actor Operario de Pista

```plantuml
@startuml
!theme plain
title Figura 5: Diagrama de Casos de Uso — Actor: Operario de Pista

left to right direction

actor "Operario\nde Pista" as OP

rectangle "Módulo Logístico Web" {
  usecase "UC-01\nRegistrar entrada\nde palé" as UC01
  usecase "UC-02\nRegistrar salida\nde palé" as UC02
  usecase "UC-03\nConsultar layout\ninteractivo" as UC03
  usecase "UC-04\nReubicar palé\nentre sectores" as UC04
  usecase "UC-07\nCalcular saturación\nde sector" as UC07
  usecase "UC-08\nRegistrar incidencia\noperativa" as UC08
  usecase "UC-09\nAutenticar\nusuario" as UC09
  usecase "UC-10\nBuscar palé\npor referencia" as UC10
  usecase "UC-12\nConsultar historial\nde palé" as UC12
}

OP --> UC01
OP --> UC02
OP --> UC03
OP --> UC04
OP --> UC10
OP --> UC12

UC01 ..> UC09 : <<include>>
UC02 ..> UC09 : <<include>>
UC03 ..> UC09 : <<include>>
UC04 ..> UC09 : <<include>>
UC10 ..> UC09 : <<include>>
UC12 ..> UC09 : <<include>>
UC01 ..> UC07 : <<include>>
UC03 ..> UC07 : <<include>>
UC01 ..> UC08 : <<extend>>\n[errorDetectado]
@enduml
```

**Figura 5.** Diagrama de Casos de Uso — Actor: Operario de Pista.

---

#### Figura 6 — Diagrama de Casos de Uso: Actor Administrador

```plantuml
@startuml
!theme plain
title Figura 6: Diagrama de Casos de Uso — Actor: Administrador

left to right direction

actor "Administrador" as AD

rectangle "Módulo Logístico Web" {
  usecase "UC-01\nRegistrar entrada\nde palé" as UC01
  usecase "UC-02\nRegistrar salida\nde palé" as UC02
  usecase "UC-03\nConsultar layout\ninteractivo" as UC03
  usecase "UC-04\nReubicar palé\nentre sectores" as UC04
  usecase "UC-05\nConsultar\nestadísticas" as UC05
  usecase "UC-06\nMigrar datos\nlegado (ETL)" as UC06
  usecase "UC-07\nCalcular saturación\nde sector" as UC07
  usecase "UC-08\nRegistrar incidencia\noperativa" as UC08
  usecase "UC-09\nAutenticar\nusuario" as UC09
  usecase "UC-10\nBuscar palé\npor referencia" as UC10
  usecase "UC-11\nGestionar\nusuarios" as UC11
  usecase "UC-12\nConsultar historial\nde palé" as UC12
}

AD --> UC01
AD --> UC02
AD --> UC03
AD --> UC04
AD --> UC05
AD --> UC06
AD --> UC10
AD --> UC11
AD --> UC12

UC01 ..> UC09 : <<include>>
UC02 ..> UC09 : <<include>>
UC03 ..> UC09 : <<include>>
UC04 ..> UC09 : <<include>>
UC10 ..> UC09 : <<include>>
UC11 ..> UC09 : <<include>>
UC12 ..> UC09 : <<include>>
UC01 ..> UC07 : <<include>>
UC03 ..> UC07 : <<include>>
UC01 ..> UC08 : <<extend>>\n[errorDetectado]
@enduml
```

**Figura 6.** Diagrama de Casos de Uso — Actor: Administrador.

---

#### Figura 7 — Diagrama de Casos de Uso: Actor Motor Rollship

```plantuml
@startuml
!theme plain
title Figura 7: Diagrama de Casos de Uso — Actor: Motor Rollship

left to right direction

actor "Motor Rollship\n<<sistema>>" as RS

rectangle "Módulo Logístico Web" {
  usecase "UC-03\nConsultar layout\ninteractivo" as UC03
  usecase "UC-07\nCalcular saturación\nde sector" as UC07
}

RS --> UC03
UC03 ..> UC07 : <<include>>
@enduml
```

**Figura 7.** Diagrama de Casos de Uso — Actor: Motor Rollship (sistema externo receptor).

---

#### Figura 8 — Diagrama de Contexto del Sistema

```plantuml
@startuml
!theme plain
title Figura 8: Diagrama de Contexto — Módulo Logístico Web

left to right direction

actor "Operario\nde Pista" as OP
actor "Administrador" as AD
actor "Motor Rollship\n<<sistema>>" as RS
actor "MS Access\n<<legado>>" as MS

component "Módulo Logístico Web" as MLW

OP --> MLW : credenciales / datos de operación\n(entrada, salida, reubicación)
MLW --> OP : confirmación / mapa de sectores actualizado

AD --> MLW : credenciales admin / parámetros de informe / correcciones
MLW --> AD : informes / estadísticas / panel de incidencias

RS --> MLW : solicitud de estado del inventario (API GET)
MLW --> RS : estado de los 38 sectores (JSON)

MS --> MLW : datos históricos de palés y movimientos\n[solo fase de migración]
@enduml
```

**Figura 8.** Diagrama de Contexto — Flujos de información entre el sistema y los actores externos.

---

### 3.2 Priorización de Casos de Uso

Los casos de uso se priorizan aplicando los criterios establecidos en RUP (Rational Unified Process): riesgo técnico, contribución a la arquitectura del sistema, valor para el negocio y dependencias entre casos de uso (Larman, 2004; Kruchten, 2004). El objetivo es ordenar la implementación de forma que las funcionalidades más críticas y riesgosas se aborden en las primeras iteraciones.

| ID | Nombre | Valor de negocio | Riesgo técnico | Contribución arquitectónica | Dependencias | **Iteración** |
|---|---|:-:|:-:|:-:|---|:-:|
| **UC-09** | Autenticar usuario | Alto | Bajo | Alta (base de toda interacción) | Ninguna | **1ª** |
| **UC-01** | Registrar entrada de palé | Muy alto | Medio | Alta (operación principal) | UC-09, UC-07 | **1ª** |
| **UC-02** | Registrar salida de palé | Muy alto | Medio | Alta (cierra ciclo de vida) | UC-09, UC-07 | **1ª** |
| **UC-03** | Consultar layout interactivo | Alto | Medio | Alta (pantalla principal, base del sistema) | UC-09, UC-07 | **1ª** |
| **UC-07** | Calcular saturación de sector | Alto | Bajo | Alta (subflujo compartido) | Ninguna | **1ª** |
| **UC-04** | Reubicar palé entre sectores | Medio | Bajo | Media | UC-09, UC-07 | **2ª** |
| **UC-08** | Registrar incidencia operativa | Medio | Bajo | Baja | UC-01 | **2ª** |
| **UC-06** | Migrar datos legado (ETL) | Alto | Alto | Baja (proceso puntual) | Ninguna | **2ª** |
| **UC-10** | Buscar palé por referencia | Alto | Bajo | Media | UC-09 | **2ª** |
| **UC-11** | Gestionar usuarios del sistema | Medio | Bajo | Media | UC-09 | **2ª** |
| **UC-05** | Consultar estadísticas de flujo | Bajo | Bajo | Baja | UC-09 | **3ª** |
| **UC-12** | Consultar historial de palé | Medio | Bajo | Baja | UC-09 | **3ª** |

**Producto Mínimo Viable (PMV):** los casos de uso de la primera iteración (UC-01, UC-02, UC-03, UC-07, UC-09) constituyen el sistema operativamente funcional para la actividad diaria del almacén. La segunda iteración incorpora UC-04, UC-06, UC-08, UC-10 y UC-11; la tercera, UC-05 y UC-12.

---

### 3.3 Detalle de Casos de Uso

#### UC-01 — Registrar Entrada de Palé

| Campo | Valor |
|---|---|
| **Denominación** | UC-01 — Registrar entrada de palé |
| **Actor principal** | Operario de Pista |
| **Actores secundarios** | — |
| **Incluye** | UC-09 (Autenticar usuario), UC-07 (Calcular saturación) |
| **Extiende** | UC-08 (Registrar incidencia) [condición: error detectado] |
| **Iteración** | 1ª — alta prioridad |

**Precondiciones:**
- El operario tiene sesión iniciada en la aplicación.
- El palé físico está presente en el muelle de descarga.

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Operario | Solicita registrar una nueva entrada de palé. |
| 2 | Sistema | Presenta el formulario de entrada y el mapa de sectores con el estado de ocupación actualizado. |
| 3 | Operario | Introduce el código de referencia del palé, el tipo de material y la masa aproximada. |
| 4 | Operario | Selecciona el sector destino en el mapa. |
| 5 | Sistema | Verifica que el sector seleccionado tiene capacidad disponible. |
| 6 | Sistema | Registra la operación de entrada: crea el palé con estado *Emplazado* y genera el movimiento de tipo ENTRADA vinculado al operario y al sector. |
| 7 | Sistema | Confirma la operación al operario y actualiza el mapa de sectores en pantalla. |

**Postcondiciones:**
- El palé queda registrado en el sistema con estado *Emplazado* en el sector seleccionado.
- El sistema ha generado un movimiento de tipo ENTRADA con sello temporal, sector destino y operario responsable.
- La ocupación del sector destino se ha actualizado.

**Flujos alternativos y excepciones:**

*A1 — Sector lleno:* En el paso 5, si el sector seleccionado no tiene capacidad disponible, el sistema informa al operario e invita a seleccionar un sector alternativo. El mapa muestra los sectores llenos en rojo y no seleccionables.

*A2 — Código de referencia duplicado:* En el paso 3, si el código introducido ya corresponde a un palé activo en el sistema, el sistema advierte al operario y le pide confirmación antes de registrar.

*A3 — Error detectado en recepción:* Si el operario detecta una anomalía en el palé durante el proceso, puede extender el flujo hacia UC-08 (Registrar incidencia).

---

**Figura 9.** Diagrama de Actividad — UC-01: Registrar entrada de palé.

```plantuml
@startuml
!theme plain
title Figura 9: Diagrama de Actividad — UC-01: Registrar entrada de palé

|Operario de Pista|
start
:Solicita nueva entrada de palé;

|Sistema|
:Presenta formulario de entrada;
:Muestra mapa de sectores actualizado;

|Operario de Pista|
:Introduce código, tipo de material\ny masa del palé;
:Selecciona sector destino en el mapa;

|Sistema|
if (¿Sector con capacidad disponible?) then (Sí)
  if (¿Código de referencia ya existe?) then (No)
    :Registra palé con estado EMPLAZADO\ny genera movimiento ENTRADA;
    :Confirma operación al operario;
    :Actualiza mapa de sectores en pantalla;
    stop
  else (Sí, duplicado)
    :Muestra aviso de referencia duplicada;
    |Operario de Pista|
    :Corrige el código o confirma la entrada;
    |Sistema|
    stop
  endif
else (No, sector lleno)
  :Muestra aviso de sector sin capacidad;
  |Operario de Pista|
  :Selecciona sector alternativo;
  |Sistema|
  stop
endif
@enduml
```

---

#### UC-02 — Registrar Salida de Palé

| Campo | Valor |
|---|---|
| **Denominación** | UC-02 — Registrar salida de palé |
| **Actor principal** | Operario de Pista |
| **Actores secundarios** | Administrador (aprobación de la orden de expedición) |
| **Incluye** | UC-09 (Autenticar usuario), UC-07 (Calcular saturación) |
| **Iteración** | 1ª — alta prioridad |

**Precondiciones:**
- El operario tiene sesión iniciada en la aplicación.
- El palé a expedir existe en el sistema con estado *Emplazado* o *En preparación*.
- El administrador ha emitido una orden de expedición para el palé.

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Operario | Solicita registrar la salida de un palé, indicando su código de referencia o buscándolo en el layout. |
| 2 | Sistema | Presenta el detalle del palé: código, tipo de material, sector actual y orden de expedición asociada. |
| 3 | Operario | Confirma que el palé físico está en el área de carga y solicita registrar la salida. |
| 4 | Sistema | Solicita confirmación explícita al operario antes de proceder. |
| 5 | Operario | Confirma la operación. |
| 6 | Sistema | Verifica que el estado actual del palé permite la expedición. |
| 7 | Sistema | Registra la operación de salida: actualiza el estado del palé a *Expedido*, genera el movimiento SALIDA, y libera la plaza del sector origen. |
| 8 | Sistema | Notifica al administrador la expedición realizada. |
| 9 | Sistema | Confirma la operación al operario y actualiza el mapa de sectores. |

**Postcondiciones:**
- El palé tiene estado *Expedido* y fecha de salida registrada.
- El sistema ha generado un movimiento de tipo SALIDA con sello temporal, sector origen y operario.
- La ocupación del sector origen ha disminuido en una unidad.

**Flujos alternativos y excepciones:**

*A1 — Palé en estado incompatible:* En el paso 6, si el palé presenta estado *Incidencia*, el sistema impide la expedición y redirige al operario al panel de gestión de incidencias.

*A2 — Orden cancelada:* Si la orden de expedición fue cancelada por el administrador, el sistema informa al operario y no permite la salida.

---

**Figura 10.** Diagrama de Actividad — UC-02: Registrar salida de palé.

```plantuml
@startuml
!theme plain
title Figura 10: Diagrama de Actividad — UC-02: Registrar salida de palé

|Operario de Pista|
start
:Solicita registrar salida de palé\n(introduce código o lo localiza en el mapa);

|Sistema|
:Presenta detalle del palé\ny orden de expedición asociada;

|Operario de Pista|
:Confirma que el palé está\nen el área de carga;
:Solicita registrar la salida;

|Sistema|
:Solicita confirmación explícita;

|Operario de Pista|
:Confirma la operación;

|Sistema|
if (¿Estado del palé permite expedición?) then (Sí)
  :Actualiza estado del palé a EXPEDIDO;
  :Genera movimiento SALIDA;
  :Libera plaza del sector origen;
  :Notifica al Administrador;
  :Confirma operación al operario;
  :Actualiza mapa de sectores;
  stop
else (No, estado incompatible)
  :Informa del estado del palé\ne impide la expedición;
  stop
endif
@enduml
```

---

#### UC-03 — Consultar Layout Interactivo

| Campo | Valor |
|---|---|
| **Denominación** | UC-03 — Consultar layout interactivo |
| **Actores** | Operario de Pista, Administrador, Motor Rollship |
| **Incluye** | UC-09 (Autenticar usuario — para actores humanos), UC-07 (Calcular saturación) |
| **Iteración** | 1ª — alta prioridad |

**Precondiciones:**
- El usuario tiene sesión iniciada o el sistema externo dispone de credenciales de API válidas.

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario/Sistema | Accede a la pantalla principal del módulo. |
| 2 | Sistema | Consulta el estado de ocupación actual de los 38 sectores. |
| 3 | Sistema | Presenta la cuadrícula de 38 sectores con codificación cromática: verde (0–60 %), ámbar (61–85 %), rojo (86–100 %). |
| 4 | Usuario | Pulsa sobre un sector. |
| 5 | Sistema | Presenta el detalle del sector seleccionado: listado de palés alojados con su referencia, tipo de material y fecha de entrada. |
| 6 | Sistema | Refresca el mapa periódicamente para mantener la información actualizada. |

**Flujo alternativo A1 — Acceso por API (Motor Rollship):** En el paso 3, si el actor es el Motor Rollship, la respuesta del sistema es un objeto JSON estructurado con el estado de cada sector (identificador, palés actuales, capacidad máxima, porcentaje de saturación y listado de palés).

**Postcondiciones:**
- El usuario dispone de una visión actualizada del estado del almacén.

---

#### UC-04 — Reubicar Palé entre Sectores

| Campo | Valor |
|---|---|
| **Denominación** | UC-04 — Reubicar palé entre sectores |
| **Actor principal** | Operario de Pista |
| **Incluye** | UC-09 (Autenticar usuario), UC-07 (Calcular saturación) |
| **Iteración** | 2ª — prioridad media |

**Precondiciones:**
- El operario tiene sesión iniciada.
- El palé a reubicar tiene estado *Emplazado*.
- El sector destino tiene capacidad disponible.

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Operario | Localiza el palé (por código o en el mapa) y solicita reubicarlo. |
| 2 | Sistema | Presenta el detalle del palé y su sector actual. |
| 3 | Operario | Selecciona el sector destino en el mapa. |
| 4 | Sistema | Verifica: (a) sector destino con capacidad; (b) sector destino distinto del actual; (c) estado del palé compatible. |
| 5 | Sistema | Registra la reubicación: actualiza la ubicación del palé, genera el movimiento de tipo REUBICACION y actualiza los contadores de ambos sectores. |
| 6 | Sistema | Confirma la operación y actualiza el mapa. |

**Postcondiciones:**
- El palé tiene estado *Emplazado* en el nuevo sector.
- El sistema ha generado un movimiento de tipo REUBICACION con sector origen, sector destino, sello temporal y operario.

**Figura 11.** Diagrama de Actividad — UC-04: Reubicar palé entre sectores.

```plantuml
@startuml
!theme plain
title Figura 11: Diagrama de Actividad — UC-04: Reubicar palé entre sectores

|Operario de Pista|
start
:Localiza el palé (código o mapa)\ny solicita reubicarlo;

|Sistema|
:Presenta detalle del palé y sector actual;

|Operario de Pista|
:Selecciona el sector destino en el mapa;

|Sistema|
if (¿Sector destino con capacidad disponible?) then (Sí)
  if (¿Sector destino distinto del actual?) then (Sí)
    if (¿Estado del palé = EMPLAZADO?) then (Sí)
      :Actualiza ubicación del palé al sector destino;
      :Genera movimiento REUBICACION\n(origen, destino, sello temporal, operario);
      :Actualiza contadores de ambos sectores;
      :Confirma operación y actualiza mapa;
      stop
    else (No, estado incompatible)
      :Informa de estado incompatible;
      stop
    endif
  else (No, mismo sector)
    :Informa: destino igual que sector actual;
    stop
  endif
else (No, sector lleno)
  :Informa de sector lleno;
  stop
endif
@enduml
```

---

#### UC-05 — Consultar Estadísticas de Flujo

| Campo | Valor |
|---|---|
| **Denominación** | UC-05 — Consultar estadísticas de flujo |
| **Actor principal** | Administrador |
| **Incluye** | UC-09 (Autenticar usuario) |
| **Iteración** | 3ª — prioridad baja |

**Precondiciones:**
- El administrador tiene sesión iniciada con rol ADMINISTRADOR.
- Existe al menos un movimiento registrado en el sistema.

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Administrador | Accede al panel de estadísticas desde el menú principal. |
| 2 | Sistema | Presenta un resumen de actividad del período actual: entradas, salidas y reubicaciones del día. |
| 3 | Administrador | Configura los filtros: rango de fechas, sector o tipo de operación. |
| 4 | Sistema | Consulta los movimientos y calcula indicadores: operaciones por tipo, evolución de la ocupación por sector, operarios más activos y horas pico. |
| 5 | Sistema | Presenta los resultados en forma de tabla y gráfico de barras. |
| 6 | Administrador | Opcionalmente exporta el informe en formato CSV o PDF. |

**Postcondiciones:**
- El administrador dispone de un informe de actividad del período seleccionado.

**Flujos alternativos:**

*A1 — Sin datos en el período:* el sistema informa que no hay movimientos y sugiere ampliar el rango de fechas.

*A2 — Exportación:* el sistema genera el archivo y lo pone a disposición del administrador para su descarga.

**Figura 12.** Diagrama de Actividad — UC-05: Consultar estadísticas de flujo.

```plantuml
@startuml
!theme plain
title Figura 12: Diagrama de Actividad — UC-05: Consultar estadísticas de flujo

|Administrador|
start
:Accede al panel de estadísticas;

|Sistema|
:Presenta resumen del día: entradas, salidas, reubicaciones;

|Administrador|
:Configura filtros: rango de fechas, sector o tipo de operación;

|Sistema|
if (¿Existen movimientos en el período?) then (Sí)
  :Calcula indicadores: operaciones por tipo,\nocupación por sector, operarios activos, horas pico;
  :Presenta tabla y gráfico de resultados;
  |Administrador|
  if (¿Desea exportar el informe?) then (Sí)
    |Sistema|
    :Genera archivo CSV o PDF;
    stop
  else (No)
    stop
  endif
else (Sin datos)
  :Informa de ausencia de datos\ny sugiere ampliar el período;
  stop
endif
@enduml
```

---

#### UC-06 — Migrar Datos Legado (ETL)

| Campo | Valor |
|---|---|
| **Denominación** | UC-06 — Migrar datos legado (ETL) |
| **Actor principal** | Administrador |
| **Actores secundarios** | MS Access (legado) — fuente de datos históricos |
| **Iteración** | 2ª — alto riesgo técnico |

**Precondiciones:**
- El administrador tiene sesión iniciada con rol ADMINISTRADOR.
- Existe el archivo exportado del sistema MS Access con el inventario histórico.
- La migración no ha sido ejecutada previamente (proceso irrepetible sin reset manual).

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Administrador | Accede al módulo ETL desde el panel de administración. |
| 2 | Sistema | Presenta el formulario de carga y las instrucciones de formato esperado. |
| 3 | Administrador | Sube el archivo exportado desde MS Access (CSV o MDB convertido). |
| 4 | Sistema | Valida el formato y la estructura del archivo: columnas requeridas y tipos de datos. |
| 5 | Sistema | Ejecuta simulación (*dry run*) e informa del número de registros a importar y conflictos detectados. |
| 6 | Administrador | Revisa el informe de simulación y confirma la migración. |
| 7 | Sistema | Ejecuta el proceso ETL: importa palés históricos y genera movimientos de tipo ENTRADA para cada registro. |
| 8 | Sistema | Presenta el resumen final: registros importados, omitidos y errores. |

**Postcondiciones:**
- Los datos históricos del sistema MS Access están disponibles en la nueva base de datos.
- Cada palé importado tiene al menos un movimiento de tipo ENTRADA con la fecha original.
- El log de migración queda registrado para auditoría.

**Flujos alternativos:**

*A1 — Formato no válido:* el sistema describe los errores de formato e impide continuar.

*A2 — Conflicto de duplicados:* el sistema identifica los registros duplicados y permite al administrador decidir si omitirlos o sobrescribirlos.

*A3 — Error durante la migración:* el sistema ejecuta un rollback completo (RS-07), garantizando que no quedan registros parciales.

**Figura 13.** Diagrama de Actividad — UC-06: Migrar datos legado (ETL).

```plantuml
@startuml
!theme plain
title Figura 13: Diagrama de Actividad — UC-06: Migrar datos legado (ETL)

|Administrador|
start
:Accede al módulo ETL;

|Sistema|
:Presenta formulario de carga y formato esperado;

|Administrador|
:Sube el archivo exportado desde MS Access;

|Sistema|
if (¿Formato y estructura válidos?) then (Sí)
  :Ejecuta simulación (dry run);
  :Informa de registros a importar y conflictos;
  |Administrador|
  :Revisa informe y confirma migración;
  |Sistema|
  if (¿Migración sin errores críticos?) then (Sí)
    :Importa palés históricos;
    :Genera movimientos ENTRADA para cada registro;
    :Presenta resumen: importados, omitidos, errores;
    stop
  else (Fallo durante la migración)
    :Ejecuta rollback completo (RS-07);
    :Informa del error al administrador;
    stop
  endif
else (Formato no válido)
  :Describe errores de formato e impide continuar;
  stop
endif
@enduml
```

---

#### UC-07 — Calcular Saturación de Sector *(subflujo incluido)*

| Campo | Valor |
|---|---|
| **Denominación** | UC-07 — Calcular saturación de sector |
| **Tipo** | Subflujo — incluido por UC-01 y UC-03 |
| **Actor** | Sistema (interno, no iniciado directamente por actores humanos) |
| **Iteración** | 1ª — base arquitectónica |

Este caso de uso no es iniciado directamente por ningún actor humano. Es un subflujo obligatorio activado por UC-01 (al registrar una entrada) y UC-03 (al renderizar el layout). El sistema calcula el porcentaje de ocupación de cada sector mediante la fórmula: `saturación = (paleActuales / capacidadMax) × 100`.

| Rango de saturación | Código cromático | Significado |
|---|---|---|
| 0–60 % | Verde | Sector disponible. |
| 61–85 % | Ámbar | Sector con ocupación elevada. |
| 86–100 % | Rojo | Sector próximo al límite o lleno. |

**Precondición:** Los campos `paleActuales` y `capacidadMax` del sector son accesibles.

**Postcondición:** El porcentaje de saturación y el código de color quedan calculados y disponibles para su presentación en el layout.

---

#### UC-08 — Registrar Incidencia Operativa

| Campo | Valor |
|---|---|
| **Denominación** | UC-08 — Registrar incidencia operativa |
| **Actor principal** | Operario de Pista |
| **Actores secundarios** | Administrador (recibe notificación) |
| **Extiende** | UC-01 (Registrar entrada) [condición: error detectado] |
| **Incluye** | UC-09 (Autenticar usuario) |
| **Iteración** | 2ª — prioridad media |

**Precondiciones:**
- El operario tiene sesión iniciada en la aplicación.
- El palé sobre el que se registra la incidencia existe en el sistema o se está registrando en UC-01.

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Operario | Detecta una anomalía en el palé y accede al formulario de incidencia. |
| 2 | Sistema | Presenta el formulario con el código del palé ya vinculado y solicita el tipo de incidencia. |
| 3 | Operario | Selecciona el tipo: daño físico, discrepancia de código o diferencia de contenido. |
| 4 | Operario | Describe la anomalía con detalle y opcionalmente adjunta una fotografía. |
| 5 | Sistema | Registra la incidencia, cambia el estado del palé a *Incidencia* e impide operaciones sobre él hasta su resolución. |
| 6 | Sistema | Notifica al administrador la incidencia con el detalle completo. |
| 7 | Sistema | Confirma al operario que la incidencia ha sido registrada. |

**Postcondiciones:**
- La incidencia queda registrada con sello temporal y operario responsable.
- El palé tiene estado *Incidencia* y no puede ser expedido hasta que el administrador la resuelva.
- El administrador ha recibido la notificación.

**Flujos alternativos:**

*A1 — Resolución de incidencia:* el administrador revisa, toma medidas correctoras y la marca como resuelta. El sistema devuelve el palé al estado *Emplazado*.

*A2 — Cancelación del palé:* si la anomalía es irresoluble, el administrador cancela el palé desde el panel de incidencias.

**Figura 14.** Diagrama de Actividad — UC-08: Registrar incidencia operativa.

```plantuml
@startuml
!theme plain
title Figura 14: Diagrama de Actividad — UC-08: Registrar incidencia operativa

|Operario de Pista|
start
:Detecta anomalía en el palé;
:Accede al formulario de incidencia;

|Sistema|
:Presenta formulario con código del palé vinculado;

|Operario de Pista|
:Selecciona tipo: daño físico, discrepancia de código\no diferencia de contenido;
:Describe la anomalía;

|Sistema|
:Registra la incidencia;
:Cambia estado del palé a INCIDENCIA;
:Bloquea operaciones sobre el palé;
:Notifica al Administrador;
:Confirma registro al operario;

|Administrador|
:Recibe notificación;
if (¿Incidencia resoluble?) then (Sí)
  :Toma medidas y la marca como resuelta;
  |Sistema|
  :Devuelve palé al estado EMPLAZADO;
  stop
else (No, daño irreparable)
  :Cancela el palé;
  |Sistema|
  :Actualiza estado a CANCELADO;
  stop
endif
@enduml
```

---

#### UC-09 — Autenticar Usuario *(subflujo incluido)*

| Campo | Valor |
|---|---|
| **Denominación** | UC-09 — Autenticar usuario |
| **Tipo** | Subflujo — incluido por todos los CdU con actores humanos |
| **Actor** | Sistema (interno, no iniciado directamente) |
| **Iteración** | 1ª — base de toda interacción |

Este caso de uso es un subflujo de autenticación que se activa cuando un actor humano accede al módulo sin sesión activa. No es invocado directamente por el usuario: el sistema lo ejecuta de forma transparente al inicio de cualquier interacción protegida.

**Precondición:** El usuario dispone de una credencial válida registrada en el sistema.

**Flujo principal:**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Sistema | Detecta el acceso sin sesión activa y presenta la pantalla de inicio de sesión. |
| 2 | Usuario | Introduce su credencial (usuario y contraseña). |
| 3 | Sistema | Valida las credenciales. Si son correctas, genera un token JWT con el rol del usuario y expiración a los 30 min de inactividad (RS-03). |
| 4 | Sistema | Redirige al usuario a la pantalla principal según su rol: layout interactivo (Operario) o panel de administración (Administrador). |

**Postcondición:** El usuario tiene una sesión activa con token JWT válido.

**Flujo alternativo:**

*A1 — Credenciales incorrectas:* el sistema informa del error sin especificar el campo incorrecto. Tras 3 intentos fallidos consecutivos, la cuenta queda bloqueada temporalmente 15 minutos.

---

#### UC-10 — Buscar Palé por Referencia

| Campo | Valor |
|---|---|
| **Denominación** | UC-10 — Buscar palé por referencia |
| **Actores** | Operario de Pista, Administrador |
| **Incluye** | UC-09 (Autenticar usuario) |
| **Iteración** | 2ª — alta prioridad |

**Precondiciones:**
- El usuario tiene sesión iniciada en la aplicación.

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Introduce el código de referencia del palé (completo o parcial) en el campo de búsqueda. |
| 2 | Sistema | Busca el palé en el inventario activo filtrando por el código introducido. |
| 3 | Sistema | Presenta los resultados: código, tipo de material, sector actual, estado y fecha de entrada. |
| 4 | Usuario | Selecciona el palé de la lista de resultados. |
| 5 | Sistema | Muestra el detalle completo del palé y lo resalta en el layout virtual. |

**Postcondiciones:**
- El usuario conoce la ubicación exacta del palé y su estado actual.

**Flujos alternativos:**

*A1 — Sin resultados:* el sistema indica que no hay coincidencias y ofrece ampliar los criterios.

*A2 — Palé expedido o cancelado:* el sistema informa de que el palé ya no está activo y muestra su último estado registrado.

---

#### UC-11 — Gestionar Usuarios del Sistema

| Campo | Valor |
|---|---|
| **Denominación** | UC-11 — Gestionar usuarios del sistema |
| **Actor principal** | Administrador |
| **Incluye** | UC-09 (Autenticar usuario) |
| **Iteración** | 2ª — prioridad media |

**Precondiciones:**
- El administrador tiene sesión iniciada con rol ADMINISTRADOR.

**Flujo principal — Crear operario (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Administrador | Accede al panel de gestión de usuarios. |
| 2 | Sistema | Presenta la lista de usuarios activos con nombre, credencial, turno y rol. |
| 3 | Administrador | Solicita crear un nuevo operario e introduce nombre, credencial, turno y rol. |
| 4 | Sistema | Verifica que la credencial no existe en el sistema. |
| 5 | Sistema | Crea la cuenta y la registra en el log de auditoría. |
| 6 | Sistema | Confirma la creación y muestra la cuenta en la lista actualizada. |

**Postcondiciones:**
- La cuenta del nuevo operario está activa y puede autenticarse en el sistema.

**Subflujos:**
- *SF-A Modificar operario:* el administrador actualiza turno, rol o contraseña de un usuario existente.
- *SF-B Desactivar operario:* el administrador desactiva la cuenta sin eliminarla, conservando el historial de movimientos.

**Flujos alternativos:**

*A1 — Credencial duplicada:* el sistema informa del conflicto y solicita una credencial distinta.

---

#### UC-12 — Consultar Historial de Palé

| Campo | Valor |
|---|---|
| **Denominación** | UC-12 — Consultar historial de palé |
| **Actores** | Operario de Pista, Administrador |
| **Incluye** | UC-09 (Autenticar usuario) |
| **Iteración** | 3ª — prioridad media |

**Precondiciones:**
- El usuario tiene sesión iniciada.
- El palé existe en el sistema (puede estar activo o expedido).

**Flujo principal (escenario de éxito):**

| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Localiza el palé (directamente o vía UC-10) y solicita ver su historial. |
| 2 | Sistema | Recupera todos los movimientos asociados al palé, ordenados cronológicamente. |
| 3 | Sistema | Presenta la línea de tiempo: tipo de operación, sector origen, sector destino, sello temporal y operario responsable. |
| 4 | Usuario | Navega por el historial. Opcionalmente filtra por tipo de operación o rango de fechas. |
| 5 | Sistema | Actualiza la vista con los filtros aplicados. |

**Postcondiciones:**
- El usuario dispone de la traza completa de movimientos del palé, útil para auditorías e incidencias.

---

### 3.4 Prototipos de Casos de Uso

Los prototipos de interfaz de usuario constituyen un artefacto de validación: permiten contrastar, antes de comenzar la implementación, que el diseño de pantallas es coherente con lo descrito en los casos de uso y que satisface los requisitos de usabilidad (RS-04). Se presentan como bocetos de baja fidelidad (wireframes) que no implican decisiones de diseño visual definitivas.

#### Figura 15 — Prototipo: Layout Virtual (pantalla principal — UC-03)

```
┌─────────────────────────────────────────────────────────────────────┐
│  MÓDULO LOGÍSTICO WEB — ALMACÉN SANTANDER           [Diego M. ▼]   │
├─────────────────────────────────────────────────────────────────────┤
│  [+ Nueva entrada]  [↑ Registrar salida]  [↔ Reubicar]  [📊 Más]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │  A1    │  │  A2    │  │  A3    │  │  B1    │  │  B2    │  ...  │
│  │ 45 %   │  │ 78 %   │  │ 91 %   │  │ 12 %   │  │100 %   │       │
│  │  5/11  │  │  7/9   │  │ 11/12  │  │  2/17  │  │ 12/12  │       │
│  │[VERDE] │  │[ÁMBAR] │  │ [ROJO] │  │[VERDE] │  │ [ROJO] │       │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘       │
│                                                                     │
│  ... (38 sectores en total) ...                                     │
│                                                                     │
│  Última actualización: hace 12 s              [Actualizar ahora]   │
└─────────────────────────────────────────────────────────────────────┘
```

**Figura 15.** Prototipo de interfaz — Layout Virtual (pantalla principal, UC-03).

---

#### Figura 16 — Prototipo: Formulario de Entrada de Palé (UC-01)

```
┌────────────────────────────────────────────┐
│  ← Volver al mapa       NUEVA ENTRADA      │
├────────────────────────────────────────────┤
│  Código de referencia:                     │
│  ┌────────────────────────────────────┐    │
│  │  JH-____-_  (autocompletado)       │    │
│  └────────────────────────────────────┘    │
│                                            │
│  Tipo de material:                         │
│  ┌────────────────────────────────────┐    │
│  │  ▼ Seleccionar tipo...             │    │
│  └────────────────────────────────────┘    │
│                                            │
│  Masa aproximada (kg):                     │
│  ┌────────────────────────────────────┐    │
│  │  _____ kg                          │    │
│  └────────────────────────────────────┘    │
│                                            │
│  Sector destino:                           │
│  ┌────────────────────────────────────┐    │
│  │  ▼ Seleccionar en el mapa          │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ┌──────────────────────────────────┐      │
│  │     ✓ CONFIRMAR ENTRADA          │      │
│  └──────────────────────────────────┘      │
└────────────────────────────────────────────┘
```

**Figura 16.** Prototipo de interfaz — Formulario de registro de entrada (UC-01).

---

#### Figura 17 — Prototipo: Panel de Detalle de Sector (UC-03)

```
┌───────────────────────────────────────────┐
│  SECTOR B4  —  11 / 12 palés (91 %)  [✕] │
│  Zona: Bloque B — Fachada Norte           │
├───────────────────────────────────────────┤
│  REFERENCIA     MATERIAL      ENTRADA     │
│  JH-8819-A   Pizarras Ens.  12/05/2026   │
│  JH-7203-B   Fibrocemento   08/05/2026   │
│  JH-6541-C   Fibrocemento   08/05/2026   │
│  ...                                      │
├───────────────────────────────────────────┤
│  [↔ Reubicar palé]  [↑ Registrar salida] │
└───────────────────────────────────────────┘
```

**Figura 17.** Prototipo de interfaz — Panel de detalle de sector (UC-03).

---

### 3.5 Estructura del Modelo de Casos de Uso

La estructura del modelo de casos de uso formaliza las relaciones de **inclusión** y **extensión** entre casos de uso, identificando la funcionalidad compartida y los flujos opcionales (Larman, 2004).

#### Relaciones de inclusión (`<<include>>`)

| Caso de uso | Incluye | Justificación |
|---|---|---|
| UC-01, UC-02, UC-03, UC-04, UC-10, UC-11, UC-12 | UC-09 (Autenticar usuario) | Todo acceso al sistema requiere verificación de credenciales. Es un subflujo obligatorio, incondicional y compartido. |
| UC-01, UC-03 | UC-07 (Calcular saturación) | Ambos casos de uso necesitan el porcentaje de ocupación de los sectores para su correcta presentación. |

#### Relaciones de extensión (`<<extend>>`)

| Caso de uso base | Extendido por | Condición de activación |
|---|---|---|
| UC-01 (Registrar entrada) | UC-08 (Registrar incidencia) | El operario detecta una anomalía en el palé durante el proceso de registro de entrada. |

---

**Figura 18.** Diagrama de Estructura del Modelo de Casos de Uso (relaciones include/extend).

```plantuml
@startuml
!theme plain
title Figura 18: Estructura del Modelo de Casos de Uso

usecase "UC-01\nRegistrar entrada\nde palé" as UC01
usecase "UC-02\nRegistrar salida\nde palé" as UC02
usecase "UC-03\nConsultar layout\ninteractivo" as UC03
usecase "UC-04\nReubicar palé" as UC04
usecase "UC-07\nCalcular saturación\nde sector" as UC07
usecase "UC-08\nRegistrar incidencia\noperativa" as UC08
usecase "UC-09\nAutenticar\nusuario" as UC09
usecase "UC-10\nBuscar palé\npor referencia" as UC10
usecase "UC-11\nGestionar\nusuarios" as UC11
usecase "UC-12\nConsultar historial\nde palé" as UC12

UC01 ..> UC09 : <<include>>
UC02 ..> UC09 : <<include>>
UC03 ..> UC09 : <<include>>
UC04 ..> UC09 : <<include>>
UC10 ..> UC09 : <<include>>
UC11 ..> UC09 : <<include>>
UC12 ..> UC09 : <<include>>
UC01 ..> UC07 : <<include>>
UC03 ..> UC07 : <<include>>
UC01 ..> UC08 : <<extend>>\n[errorDetectado]

note right of UC09 : Subflujo obligatorio\ncompartido por todos\nlos casos de uso\ncon actores humanos.

note right of UC07 : Subflujo de cálculo\nde ocupación,\nnecesario para la\npresentación del\nlayout y el registro\nde operaciones.
@enduml
```

---

## 4. Matriz de Trazabilidad

La matriz de trazabilidad garantiza la correspondencia entre los requisitos capturados en este capítulo y los artefactos que los satisfacen. Constituye evidencia de coherencia entre el escenario descrito en el Capítulo 1 y lo especificado aquí.

| Necesidad (Capítulo 1) | Artefacto en Capítulo 2 | Capítulo que lo implementa |
|---|---|---|
| Registro de entradas en tiempo real (sustitución del papel) | UC-01, RS-01, RS-07 | Cap. 3 (diseño), Cap. 4 (solución) |
| Registro de salidas autorizado | UC-02, RS-03 | Cap. 3, Cap. 4 |
| Visibilidad del estado del almacén en tiempo real | UC-03, RS-01, Glosario "Layout virtual", Figura 15 | Cap. 3, Cap. 4 |
| Reubicación de palés entre sectores | UC-04 | Cap. 3, Cap. 4 |
| Localización rápida de un palé concreto | UC-10 | Cap. 3, Cap. 4 |
| Trazabilidad y auditoría de movimientos | UC-12, Clase Movimiento (Figura 1) | Cap. 3, Cap. 4 |
| Gestión de accesos del personal | UC-11, RS-03, Actores | Cap. 3, Cap. 4 |
| Integración con el sistema Rollship (James Hardie) | Actor Motor Rollship, UC-03 API, RS-05, Figura 8 | Cap. 3, Cap. 4 |
| Migración del histórico de MS Access | UC-06, Actor MS Access | Cap. 4 |
| Operabilidad con guantes en nave industrial | RS-04, Figuras 15-17 (wireframes) | Cap. 3 (diseño UI) |
| Integridad del inventario sin pérdida de registros | RS-07, Figura 3 (ciclo de vida palé) | Cap. 3 (arquitectura) |
| Control de acceso por roles (operario / administrador) | RS-03, Actores, Figuras 5 y 6 (diagramas actor) | Cap. 3 (diseño) |
| Estadísticas de flujo para gerencia | UC-05 | Cap. 4 |

---

## 5. Referencias Bibliográficas del Capítulo

Kruchten, P. (2004). *The rational unified process: An introduction* (3.ª ed.). Addison-Wesley.

Larman, C. (2004). *Applying UML and patterns: An introduction to object-oriented analysis and design and iterative development* (3.ª ed.). Prentice Hall.

Object Management Group. (2017). *Unified Modeling Language specification version 2.5.1*. OMG. https://www.omg.org/spec/UML/2.5.1/

Pressman, R. S., & Maxim, B. R. (2020). *Software engineering: A practitioner's approach* (9.ª ed.). McGraw-Hill.

Sommerville, I. (2015). *Software engineering* (10.ª ed.). Pearson.

W3C. (2018). *Web content accessibility guidelines (WCAG) 2.1*. World Wide Web Consortium. https://www.w3.org/TR/WCAG21/

Wiegers, K. E., & Beatty, J. (2013). *Software requirements* (3.ª ed.). Microsoft Press.

---

*Fin del Capítulo 2*
