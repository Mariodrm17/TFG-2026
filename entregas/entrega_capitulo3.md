# Capítulo 3: Análisis y Diseño

---

## 3.1. Introducción

El presente capítulo constituye el núcleo de ingeniería abstracta de este Trabajo de Fin de Grado. Su propósito es doble: en primer lugar, refinar los doce casos de uso obtenidos en el Capítulo 2 mediante el lenguaje de los desarrolladores, introduciendo el formalismo necesario para tomar decisiones sobre el funcionamiento interno del sistema; en segundo lugar, producir los modelos y artefactos que permitan abordar la implementación —descrita en el Capítulo 4— como un refinamiento natural y predecible del diseño, sin alterar su estructura fundamental.

Para ello, el capítulo se organiza en torno a las dos disciplinas que lo articulan metodológicamente (Larman, 2004):

- **Disciplina de Análisis:** traduce los Casos de Uso y el Modelo del Dominio definidos en el Capítulo 2 a un conjunto de clases de análisis —Modelo, Vista y Controlador— que capturan los requisitos en lenguaje de diseñador sin imponer todavía restricciones tecnológicas. El resultado es una comprensión más precisa y mantenible de lo que el sistema debe hacer.

- **Disciplina de Diseño:** enfrenta los requisitos no funcionales y el dominio de la solución. Aquí se toman las decisiones técnicas sobre arquitectura, distribución de componentes, interacción entre capas y persistencia de datos, justificando cada elección en los requisitos suplementarios (RS-01 a RS-07) identificados en el capítulo anterior. El diseño aplica los principios de alta cohesión y bajo acoplamiento (Larman, 2004) y los principios SOLID (Martin, 2003) como guías de calidad estructural.

La trazabilidad entre ambas disciplinas —y entre estas y los Casos de Uso del Capítulo 2— constituye el eje vertebrador de este capítulo y garantiza que ninguna decisión de diseño sea arbitraria: toda clase, toda relación y toda decisión arquitectónica tiene su origen en un requisito documentado.

---

## 3.2. Disciplina de Análisis

### 3.2.1. Identificación de Clases de Análisis

La estrategia de identificación de clases de análisis parte, según las convenciones de Larman (2004), de dos fuentes complementarias: la **descripción textual de los Casos de Uso** y el **Modelo del Dominio** establecido en el Capítulo 2. Ambas fuentes se combinan para producir tres categorías de clases de análisis:

| Tipo de Clase | Criterio de derivación | Responsabilidad |
|---|---|---|
| **Modelo** | Entidades del Modelo del Dominio más los sustantivos clave en las descripciones de CdU | Representar los datos y la lógica de negocio del dominio |
| **Vista** | Una clase principal por cada actor humano; una clase primitiva por cada clase Modelo; una clase central por cada actor sistema externo | Intermediar entre el usuario y el sistema; presentar datos |
| **Controlador** | Una clase por cada Caso de Uso | Orquestar la ejecución de cada CdU, coordinando Modelos y Vistas |

#### 3.2.1.1. Clases Modelo

Estudiando el Modelo del Dominio (sección 2.2 del Capítulo 2) y las descripciones de los doce Casos de Uso, se identifican las siguientes clases Modelo:

| Clase Modelo | Origen | CdU en que participa |
|---|---|---|
| `Pale` | Entidad central del Modelo del Dominio; objeto directo de manipulación en toda descripción de CdU | UC-01, UC-02, UC-04, UC-07, UC-08, UC-10, UC-12 |
| `Sector` | Entidad del Dominio; contenedor físico de palés; su saturación es el dato clave del layout | UC-01, UC-02, UC-03, UC-04, UC-07 |
| `Movimiento` | Entidad del Dominio; registro transaccional de toda operación sobre un palé | UC-01, UC-02, UC-04, UC-08, UC-12 |
| `Mercancia` | Categoría de producto de James Hardie; necesaria para catalogar el inventario | UC-01 |
| `Usuario` | El Modelo del Dominio define `Operario` con credenciales y rol; toda interacción humana requiere autenticación | UC-09, UC-11 (y precondición de todos los CdU humanos) |
| `Incidencia` | Situación anómala asociada a un palé; estado específico del ciclo de vida del Modelo del Dominio | UC-08 |

#### 3.2.1.2. Clases Vista

Aplicando las reglas de derivación:

**a) Ventanas principales (una por actor humano):**

| Clase Vista — Ventana Principal | Actor que la origina |
|---|---|
| `IUPrincipalOperario` | Operario de Pista — acceso a entrada, salida, layout, reubicación y búsqueda |
| `IUPrincipalAdministrador` | Administrador — panel con acceso completo al sistema |

**b) Vistas primitivas (una por clase Modelo + formularios funcionales):**

| Clase Vista — Primitiva | Clase Modelo asociada | CdU |
|---|---|---|
| `IUFormEntradaPale` | `Pale` | UC-01 — Formulario de registro de entrada |
| `IUFormSalidaPale` | `Pale`, `Sector` | UC-02 — Formulario de registro de salida |
| `IUCardSector` | `Sector` | UC-03 — Tarjeta visual del sector con semáforo |
| `IUFormReubicacion` | `Pale`, `Sector` | UC-04 — Formulario de selección de destino |
| `IUPanelEstadisticas` | `Movimiento`, `Sector` | UC-05 — Panel de KPIs e informes |
| `IUVolcadoAccess` | (ETL) | UC-06 — Interfaz de carga y progreso de migración |
| `IUBuscador` | `Pale` | UC-10 — Campo de búsqueda por código de referencia |
| `IUPanelUsuarios` | `Usuario` | UC-11 — Panel CRUD de cuentas de operario |
| `IUHistorialPale` | `Movimiento` | UC-12 — Línea de tiempo de movimientos de un palé |
| `IUFormIncidencia` | `Incidencia`, `Pale` | UC-08 — Formulario de registro de anomalía |
| `IUFormLogin` | `Usuario` | UC-09 — Pantalla de autenticación |

**c) Interfaces centrales (una por actor sistema externo):**

| Clase Vista — Central | Actor Sistema que la origina |
|---|---|
| `IUConectorRollship` | Motor Rollship — expone los datos procesados al ERP corporativo vía API REST |
| `IUVolcadoAccess` | MS Access (legado) — gestiona el proceso ETL de migración de datos históricos |

#### 3.2.1.3. Clases Controlador

Siguiendo la regla de una clase Controlador por Caso de Uso:

| Clase Controlador | CdU que gestiona | Tipo | Responsabilidad principal |
|---|---|---|---|
| `ControladorEntradaPale` | UC-01 | Principal | Validar datos, comprobar capacidad del sector con bloqueo de fila (FOR UPDATE), persistir el palé y el movimiento de ENTRADA dentro de una transacción ACID |
| `ControladorSalidaPale` | UC-02 | Principal | Verificar estado del palé, actualizarlo a *expedido*, decrementar ocupación del sector y registrar movimiento de SALIDA |
| `ControladorLayout` | UC-03 | Principal | Recuperar el estado de los 38 sectores con porcentaje de saturación y semáforo cromático |
| `ControladorReubicacion` | UC-04 | Principal | Bloquear palé y sector destino simultáneamente, mover el palé actualizando contadores de ambos sectores, registrar movimiento de REUBICACION |
| `ControladorEstadisticas` | UC-05 | Principal | Agregar KPIs globales, movimientos por tipo y período, sectores más ocupados y distribución de estados de palés |
| `ControladorMigracion` | UC-06 | Principal | Orquestar el proceso ETL: leer el volcado de MS Access, transformar, validar y cargar registros en el esquema MySQL |
| `ControladorSaturacion` | UC-07 | **Subflujo interno** | Calcular `(ocupacion_actual / capacidad_max) × 100` y determinar el código cromático del semáforo; invocado por UC-01 y UC-03 |
| `ControladorIncidencia` | UC-08 | Principal | Registrar la anomalía, cambiar el estado del palé a *Incidencia*, bloquear operaciones sobre él y notificar al administrador |
| `ControladorAutenticacion` | UC-09 | **Subflujo interno** | Verificar credenciales con bcrypt, generar token JWT firmado con rol de usuario; invocado por todos los CdU con actores humanos |
| `ControladorBusqueda` | UC-10 | Principal | Consultar el inventario activo filtrando por código de referencia (búsqueda parcial LIKE) y devolver el palé localizado con su sector actual |
| `ControladorUsuarios` | UC-11 | Principal | Crear, modificar y desactivar cuentas de operario; garantizar unicidad de credencial y registrar la operación en el log de auditoría |
| `ControladorHistorial` | UC-12 | Principal | Recuperar todos los movimientos asociados a un palé, ordenados cronológicamente, con datos de sector origen/destino y operario responsable |

#### 3.2.1.4. Diagrama de Clases de Análisis

El siguiente diagrama muestra la estructura completa de clases de análisis agrupadas por estereotipo UML, con sus relaciones de dependencia y navegabilidad (Larman, 2004):

```mermaid
classDiagram
    %% ────────── CLASES MODELO ──────────
    class Pale {
        <<model>>
        +String codigoRef
        +String estado
        +Date fechaEntrada
        +Date fechaSalida
        +registrarEntrada()
        +registrarSalida()
        +reubicar()
        +buscarPorReferencia()
    }
    class Sector {
        <<model>>
        +String codigo
        +int capacidadMax
        +int ocupacionActual
        +calcularSaturacion() float
        +estaDisponible() bool
        +incrementarOcupacion()
        +decrementarOcupacion()
    }
    class Movimiento {
        <<model>>
        +String tipo
        +DateTime fechaHora
        +String notas
        +registrar()
    }
    class Mercancia {
        <<model>>
        +String codigo
        +String descripcion
        +String tipo
        +float pesoKg
    }
    class Usuario {
        <<model>>
        +String email
        +String rol
        +autenticar() bool
        +generarToken() String
        +desactivar()
    }
    class Incidencia {
        <<model>>
        +String tipo
        +String descripcion
        +DateTime fechaRegistro
        +Boolean resuelta
        +resolver()
    }

    %% ────────── CLASES CONTROLADOR (una por CdU) ──────────
    class ControladorEntradaPale {
        <<controller>>
        +ejecutar(datos, usuarioId)
    }
    class ControladorSalidaPale {
        <<controller>>
        +ejecutar(paleId, usuarioId)
    }
    class ControladorLayout {
        <<controller>>
        +ejecutar()
    }
    class ControladorReubicacion {
        <<controller>>
        +ejecutar(paleId, sectorDestinoId, usuarioId)
    }
    class ControladorEstadisticas {
        <<controller>>
        +ejecutar(filtros)
    }
    class ControladorMigracion {
        <<controller>>
        +ejecutar(ficheroAccess)
    }
    class ControladorSaturacion {
        <<controller>>
        note "Subflujo interno\nActivado por UC-01 y UC-03"
        +calcular(sectorId) float
        +determinarColor(pct) String
    }
    class ControladorIncidencia {
        <<controller>>
        +ejecutar(paleId, tipo, descripcion, usuarioId)
    }
    class ControladorAutenticacion {
        <<controller>>
        note "Subflujo interno\nActivado por todos los CdU humanos"
        +ejecutar(email, password) Token
    }
    class ControladorBusqueda {
        <<controller>>
        +ejecutar(codigoRef, filtros)
    }
    class ControladorUsuarios {
        <<controller>>
        +crear(datos)
        +modificar(id, datos)
        +desactivar(id)
    }
    class ControladorHistorial {
        <<controller>>
        +ejecutar(paleId, filtros)
    }

    %% ────────── RELACIONES MODELO ──────────
    Pale "1" --> "1..*" Movimiento : genera
    Pale "0..*" --> "0..1" Sector : ubicado en
    Pale "0..1" --> "1" Mercancia : categorizado por
    Pale "1" --> "0..*" Incidencia : puede tener
    Movimiento "0..*" --> "1" Usuario : registrado por
    Movimiento "0..1" --> "1" Sector : sector origen
    Movimiento "0..1" --> "1" Sector : sector destino

    %% ────────── RELACIONES CONTROLADOR → MODELO ──────────
    ControladorEntradaPale ..> Pale : crea
    ControladorEntradaPale ..> Sector : bloquea / actualiza
    ControladorEntradaPale ..> Movimiento : crea
    ControladorSalidaPale ..> Pale : actualiza estado
    ControladorSalidaPale ..> Sector : decrementa
    ControladorSalidaPale ..> Movimiento : crea
    ControladorLayout ..> Sector : consulta todos
    ControladorReubicacion ..> Pale : mueve
    ControladorReubicacion ..> Sector : verifica ambos
    ControladorReubicacion ..> Movimiento : crea
    ControladorEstadisticas ..> Movimiento : agrega
    ControladorEstadisticas ..> Sector : agrega
    ControladorSaturacion ..> Sector : calcula pct
    ControladorIncidencia ..> Pale : cambia estado
    ControladorIncidencia ..> Incidencia : crea
    ControladorAutenticacion ..> Usuario : verifica
    ControladorBusqueda ..> Pale : consulta por ref
    ControladorUsuarios ..> Usuario : gestiona
    ControladorHistorial ..> Movimiento : recupera
    ControladorHistorial ..> Pale : lee
```

---

### 3.2.2. Análisis de los Casos de Uso

El análisis de los Casos de Uso produce las **realizaciones de análisis**: diagramas de secuencia que muestran cómo interactúan las clases de análisis para dar cumplimiento a cada CdU, sin entrar todavía en tecnologías concretas. Se detallan los casos de uso de mayor peso funcional y complejidad concurrente.

#### 3.2.2.1. Realización de UC-01: Registrar Entrada de Palé

El CdU de mayor criticidad operativa. Involucra control de concurrencia explícito: si dos operarios intentan ubicar palés en el mismo sector simultáneamente, solo uno debe triunfar. El análisis refleja esta lógica de bloqueo en la interacción con `Sector`.

```mermaid
sequenceDiagram
    actor Operario
    participant IUFormEntradaPale
    participant ControladorEntradaPale
    participant ControladorAutenticacion
    participant ControladorSaturacion
    participant Sector
    participant Pale
    participant Movimiento

    Operario->>IUFormEntradaPale: introducir(codigoRef, sectorId, tipoMercancia)
    IUFormEntradaPale->>ControladorAutenticacion: verificarSesion(token)
    ControladorAutenticacion-->>IUFormEntradaPale: sesión válida (usuarioId, rol)
    IUFormEntradaPale->>ControladorEntradaPale: ejecutar(datos, usuarioId)

    ControladorEntradaPale->>Pale: existeActivo(codigoRef)
    Pale-->>ControladorEntradaPale: false (código no duplicado)

    ControladorEntradaPale->>Sector: bloquearYLeer(sectorId)
    Note over Sector: Bloqueo exclusivo (FOR UPDATE)<br/>Garantía ACID de concurrencia

    Sector-->>ControladorEntradaPale: {ocupacionActual, capacidadMax}
    ControladorEntradaPale->>ControladorSaturacion: calcular(sector)
    ControladorSaturacion-->>ControladorEntradaPale: pct, codigoColor

    alt Sector disponible
        ControladorEntradaPale->>Pale: crear(codigoRef, sectorId, mercanciaId)
        Pale-->>ControladorEntradaPale: paleId
        ControladorEntradaPale->>Sector: incrementarOcupacion(sectorId)
        ControladorEntradaPale->>Movimiento: registrar(paleId, ENTRADA, sectorId, usuarioId)
        ControladorEntradaPale-->>IUFormEntradaPale: éxito
        IUFormEntradaPale-->>Operario: confirmación + semáforo actualizado
    else Sector lleno
        ControladorEntradaPale-->>IUFormEntradaPale: error "Capacidad máxima superada"
        IUFormEntradaPale-->>Operario: alerta "Seleccione otro sector"
    end
```

#### 3.2.2.2. Realización de UC-02: Registrar Salida de Palé

```mermaid
sequenceDiagram
    actor Operario
    participant IUFormSalidaPale
    participant ControladorSalidaPale
    participant Pale
    participant Sector
    participant Movimiento

    Operario->>IUFormSalidaPale: buscarPale(codigoRef)
    IUFormSalidaPale->>ControladorSalidaPale: ejecutar(paleId, usuarioId)
    ControladorSalidaPale->>Pale: bloquearYLeer(paleId)
    Note over Pale: Verifica estado != 'expedido'

    alt Palé válido en almacén
        Pale-->>ControladorSalidaPale: pale{sectorId, estado='emplazado'}
        ControladorSalidaPale->>Pale: actualizarEstado(paleId, 'expedido', fechaSalida=ahora)
        ControladorSalidaPale->>Sector: decrementarOcupacion(sectorId)
        ControladorSalidaPale->>Movimiento: registrar(paleId, SALIDA, sectorOrigen, usuarioId)
        ControladorSalidaPale-->>IUFormSalidaPale: éxito
        IUFormSalidaPale-->>Operario: confirmación de expedición
    else Palé ya expedido o no encontrado
        ControladorSalidaPale-->>IUFormSalidaPale: error de estado
        IUFormSalidaPale-->>Operario: alerta descriptiva
    end
```

#### 3.2.2.3. Realización de UC-03: Consultar Layout Interactivo

CdU de lectura pura con mayor frecuencia de invocación. Se refresca automáticamente sin intervención del usuario. No requiere control de escritura, pero sí que la consulta mantenga el estándar de respuesta sub-segundo (RS-01).

```mermaid
sequenceDiagram
    actor Usuario
    participant IUPrincipalOperario
    participant ControladorLayout
    participant ControladorSaturacion
    participant Sector

    Note over IUPrincipalOperario: Carga inicial o refresco automático (30 s)
    IUPrincipalOperario->>ControladorLayout: ejecutar()
    ControladorLayout->>Sector: consultarTodos()
    Sector-->>ControladorLayout: lista[38 sectores con ocupacion]
    loop Para cada sector
        ControladorLayout->>ControladorSaturacion: calcular(sector)
        ControladorSaturacion-->>ControladorLayout: pct, codigoColor
    end
    ControladorLayout->>ControladorLayout: calcularResumenGlobal(lista)
    ControladorLayout-->>IUPrincipalOperario: {sectores, resumen}
    loop Para cada sector
        IUPrincipalOperario->>IUCardSector: renderizarSemaforo(sector)
    end
    IUPrincipalOperario-->>Usuario: mapa interactivo de 38 sectores
```

#### 3.2.2.4. Realización de UC-04: Reubicar Palé entre Sectores

CdU de mayor complejidad transaccional: involucra el bloqueo simultáneo de dos sectores para evitar condiciones de carrera (*race conditions*) durante la reubicación.

```mermaid
sequenceDiagram
    actor Operario
    participant IUFormReubicacion
    participant ControladorReubicacion
    participant Pale
    participant SectorOrigen
    participant SectorDestino
    participant Movimiento

    Operario->>IUFormReubicacion: seleccionar palé y sector destino
    IUFormReubicacion->>ControladorReubicacion: ejecutar(paleId, sectorDestinoId, usuarioId)

    ControladorReubicacion->>Pale: bloquearYLeer(paleId)
    Pale-->>ControladorReubicacion: pale{sectorOrigenId, estado='emplazado'}
    ControladorReubicacion->>SectorDestino: bloquearYLeer(sectorDestinoId)
    Note over SectorDestino: Bloqueo en orden determinístico<br/>para evitar deadlock entre transacciones

    alt Sector destino disponible y palé no ya allí
        ControladorReubicacion->>Pale: actualizarSector(paleId, sectorDestinoId)
        ControladorReubicacion->>SectorOrigen: decrementarOcupacion(sectorOrigenId)
        ControladorReubicacion->>SectorDestino: incrementarOcupacion(sectorDestinoId)
        ControladorReubicacion->>Movimiento: registrar(paleId, REUBICACION, origen, destino, usuarioId)
        ControladorReubicacion-->>IUFormReubicacion: éxito
        IUFormReubicacion-->>Operario: confirmación + mapa actualizado
    else Error de capacidad o palé ya en destino
        ControladorReubicacion-->>IUFormReubicacion: error descriptivo
        IUFormReubicacion-->>Operario: alerta
    end
```

#### 3.2.2.5. Realización de UC-09: Autenticar Usuario *(subflujo)*

UC-09 es un subflujo común incluido por todos los CdU con actores humanos. Su análisis modela la verificación de credenciales y la emisión del token de sesión.

```mermaid
sequenceDiagram
    actor Usuario
    participant IUFormLogin
    participant ControladorAutenticacion
    participant UsuarioModel

    Usuario->>IUFormLogin: introducir(email, password)
    IUFormLogin->>ControladorAutenticacion: ejecutar(email, password)
    ControladorAutenticacion->>UsuarioModel: buscarPorEmail(email)
    UsuarioModel-->>ControladorAutenticacion: usuario{passwordHash, rol, activo}

    alt Credenciales válidas y usuario activo
        ControladorAutenticacion->>ControladorAutenticacion: verificarPassword(password, hash)
        ControladorAutenticacion->>ControladorAutenticacion: generarToken(id, nombre, rol)
        ControladorAutenticacion-->>IUFormLogin: {token, usuario}
        IUFormLogin-->>Usuario: redirigir a pantalla principal según rol
    else Credenciales incorrectas
        ControladorAutenticacion-->>IUFormLogin: error 401 (sin especificar campo)
        IUFormLogin-->>Usuario: mensaje de error genérico
    end
```

#### 3.2.2.6. Realización de UC-10: Buscar Palé por Referencia

```mermaid
sequenceDiagram
    actor Usuario
    participant IUBuscador
    participant ControladorBusqueda
    participant Pale
    participant Sector

    Usuario->>IUBuscador: introducir codigoRef (completo o parcial)
    IUBuscador->>ControladorBusqueda: ejecutar(codigoRef, filtros)
    ControladorBusqueda->>Pale: buscarPorReferencia(codigoRef)
    Pale-->>ControladorBusqueda: lista[palés coincidentes]

    alt Resultados encontrados
        loop Para cada palé
            ControladorBusqueda->>Sector: obtenerDetalle(sectorId)
            Sector-->>ControladorBusqueda: {codigo, nombre, porcentajeSaturacion}
        end
        ControladorBusqueda-->>IUBuscador: lista[{pale, sector}]
        IUBuscador->>IUCardSector: resaltarSector(sectorId)
        IUBuscador-->>Usuario: resultados + palé resaltado en el layout
    else Sin resultados
        ControladorBusqueda-->>IUBuscador: lista vacía
        IUBuscador-->>Usuario: "Sin coincidencias. Amplíe los criterios."
    end
```

#### 3.2.2.7. Realización de UC-12: Consultar Historial de Palé

```mermaid
sequenceDiagram
    actor Usuario
    participant IUHistorialPale
    participant ControladorHistorial
    participant Pale
    participant Movimiento

    Usuario->>IUHistorialPale: solicitar historial (directamente o vía UC-10)
    IUHistorialPale->>ControladorHistorial: ejecutar(paleId, filtros)
    ControladorHistorial->>Pale: verificarExistencia(paleId)
    Pale-->>ControladorHistorial: pale{codigoRef, estado}
    ControladorHistorial->>Movimiento: recuperarPorPale(paleId, filtros)
    Note over Movimiento: Recupera tipo, fecha, sectores origen/destino<br/>y operario responsable de cada movimiento
    Movimiento-->>ControladorHistorial: lista[movimientos ordenados ASC]
    ControladorHistorial-->>IUHistorialPale: {pale, historial}
    IUHistorialPale-->>Usuario: línea de tiempo de movimientos
```

---

### 3.2.3. Análisis de Paquetes

En esta fase de análisis se identifican los agrupamientos lógicos de clases que evolucionarán hacia los paquetes de implementación. Se detectan cuatro grandes áreas de responsabilidad, respetando los principios de alta cohesión interna y bajo acoplamiento externo (Larman, 2004):

```mermaid
graph TD
    subgraph PA["Paquete: Gestión de Inventario (núcleo operativo)"]
        direction LR
        P1["ControladorEntradaPale · ControladorSalidaPale\nControladorReubicacion · ControladorSaturacion\nControladorIncidencia"]
        P2["Pale · Sector · Movimiento · Mercancia · Incidencia"]
    end
    subgraph PB["Paquete: Consulta y Reporting"]
        direction LR
        P3["ControladorLayout · ControladorEstadisticas\nControladorBusqueda · ControladorHistorial"]
        P4["IUCardSector · IUBuscador · IUHistorialPale\nIUPanelEstadisticas · IUPrincipalOperario · IUPrincipalAdministrador"]
    end
    subgraph PC["Paquete: Seguridad y Acceso"]
        direction LR
        P5["ControladorAutenticacion · ControladorUsuarios\nUsuario · IUFormLogin · IUPanelUsuarios"]
    end
    subgraph PD["Paquete: Integración y Migración"]
        direction LR
        P6["ControladorMigracion · IUConectorRollship · IUVolcadoAccess"]
    end

    PA -->|"usa"| PB
    PA -->|"usa"| PC
    PB -->|"usa"| PC
```

Esta segmentación responde directamente a los requisitos suplementarios: el núcleo de inventario exige el nivel más alto de protección transaccional (ACID — RS-07), la consulta y reporting puede tolerar lecturas diferidas (refresco cada 30 s — RS-01), el paquete de seguridad gestiona las fronteras de autenticación (RS-03), y el de integración maneja los actores sistema externos.

---

## 3.3. Disciplina de Diseño

### 3.3.1. Decisiones Arquitectónicas y Justificación

Las decisiones de arquitectura no son elecciones arbitrarias: cada una responde a uno o varios de los requisitos suplementarios identificados en el Capítulo 2. La siguiente tabla documenta explícitamente esta trazabilidad:

| Decisión Arquitectónica | Requisito No Funcional | Justificación técnica |
|---|---|---|
| **Arquitectura en tres capas** (Presentación → Aplicación → Datos) | RS-06 Mantenibilidad, RS-05 Portabilidad | Desacopla la UI del negocio y del esquema de datos; permite modificar cada capa de forma independiente (Fowler, 2002) |
| **API REST sin estado** (Node.js + Express) | RS-05 Portabilidad, integración Rollship | Cualquier cliente (tablet, Rollship) consume la misma API; elimina dependencia de sesiones de servidor (Fielding, 2000) |
| **SPA React + Vite** | RS-04 Usabilidad *mobile-first*, RS-01 Rendimiento | Elimina recargas de página completa; actualización parcial (AJAX) reduce el *delay* perceptible en pista logística |
| **MySQL 8.0 InnoDB con ACID y Row-Level Locking** | RS-07 Integridad, RS-02 Disponibilidad | InnoDB bloquea solo la fila afectada (no la tabla entera como MS Access); garantiza Atomicidad, Consistencia, Aislamiento y Durabilidad (Oracle Corporation, 2023) |
| **JWT para autenticación stateless** | RS-03 Seguridad | El token porta la identidad del usuario en cada petición HTTP; el servidor no mantiene sesiones en memoria; compatible con SPA y con consumo externo desde Rollship |
| **Patrón MVC en backend** | RS-06 Mantenibilidad, cohesión funcional | Los controladores gestionan el flujo; los modelos encapsulan el acceso a datos; las rutas expresan el contrato REST (Gamma et al., 1994) |
| **Pool de conexiones MySQL2** | RS-01 Rendimiento, RS-02 Disponibilidad | Reutiliza conexiones abiertas (límite configurable: 10 por defecto); elimina la latencia de apertura en cada petición |
| **Índices estratégicos en `movimientos`** | RS-01 Rendimiento | La tabla crece ~68.000 registros/año; los índices sobre `fecha_hora`, `tipo` y `pale_id` garantizan las consultas de historial y estadísticas dentro del umbral sub-segundo |

#### 3.3.1.1. Arquitectura en Tres Capas

La arquitectura adoptada sigue el patrón de **tres capas** (*3-tier architecture*) canónico para sistemas de información web (Fowler, 2002):

```mermaid
graph TD
    subgraph CAPA1["Capa de Presentación — Cliente"]
        C1A["React 18 + Vite (SPA)"]
        C1B["Navegador: tablet / PC oficina"]
        C1A --- C1B
    end
    subgraph CAPA2["Capa de Aplicación — Servidor"]
        C2A["Node.js 18 LTS + Express 4"]
        C2B["Rutas REST\n/api/auth · /api/pales · /api/sectores · /api/stats"]
        C2C["Controladores\nauthCtrl · paleCtrl · sectorCtrl · statsCtrl"]
        C2D["Middleware JWT\n(verificarToken · soloAdmin)"]
        C2A --> C2B --> C2C
        C2A --> C2D
    end
    subgraph CAPA3["Capa de Datos — Persistencia"]
        C3A["MySQL 8.0 — Motor InnoDB"]
        C3B["wms_almacen\nutf8mb4_unicode_ci"]
        C3C["Tablas: usuarios · sectores · mercancia\npales · movimientos · migracion_access"]
        C3A --> C3B --> C3C
    end
    subgraph EXT["Sistemas Externos"]
        E1["Motor Rollship\n(ERP James Hardie)"]
    end

    CAPA1 -->|"HTTP REST / JSON\nAuthorization: Bearer JWT"| CAPA2
    CAPA2 -->|"MySQL2 Pool\nTransacciones ACID"| CAPA3
    CAPA2 -->|"JSON + JWT"| CAPA1
    E1 -->|"GET /api/sectores\nGET /api/pales"| CAPA2
```

La comunicación entre la capa de presentación y la capa de aplicación se realiza exclusivamente mediante peticiones HTTP con payload JSON, siguiendo los principios REST de Fielding (2000): recursos nombrados por sustantivos (`/api/pales`, `/api/sectores`), verbos HTTP que expresan la operación (GET para lectura, POST para creación, PUT para modificación) y respuestas sin estado (el token JWT porta toda la información de identidad necesaria).

---

### 3.3.2. Clases de Diseño

#### 3.3.2.1. Transición del Análisis al Diseño

La transición del análisis al diseño es el proceso por el que las clases de análisis, independientes de la tecnología, se mapean a clases de implementación concretas del stack seleccionado. La siguiente tabla documenta explícitamente este mapeo para los doce casos de uso:

| Clase de Análisis | Tipo | Clase / Función de Diseño | Fichero de implementación |
|---|---|---|---|
| `Pale` | Model | Queries SQL en `paleController` | `backend/src/controllers/paleController.js` |
| `Sector` | Model | Queries SQL en `sectorController` | `backend/src/controllers/sectorController.js` |
| `Movimiento` | Model | INSERT transaccional en cada controlador de escritura | (incrustado en `paleController.js`) |
| `Mercancia` | Model | Tabla `mercancia` + LEFT JOIN en consultas de palés | `backend/sql/schema.sql` |
| `Usuario` | Model | Tabla `usuarios` + lógica JWT en `authController` | `backend/src/controllers/authController.js` |
| `Incidencia` | Model | Campo `estado='incidencia'` en tabla `pales` + campo `notas` en `movimientos` | `schema.sql` (sprint actual) |
| `IUPrincipalOperario` | View | `OperacionesPage` + `LayoutPage` | `frontend/src/pages/OperacionesPage.jsx`, `LayoutPage.jsx` |
| `IUPrincipalAdministrador` | View | `DashboardPage` | `frontend/src/pages/DashboardPage.jsx` |
| `IUFormEntradaPale` | View | Formulario modal en `OperacionesPage` | `frontend/src/pages/OperacionesPage.jsx` |
| `IUCardSector` | View | Componente `AlmacenMap` | `frontend/src/components/Layout/AlmacenMap` |
| `IUHistorialPale` / `IUBuscador` | View | Tabla de historial y buscador en `PalesPage` | `frontend/src/pages/PalesPage.jsx` |
| `IUFormLogin` | View | `LoginPage` | `frontend/src/pages/LoginPage.jsx` |
| `IUConectorRollship` | View | Endpoints REST `GET /api/sectores`, `GET /api/pales` | `backend/src/routes/sectorRoutes.js`, `paleRoutes.js` |
| `ControladorEntradaPale` | Controller | `entradaPale()` + `POST /api/pales/entrada` | `paleController.js`, `paleRoutes.js` |
| `ControladorSalidaPale` | Controller | `salidaPale()` + `POST /api/pales/:id/salida` | `paleController.js`, `paleRoutes.js` |
| `ControladorLayout` | Controller | `getLayout()` + `GET /api/sectores` | `sectorController.js`, `sectorRoutes.js` |
| `ControladorReubicacion` | Controller | `reubicarPale()` + `PUT /api/pales/:id/reubicar` | `paleController.js`, `paleRoutes.js` |
| `ControladorEstadisticas` | Controller | `getDashboard()` + `GET /api/stats` | `statsController.js`, `statsRoutes.js` |
| `ControladorSaturacion` | Controller | Cláusula SQL `CASE WHEN` interna a `getLayout()` | `sectorController.js` (líneas 15-22) |
| `ControladorAutenticacion` | Controller | `login()` + `POST /api/auth/login` | `authController.js`, `authRoutes.js` |
| `ControladorBusqueda` | Controller | `listarPales()` con parámetro `buscar` + `GET /api/pales?buscar=` | `paleController.js`, `paleRoutes.js` |
| `ControladorHistorial` | Controller | `detallePale()` con historial + `GET /api/pales/:id` | `paleController.js`, `paleRoutes.js` |
| `ControladorUsuarios` | Controller | *(sprint futuro — UC-11 pendiente de implementación)* | `backend/src/controllers/userController.js` |
| `ControladorIncidencia` | Controller | *(sprint futuro — UC-08 pendiente de implementación)* | `backend/src/controllers/incidenciaController.js` |
| `ControladorMigracion` | Controller | *(sprint futuro — UC-06 pendiente de implementación)* | `backend/src/controllers/migracionController.js` |

#### 3.3.2.2. Principios de Diseño Aplicados: Cohesión y Acoplamiento

El diseño del sistema aplica los principios de **alta cohesión funcional** y **bajo acoplamiento** que constituyen, junto con el tamaño adecuado, los tres pilares del diseño modular (Larman, 2004; Martin, 2003).

**Cohesión funcional:** cada controlador del backend gestiona una responsabilidad única y bien delimitada. `paleController` encapsula exclusivamente las operaciones sobre palés (entrada, salida, reubicación, búsqueda e historial); `sectorController` encapsula únicamente la lectura y actualización de sectores; `authController` gestiona únicamente la autenticación. Ningún controlador mezcla responsabilidades de niveles distintos. Este diseño corresponde al nivel más alto de cohesión (cohesión funcional) según la taxonomía de Constantine, tal como describe el material de la asignatura de Ingeniería del Software II.

**Bajo acoplamiento:** la comunicación entre la capa de presentación y la capa de aplicación se realiza exclusivamente a través de la interfaz REST (JSON sobre HTTP). El frontend no conoce el esquema de base de datos; el backend no conoce el framework de UI. El único punto de contacto explícito entre subsistemas es la API REST, que actúa como interfaz contractual estable. Esto permite modificar la implementación interna de cualquier capa sin alterar el contrato externo.

**Principio de Responsabilidad Única (SRP — SOLID):** cada función de controlador realiza una única operación transaccional. La función `entradaPale()` registra exclusivamente la entrada de un palé; cualquier lógica adicional (cálculo de saturación, notificación de alertas) se delega en funciones auxiliares o en la propia capa de datos mediante SQL.

**Principio de Inversión de Dependencias (DIP — SOLID):** los controladores dependen del pool de conexiones MySQL2 a través de una interfaz de abstracción (`pool.query`, `pool.getConnection`), sin acoplar el código de negocio al driver específico. Si se cambia el motor de base de datos, solo se modifica `config/database.js`.

#### 3.3.2.3. Diagrama de Clases de Diseño — Capa Backend

El siguiente diagrama refleja las clases de diseño concretas de la capa de aplicación (Node.js/Express), sus métodos públicos y sus dependencias hacia la capa de datos:

```mermaid
classDiagram
    class PaleController {
        +entradaPale(req, res) Promise
        +salidaPale(req, res) Promise
        +reubicarPale(req, res) Promise
        +listarPales(req, res) Promise
        +detallePale(req, res) Promise
    }
    class SectorController {
        +getLayout(req, res) Promise
        +getSectorDetalle(req, res) Promise
        +actualizarSector(req, res) Promise
    }
    class StatsController {
        +getDashboard(req, res) Promise
    }
    class AuthController {
        +login(req, res) Promise
        +perfil(req, res) Promise
    }
    class AuthMiddleware {
        <<middleware>>
        +verificarToken(req, res, next) void
        +soloAdmin(req, res, next) void
    }
    class DatabasePool {
        <<config>>
        +getConnection() Connection
        +query(sql, params) Promise
        +testConnection() Promise
    }
    class PaleRoutes {
        <<routes>>
        GET /
        GET /:id
        POST /entrada
        POST /:id/salida
        PUT /:id/reubicar
    }
    class SectorRoutes {
        <<routes>>
        GET /
        GET /:id
        PUT /:id
    }
    class StatsRoutes {
        <<routes>>
        GET /
    }
    class AuthRoutes {
        <<routes>>
        POST /login
        GET /perfil
    }

    PaleRoutes --> AuthMiddleware : aplica verificarToken
    PaleRoutes --> PaleController : delega en
    SectorRoutes --> AuthMiddleware : aplica verificarToken
    SectorRoutes --> SectorController : delega en
    StatsRoutes --> AuthMiddleware : verificarToken + soloAdmin
    StatsRoutes --> StatsController : delega en
    AuthRoutes --> AuthController : delega en

    PaleController --> DatabasePool : usa pool
    SectorController --> DatabasePool : usa pool
    StatsController --> DatabasePool : usa pool
    AuthController --> DatabasePool : usa pool
```

#### 3.3.2.4. Diagrama de Clases de Diseño — Capa Frontend

```mermaid
classDiagram
    class ApiService {
        <<service>>
        +login(email, pwd) Promise
        +getLayout() Promise
        +entradaPale(datos) Promise
        +salidaPale(id) Promise
        +reubicarPale(id, sectorId) Promise
        +listarPales(filtros) Promise
        +detallePale(id) Promise
        +getDashboard() Promise
    }
    class LoginPage {
        -email String
        -password String
        +handleSubmit() void
        +render() JSX
    }
    class LayoutPage {
        -data Object
        -cargando Boolean
        +cargarLayout() Promise
        +render() JSX
    }
    class OperacionesPage {
        -sectores Array
        -formData Object
        +handleEntrada() Promise
        +handleSalida() Promise
        +render() JSX
    }
    class PalesPage {
        -pales Array
        -pale Object
        -historial Array
        +buscarPale(buscar) Promise
        +cargarDetalle(id) Promise
        +reubicar(paleId, sectorId) Promise
        +render() JSX
    }
    class DashboardPage {
        -kpis Object
        -movimientos Array
        +cargarDatos() Promise
        +render() JSX
    }
    class AlmacenMap {
        <<component>>
        -sectores Array
        +calcularColor(pct, estado) String
        +onSectorClick(sector) void
        +render() JSX
    }

    LoginPage --> ApiService : login()
    LayoutPage --> ApiService : getLayout()
    LayoutPage --> AlmacenMap : renderiza
    OperacionesPage --> ApiService : entradaPale() / salidaPale()
    PalesPage --> ApiService : listarPales() / detallePale() / reubicarPale()
    DashboardPage --> ApiService : getDashboard()
```

---

### 3.3.3. Diseño de los Casos de Uso — Diagramas de Secuencia de Diseño

Los diagramas de secuencia de diseño muestran la interacción entre los componentes reales de implementación, con los nombres de métodos y rutas exactas del código desarrollado. Permiten verificar la coherencia entre el diseño y la implementación descrita en el Capítulo 4.

#### 3.3.3.1. UC-01: Registrar Entrada de Palé (Diseño)

```mermaid
sequenceDiagram
    actor Operario as Operario (Tablet)
    participant React as OperacionesPage.jsx
    participant API as api.js (Axios)
    participant Express as POST /api/pales/entrada
    participant JWT as authMiddleware.verificarToken
    participant Ctrl as paleController.entradaPale()
    participant MySQL as MySQL 8.0 InnoDB

    Operario->>React: rellena formulario y pulsa "Registrar entrada"
    React->>API: entradaPale({codigo_ref, sector_id, mercancia_id, notas})
    API->>Express: POST /api/pales/entrada — Authorization: Bearer JWT
    Express->>JWT: verificarToken(req)
    JWT-->>Express: req.usuario = {id, nombre, rol}
    Express->>Ctrl: entradaPale(req, res)

    Ctrl->>MySQL: pool.getConnection()
    MySQL-->>Ctrl: conn
    Ctrl->>MySQL: conn.beginTransaction()
    Ctrl->>MySQL: SELECT id FROM pales WHERE codigo_ref=? AND estado!='expedido'
    MySQL-->>Ctrl: [] (código no duplicado)
    Ctrl->>MySQL: SELECT * FROM sectores WHERE id=? FOR UPDATE
    Note over MySQL: Row-Level Lock sobre la fila del sector.<br/>Transacciones concurrentes sobre el mismo sector<br/>quedan en espera hasta el COMMIT de esta.
    MySQL-->>Ctrl: {ocupacion_actual, capacidad_max, activo}

    alt ocupacion_actual < capacidad_max
        Ctrl->>MySQL: INSERT INTO pales (codigo_ref, mercancia_id, sector_id, estado='emplazado')
        MySQL-->>Ctrl: insertId = paleId
        Ctrl->>MySQL: UPDATE sectores SET ocupacion_actual=ocupacion_actual+1 WHERE id=?
        Ctrl->>MySQL: INSERT INTO movimientos (pale_id, usuario_id, tipo='entrada', sector_destino, notas)
        Ctrl->>MySQL: conn.commit()
        MySQL-->>Ctrl: OK — lock liberado
        Ctrl->>MySQL: conn.release()
        Ctrl-->>Express: res.status(201).json({mensaje, pale_id, codigo_ref, sector_id})
        Express-->>API: HTTP 201 JSON
        API-->>React: {mensaje: "Palé registrado correctamente"}
        React-->>Operario: SnackBar verde + refresco del layout
    else ocupacion_actual >= capacidad_max
        Ctrl->>MySQL: conn.rollback()
        Ctrl->>MySQL: conn.release()
        Ctrl-->>Express: res.status(409).json({error: "Capacidad máxima superada"})
        Express-->>API: HTTP 409
        API-->>React: error
        React-->>Operario: alerta roja "Selecciona otro sector"
    end
```

#### 3.3.3.2. UC-03: Consultar Layout — Renderizar Mapa (Diseño)

```mermaid
sequenceDiagram
    actor Usuario as Usuario (Tablet/PC)
    participant React as LayoutPage.jsx
    participant Interval as setInterval(30 000 ms)
    participant API as api.js (Axios)
    participant Express as GET /api/sectores
    participant Ctrl as sectorController.getLayout()
    participant MySQL as MySQL 8.0 InnoDB

    Note over React,Interval: Carga inicial al montar el componente
    React->>API: getLayout()
    API->>Express: GET /api/sectores — Authorization: Bearer JWT
    Express->>Ctrl: getLayout(req, res)
    Ctrl->>MySQL: SELECT id, codigo, nombre, capacidad_max, ocupacion_actual,\nROUND(ocupacion_actual/capacidad_max*100,1) AS pct,\nCASE WHEN ocupacion=0 THEN 'libre'\n     WHEN pct<50 THEN 'bajo'\n     WHEN pct<75 THEN 'medio'\n     WHEN pct<95 THEN 'alto'\n     ELSE 'critico' END AS estado_saturacion\nFROM sectores ORDER BY codigo
    MySQL-->>Ctrl: [38 filas con pct y estado]
    Ctrl->>Ctrl: reduce() → totalPales, totalCapacidad, pctGlobal
    Ctrl-->>Express: res.json({sectores:[...], resumen:{...}})
    Express-->>API: HTTP 200 JSON
    API-->>React: {sectores, resumen}
    React->>React: setData(), setUltimaAct(now)
    loop Para cada uno de los 38 sectores
        React->>AlmacenMap: render(sector.pct, sector.estado_saturacion)
        Note over AlmacenMap: verde(libre) / azul(bajo) / amarillo(medio)\nnaranja(alto) / rojo(crítico)
    end
    React-->>Usuario: mapa interactivo + KPIs globales

    Note over React,Interval: Refresco automático cada 30 segundos
    Interval-->>React: trigger cargarLayout()
    React->>API: getLayout()
    Note over API,MySQL: Misma secuencia — actualiza sin recargar la página
```

#### 3.3.3.3. UC-04: Reubicar Palé entre Sectores (Diseño)

```mermaid
sequenceDiagram
    actor Operario
    participant React as PalesPage.jsx
    participant API as api.js
    participant Express as PUT /api/pales/:id/reubicar
    participant Ctrl as paleController.reubicarPale()
    participant MySQL as MySQL 8.0 InnoDB

    Operario->>React: selecciona palé + sector destino → "Reubicar"
    React->>API: reubicarPale(paleId, {sector_destino_id, notas})
    API->>Express: PUT /api/pales/247/reubicar — Bearer JWT
    Express->>Ctrl: reubicarPale(req, res)

    Ctrl->>MySQL: getConnection() → beginTransaction()
    Ctrl->>MySQL: SELECT * FROM pales WHERE id=247 AND estado NOT IN ('expedido') FOR UPDATE
    MySQL-->>Ctrl: {sector_id: sectorOrigen, estado: 'emplazado'}
    Ctrl->>MySQL: SELECT * FROM sectores WHERE id=sectorDestinoId FOR UPDATE
    Note over MySQL: Bloqueo de ambas filas en orden determinístico\n(min(id) primero) para evitar deadlock entre<br/>dos transacciones concurrentes que invierten el orden.
    MySQL-->>Ctrl: {ocupacion_actual, capacidad_max}

    alt Sector destino disponible y distinto del actual
        Ctrl->>MySQL: UPDATE pales SET sector_id=sectorDestino, estado='emplazado' WHERE id=247
        Ctrl->>MySQL: UPDATE sectores SET ocupacion_actual=GREATEST(0, ocupacion-1) WHERE id=sectorOrigen
        Ctrl->>MySQL: UPDATE sectores SET ocupacion_actual=ocupacion+1 WHERE id=sectorDestino
        Ctrl->>MySQL: INSERT INTO movimientos (pale_id=247, tipo='reubicacion', sector_origen, sector_destino, usuario_id)
        Ctrl->>MySQL: commit() → release()
        Ctrl-->>Express: res.json({mensaje: "Palé reubicado correctamente"})
        Express-->>API: HTTP 200
        API-->>React: éxito
        React-->>Operario: confirmación + actualización de vista
    else Error de capacidad o palé ya en destino
        Ctrl->>MySQL: rollback() → release()
        Ctrl-->>Express: res.status(409).json({error})
        Express-->>API: HTTP 409
        React-->>Operario: alerta descriptiva
    end
```

#### 3.3.3.4. UC-09: Autenticar Usuario (Diseño)

```mermaid
sequenceDiagram
    actor Usuario
    participant React as LoginPage.jsx
    participant API as api.js (Axios)
    participant Express as POST /api/auth/login
    participant Ctrl as authController.login()
    participant MySQL as MySQL 8.0 InnoDB
    participant BCrypt as bcryptjs.compare()
    participant JWT as jsonwebtoken.sign()

    Usuario->>React: introduce email + contraseña
    React->>API: login({email, password})
    API->>Express: POST /api/auth/login (sin token — ruta pública)
    Express->>Ctrl: login(req, res)

    Ctrl->>MySQL: SELECT * FROM usuarios WHERE email=? AND activo=1
    MySQL-->>Ctrl: usuario{id, nombre, passwordHash, rol} o []

    alt Usuario encontrado y activo
        Ctrl->>BCrypt: compare(password, passwordHash)
        BCrypt-->>Ctrl: true (contraseña válida)
        Ctrl->>JWT: sign({id, nombre, rol}, JWT_SECRET, {expiresIn: '8h'})
        JWT-->>Ctrl: token firmado
        Ctrl-->>Express: res.json({token, usuario:{id, nombre, email, rol}})
        Express-->>API: HTTP 200 JSON
        API-->>React: {token, usuario}
        React->>React: localStorage.setItem('token', token)
        React-->>Usuario: redirigir a LayoutPage (operario) o DashboardPage (admin)
    else Credenciales incorrectas o cuenta inactiva
        Ctrl-->>Express: res.status(401).json({error: "Credenciales incorrectas"})
        Note over Ctrl: Mismo mensaje para email incorrecto y password incorrecta<br/>(no se revela qué campo falló — RS-03 seguridad)
        Express-->>API: HTTP 401
        API-->>React: error
        React-->>Usuario: mensaje de error genérico
    end
```

#### 3.3.3.5. UC-10: Buscar Palé por Referencia (Diseño)

```mermaid
sequenceDiagram
    actor Usuario
    participant React as PalesPage.jsx
    participant API as api.js
    participant Express as GET /api/pales?buscar=
    participant Ctrl as paleController.listarPales()
    participant MySQL as MySQL 8.0 InnoDB

    Usuario->>React: introduce código de referencia en el buscador
    React->>API: listarPales({buscar: "JH-88", pagina: 1, limite: 20})
    API->>Express: GET /api/pales?buscar=JH-88 — Bearer JWT
    Express->>Ctrl: listarPales(req, res)

    Ctrl->>MySQL: SELECT COUNT(*) FROM pales p WHERE p.codigo_ref LIKE '%JH-88%'
    MySQL-->>Ctrl: {total: N}
    Ctrl->>MySQL: SELECT p.id, p.codigo_ref, p.estado, p.fecha_entrada,\ns.codigo AS sector_codigo, m.descripcion AS mercancia\nFROM pales p\nLEFT JOIN sectores s ON p.sector_id=s.id\nLEFT JOIN mercancia m ON p.mercancia_id=m.id\nWHERE p.codigo_ref LIKE '%JH-88%'\nORDER BY p.fecha_entrada DESC\nLIMIT 20 OFFSET 0
    MySQL-->>Ctrl: [lista de palés coincidentes con sector y mercancía]
    Ctrl-->>Express: res.json({pales, total, pagina, limite})
    Express-->>API: HTTP 200 JSON
    API-->>React: {pales, total}

    alt Resultados encontrados
        React->>React: renderizar lista de resultados
        React-->>Usuario: lista de palés + botón "Ver detalle" por cada uno
    else Sin resultados
        React-->>Usuario: "No se encontraron palés con esa referencia."
    end
```

#### 3.3.3.6. UC-12: Consultar Historial de Palé (Diseño)

```mermaid
sequenceDiagram
    actor Usuario
    participant React as PalesPage.jsx
    participant API as api.js
    participant Express as GET /api/pales/:id
    participant Ctrl as paleController.detallePale()
    participant MySQL as MySQL 8.0 InnoDB

    Usuario->>React: selecciona un palé de la lista (vía UC-10 o directo)
    React->>API: detallePale(paleId)
    API->>Express: GET /api/pales/247 — Bearer JWT
    Express->>Ctrl: detallePale(req, res)

    Ctrl->>MySQL: SELECT p.*, s.codigo AS sector_codigo,\nm.descripcion AS mercancia\nFROM pales p\nLEFT JOIN sectores s ON p.sector_id=s.id\nLEFT JOIN mercancia m ON p.mercancia_id=m.id\nWHERE p.id=247
    MySQL-->>Ctrl: pale{codigoRef, estado, sectorCodigo, mercancia}

    Ctrl->>MySQL: SELECT mv.tipo, mv.fecha_hora, mv.notas,\nu.nombre AS usuario,\nso.codigo AS sector_origen,\nsd.codigo AS sector_destino\nFROM movimientos mv\nLEFT JOIN usuarios u ON mv.usuario_id=u.id\nLEFT JOIN sectores so ON mv.sector_origen=so.id\nLEFT JOIN sectores sd ON mv.sector_destino=sd.id\nWHERE mv.pale_id=247\nORDER BY mv.fecha_hora ASC
    Note over MySQL: JOIN con tres tablas en una sola consulta.<br/>El índice idx_movimientos_pale garantiza<br/>rendimiento sub-segundo (RS-01).
    MySQL-->>Ctrl: [{tipo, fecha_hora, sector_origen, sector_destino, usuario}...]
    Ctrl-->>Express: res.json({pale, historial:[...]})
    Express-->>API: HTTP 200 JSON
    API-->>React: {pale, historial}
    React-->>Usuario: línea de tiempo cronológica de movimientos
```

---

### 3.3.4. Diagrama de Despliegue

El diagrama de despliegue muestra la distribución física de los componentes de software sobre los nodos de hardware del entorno de ejecución (Larman, 2004):

```mermaid
graph TD
    subgraph CLIENTE["Nodo: Dispositivo Cliente (Tablet / PC Oficina)"]
        BR["Navegador Web — Chrome 110+"]
        SPA["React SPA (bundle Vite — HTML + CSS + JS)"]
        BR --> SPA
    end

    subgraph SERVIDOR["Nodo: Servidor de Aplicación (Windows Server / Linux)"]
        NODE["Runtime: Node.js 18 LTS"]
        EXPRESS["Framework: Express 4 (puerto 3001)"]
        CORS["CORS Middleware"]
        JWTMW["JWT Middleware (verificarToken · soloAdmin)"]
        CTRL["Controladores: authCtrl · paleCtrl · sectorCtrl · statsCtrl"]
        ROUTES["Rutas: /api/auth · /api/pales · /api/sectores · /api/stats"]
        NODE --> EXPRESS
        EXPRESS --> CORS
        EXPRESS --> JWTMW
        EXPRESS --> ROUTES
        ROUTES --> CTRL
    end

    subgraph BBDD["Nodo: Servidor de Base de Datos (MySQL 8.0)"]
        INNODB["Motor InnoDB (ACID · Row-Level Locking)"]
        DB["Base de Datos: wms_almacen — utf8mb4_unicode_ci"]
        TABLAS["Tablas: usuarios · sectores · mercancia\npales · movimientos · migracion_access"]
        IDX["Índices: idx_movimientos_fecha · idx_movimientos_tipo · idx_movimientos_pale"]
        INNODB --> DB --> TABLAS
        DB --> IDX
    end

    subgraph ROLLSHIP["Sistema Externo: Motor Rollship (ERP James Hardie)"]
        ROLL["Servidor Laravel/PHP"]
    end

    SPA -->|"HTTP REST / JSON\nAuthorization: Bearer JWT"| EXPRESS
    CTRL -->|"MySQL2 Pool (connectionLimit=10)\nTransacciones ACID"| INNODB
    ROLL -->|"GET /api/sectores\nGET /api/pales"| EXPRESS
```

**Notas de despliegue:**

- El servidor de aplicación y el de base de datos pueden cohabitar en el mismo equipo físico en la fase inicial, separándose cuando el volumen de operaciones lo justifique.
- La comunicación entre la SPA y la API se realiza sobre HTTP (HTTPS en producción). El token JWT firmado con `JWT_SECRET` caduca cada 8 horas por defecto, forzando reautenticación al inicio de cada turno.
- El Motor Rollship consume la API REST del módulo logístico mediante peticiones GET autenticadas con su propio token, sin acceder directamente a la base de datos. Esto preserva el desacoplamiento y facilita la integración futura de nuevos almacenes.

---

### 3.3.5. Diagrama de Paquetes

El diagrama de paquetes muestra la organización modular del código fuente y las dependencias entre subsistemas (Larman, 2004):

```mermaid
graph TD
    subgraph FRONT["Subsistema Frontend (React + Vite)"]
        direction TB
        F1["📦 pages/\n LoginPage · LayoutPage\n OperacionesPage · PalesPage\n DashboardPage"]
        F2["📦 components/\n Layout/AlmacenMap\n Auth/ · Dashboard/\n Operaciones/"]
        F3["📦 services/\n api.js (Axios + JWT header automático)"]
        F4["📦 styles/\n CSS global · variables"]
        F1 --> F2
        F1 --> F3
        F2 --> F3
        F1 --> F4
    end

    subgraph BACK["Subsistema Backend (Node.js + Express)"]
        direction TB
        B1["📦 routes/\n authRoutes · paleRoutes\n sectorRoutes · statsRoutes"]
        B2["📦 controllers/\n authController · paleController\n sectorController · statsController"]
        B3["📦 middleware/\n auth.js (verificarToken · soloAdmin)"]
        B4["📦 config/\n database.js (MySQL2 pool — connectionLimit:10)"]
        B5["📦 sql/\n schema.sql · seed.sql"]
        B1 --> B3
        B1 --> B2
        B2 --> B4
        B4 --> B5
    end

    subgraph EXT["Dependencias Externas (npm)"]
        E1["mysql2"]
        E2["jsonwebtoken"]
        E3["bcryptjs"]
        E4["express"]
        E5["react + vite"]
        E6["axios"]
    end

    BACK --> E1
    BACK --> E2
    BACK --> E3
    BACK --> E4
    FRONT --> E5
    FRONT --> E6

    FRONT -->|"HTTP REST (JSON)"| BACK
```

La arquitectura de paquetes garantiza una **alta cohesión interna** (cada paquete agrupa clases del mismo nivel de abstracción) y un **bajo acoplamiento externo** (los paquetes se comunican únicamente a través de interfaces bien definidas: la API REST entre frontend y backend, y el pool MySQL2 entre controladores y base de datos). Este diseño facilita tanto el mantenimiento correctivo como la incorporación futura de nuevos módulos, conforme al principio abierto/cerrado de SOLID (Martin, 2003).

---

### 3.3.6. Modelo de Datos

#### 3.3.6.1. Modelo Lógico — Diagrama Entidad-Relación

El Diagrama Entidad-Relación (DER) representa la estructura conceptual de los datos persistidos, derivada directamente del Modelo del Dominio del Capítulo 2 (Date, 2004):

```mermaid
erDiagram
    USUARIOS {
        int id PK
        varchar nombre
        varchar email UK
        varchar password
        enum rol "operario | administrador"
        tinyint activo
        timestamp created_at
        timestamp updated_at
    }
    SECTORES {
        int id PK
        varchar codigo UK
        varchar nombre
        int capacidad_max
        int ocupacion_actual
        tinyint activo
        text notas
        timestamp created_at
        timestamp updated_at
    }
    MERCANCIA {
        int id PK
        varchar codigo UK
        varchar descripcion
        enum tipo "bolsas | fardos | ladrillos | pizarras | otros"
        decimal peso_kg
        timestamp created_at
    }
    PALES {
        int id PK
        varchar codigo_ref UK
        int mercancia_id FK
        int sector_id FK
        enum estado "recepcionado | emplazado | en_reubicacion | en_preparacion | expedido"
        timestamp fecha_entrada
        timestamp fecha_salida
        text notas
        timestamp created_at
        timestamp updated_at
    }
    MOVIMIENTOS {
        int id PK
        int pale_id FK
        int usuario_id FK
        enum tipo "entrada | salida | reubicacion | ajuste"
        int sector_origen FK
        int sector_destino FK
        timestamp fecha_hora
        text notas
    }
    MIGRACION_ACCESS {
        int id PK
        json datos_raw
        tinyint procesado
        text error
        timestamp created_at
    }

    SECTORES ||--o{ PALES : "contiene (0..*)"
    MERCANCIA ||--o{ PALES : "categoriza (0..*)"
    PALES ||--|{ MOVIMIENTOS : "genera (1..*)"
    USUARIOS ||--o{ MOVIMIENTOS : "registra (0..*)"
    SECTORES ||--o{ MOVIMIENTOS : "sector_origen (0..*)"
    SECTORES ||--o{ MOVIMIENTOS : "sector_destino (0..*)"
```

#### 3.3.6.2. Modelo Físico — Decisiones de Implementación MySQL

El modelo físico concreta el modelo lógico en MySQL 8.0 con motor InnoDB. Las decisiones físicas más relevantes, cada una justificada en los requisitos suplementarios:

**Motor InnoDB (RS-07 Integridad):** Es el único motor MySQL que implementa bloqueo a nivel de fila (*row-level locking*) y soporte completo para transacciones ACID (Oracle Corporation, 2023). La sentencia `SELECT ... FOR UPDATE` dentro de `beginTransaction()` adquiere un bloqueo de escritura exclusivo sobre la fila del sector antes de comprobar la capacidad disponible, garantizando que dos transacciones concurrentes no puedan ubicar simultáneamente palés en un sector ya lleno. Este comportamiento sustituye el bloqueo de fichero completo de MS Access, que impedía el acceso concurrente de múltiples operarios.

**Juego de caracteres `utf8mb4` (RS-04 Usabilidad):** Soporta el rango completo Unicode, incluyendo caracteres especiales en nombres de mercancía y notas de operarios, evitando truncaciones o errores de codificación.

**Índices estratégicos en `movimientos` (RS-01 Rendimiento):** La tabla de movimientos crece aproximadamente 68.000 registros por año. Se definen tres índices explícitos:
- `idx_movimientos_fecha` sobre `fecha_hora` — para filtros de estadísticas por período (UC-05)
- `idx_movimientos_tipo` sobre `tipo` — para conteos por tipo de operación (UC-05)
- `idx_movimientos_pale` sobre `pale_id` — para la recuperación del historial de un palé concreto (UC-12)

**Constraint CHECK en `sectores` (RS-07 Integridad):** `CHECK (ocupacion_actual >= 0)` actúa como salvaguarda de integridad a nivel de base de datos. Junto con `GREATEST(0, ocupacion - 1)` en las consultas de decremento, garantiza que ningún error de aplicación pueda dejar la ocupación en un valor negativo.

**`sector_id NULL` en `pales` (coherencia con el Modelo del Dominio):** Un palé expedido no tiene sector asignado. Permitir `NULL` en `sector_id` mantiene la semántica correcta del Diagrama de Estados del Capítulo 2 (Figura 3): la ausencia de sector expresa el estado de expedición sin requerir un sector ficticio.

---

## 3.4. Trazabilidad y Coherencia del Capítulo

La siguiente tabla verifica que cada elemento de diseño tiene su origen documentado en los capítulos precedentes y su correspondencia prevista en la implementación del Capítulo 4:

| Requisito / CdU (Cap. 2) | Clase de Análisis (§3.2) | Decisión de Diseño (§3.3.1) | Componente de Implementación (Cap. 4) |
|---|---|---|---|
| UC-01 Entrada palé | `ControladorEntradaPale`, `Pale`, `Sector`, `Movimiento` | ACID InnoDB, `FOR UPDATE`, `beginTransaction()` | `paleController.entradaPale()` · `POST /api/pales/entrada` |
| UC-02 Salida palé | `ControladorSalidaPale`, `Pale`, `Sector` | Transacción ACID, `GREATEST(0, ocupacion-1)` | `paleController.salidaPale()` · `POST /api/pales/:id/salida` |
| UC-03 Layout | `ControladorLayout`, `Sector`, `IUCardSector` | REST GET, refresco 30 s, CASE SQL semáforo | `sectorController.getLayout()` · `AlmacenMap` |
| UC-04 Reubicación | `ControladorReubicacion`, `Pale`, `Sector` (×2) | Bloqueo doble determinístico para evitar deadlock | `paleController.reubicarPale()` · `PUT /api/pales/:id/reubicar` |
| UC-05 Estadísticas | `ControladorEstadisticas`, `Movimiento`, `Sector` | Agregación SQL, índice `idx_movimientos_fecha` | `statsController.getDashboard()` · `GET /api/stats` |
| UC-06 Migración ETL | `ControladorMigracion`, `IUVolcadoAccess` | Tabla `migracion_access` (JSON bruto + flag `procesado`) | Sprint futuro |
| UC-07 Saturación (subflujo) | `ControladorSaturacion` (interno) | CASE SQL incrustado en `getLayout()` | `sectorController.js` líneas 15-22 |
| UC-08 Incidencia | `ControladorIncidencia`, `Incidencia`, `Pale` | Estado `incidencia` en ENUM `pales.estado`, bloqueo de operaciones | Sprint futuro · `incidenciaController.js` |
| UC-09 Autenticación (subflujo) | `ControladorAutenticacion`, `Usuario` | JWT stateless, bcryptjs, expiración 8h | `authController.login()` · `POST /api/auth/login` |
| UC-10 Búsqueda | `ControladorBusqueda`, `Pale` | Query LIKE con paginación, JOIN sectores y mercancía | `paleController.listarPales()` · `GET /api/pales?buscar=` |
| UC-11 Usuarios | `ControladorUsuarios`, `Usuario` | CRUD usuarios, constraint `email UNIQUE`, hash bcrypt | Sprint futuro · `userController.js` |
| UC-12 Historial | `ControladorHistorial`, `Movimiento`, `Pale` | JOIN de cuatro tablas, índice `idx_movimientos_pale` | `paleController.detallePale()` · `GET /api/pales/:id` |
| RS-01 Rendimiento (<1,5 s) | `ControladorLayout` | Índices en `sectores`, consulta única con CASE | `getLayout()` — única consulta SELECT |
| RS-02 Disponibilidad (99,5 %) | — | Pool de conexiones `connectionLimit:10` | `config/database.js` |
| RS-03 Seguridad / Roles | `ControladorAutenticacion`, `AuthMiddleware` | JWT, `soloAdmin()` middleware, sesión expira en 8h | `middleware/auth.js` · `verificarToken` · `soloAdmin` |
| RS-04 Usabilidad / mobile-first | `IUCardSector`, `IUPrincipalOperario` | SPA React, componentes táctiles ≥60 px, sin recargas | `AlmacenMap`, `OperacionesPage` |
| RS-05 Portabilidad | `IUConectorRollship` | API REST JSON sin estado (Fielding, 2000) | Endpoints `GET /api/sectores`, `GET /api/pales` |
| RS-06 Mantenibilidad (MVC) | Separación Controller / Model / View | Patrón MVC explícito, cohesión funcional por módulo | Estructura `routes/` · `controllers/` · `config/` |
| RS-07 Integridad (ACID) | `Sector.bloquearYLeer()` | `FOR UPDATE` + `beginTransaction()` / `commit()` / `rollback()` | Pool InnoDB MySQL2 en todos los controladores de escritura |

---

## 3.5. Referencias Bibliográficas del Capítulo

*(Se incorporan a la bibliografía global del TFG, complementando las citadas en los capítulos anteriores.)*

Date, C. J. (2004). *Introducción a los sistemas de bases de datos* (7.ª ed.). Pearson Educación.

Fielding, R. T. (2000). *Architectural styles and the design of network-based software architectures* [Tesis doctoral, University of California, Irvine]. https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm

Fowler, M. (2002). *Patterns of enterprise application architecture*. Addison-Wesley.

Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design patterns: Elements of reusable object-oriented software*. Addison-Wesley.

Larman, C. (2004). *Applying UML and patterns: An introduction to object-oriented analysis and design and iterative development* (3.ª ed.). Prentice Hall.

Martin, R. C. (2003). *Agile software development: Principles, patterns, and practices*. Prentice Hall.

Oracle Corporation. (2023). *MySQL 8.0 Reference Manual: InnoDB transaction and locking information*. https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html

Pressman, R. S., & Maxim, B. R. (2020). *Software engineering: A practitioner's approach* (9.ª ed.). McGraw-Hill Education.

Sommerville, I. (2015). *Software engineering* (10.ª ed.). Pearson.
