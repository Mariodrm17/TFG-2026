## Capítulo 3 — Diseño del sistema

- [3.1 Clases de análisis (MVC)](#31-clases-de-análisis-mvc)
- [3.2 Diagramas de secuencia](#32-diagramas-de-secuencia)
- [3.3 Arquitectura del sistema](#33-arquitectura-del-sistema)
- [3.4 Modelo de datos (ER)](#34-modelo-de-datos-er)
- [3.5 Estructura de paquetes y navegación](#35-estructura-de-paquetes-y-navegación)

### 3.1 Clases de análisis (MVC)

> **Regla de derivación:** Vista = procesos de **invocar** o **presentar** algo · Controlador = el **caso de uso completo** · Modelo = derivado del **modelo del dominio** del Capítulo 2.

![Clases de Análisis MVC](docs/diseno/clases-analisis.png)

#### Clases Modelo — derivadas directamente del dominio

| Clase Modelo | Entidad del dominio de origen | CdU en que participa |
|---|---|---|
| `Pale` | `Palé` del modelo del dominio | UC-01, UC-02, UC-04, UC-07, UC-08, UC-10, UC-12 |
| `Sector` | `Sector` del modelo del dominio | UC-01, UC-02, UC-03, UC-04, UC-07 |
| `Movimiento` | `Movimiento` del modelo del dominio | UC-01, UC-02, UC-04, UC-08, UC-12 |
| `Mercancia` | Categoría de producto James Hardie | UC-01 |
| `Usuario` | `Operario` del modelo del dominio (con credenciales) | UC-09, UC-11 |
| `Incidencia` | Estado de anomalía del ciclo de vida del palé | UC-08 |

#### Clases Vista — procesos de invocar y presentar

| Clase Vista | Tipo | Función (invocar / presentar) |
|---|---|---|
| `IUPrincipalOperario` | Ventana principal | **Presenta** el layout y menú de operaciones al Operario |
| `IUPrincipalAdministrador` | Ventana principal | **Presenta** panel completo con gestión total al Admin |
| `IUFormEntradaPale` | Formulario | **Invoca** UC-01 · **Presenta** confirmación de entrada |
| `IUFormSalidaPale` | Formulario | **Invoca** UC-02 · **Presenta** confirmación de salida |
| `IUCardSector` | Tarjeta visual | **Presenta** semáforo de saturación (verde/ámbar/rojo) del sector |
| `IUFormReubicacion` | Formulario | **Invoca** UC-04 · **Presenta** selector de sector destino |
| `IUPanelEstadisticas` | Panel | **Invoca** UC-05 · **Presenta** KPIs y gráficas de flujo |
| `IUVolcadoAccess` | Interfaz ETL | **Invoca** UC-06 · **Presenta** progreso de migración |
| `IUBuscador` | Campo de búsqueda | **Invoca** UC-10 · **Presenta** palé localizado con su sector |
| `IUPanelUsuarios` | Panel CRUD | **Invoca** UC-11 · **Presenta** listado y formularios de cuentas |
| `IUHistorialPale` | Línea de tiempo | **Invoca** UC-12 · **Presenta** cronología de movimientos |
| `IUFormIncidencia` | Formulario | **Invoca** UC-08 · **Presenta** registro de anomalía |
| `IUFormLogin` | Pantalla auth | **Invoca** UC-09 · **Presenta** formulario de credenciales |
| `IUConectorRollship` | Interfaz central | **Presenta** datos al ERP Rollship vía API REST (actor sistema) |

#### Clases Controlador — una por caso de uso

| Clase Controlador | CdU que gestiona | Responsabilidad principal |
|---|---|---|
| `ControladorEntradaPale` | UC-01 | Validar datos · `FOR UPDATE` de sector · persistir palé + movimiento ENTRADA en transacción ACID |
| `ControladorSalidaPale` | UC-02 | Verificar estado · actualizar a Expedido · decrementar ocupación · registrar SALIDA |
| `ControladorLayout` | UC-03 | Recuperar 118 sectores con saturación y código cromático del semáforo |
| `ControladorReubicacion` | UC-04 | Doble `FOR UPDATE` (palé + sector destino) · mover palé · actualizar contadores · registrar REUBICACION |
| `ControladorEstadisticas` | UC-05 | Agregar KPIs, movimientos por tipo/período, sectores más ocupados |
| `ControladorMigracion` | UC-06 | Orquestar ETL: leer volcado Access · transformar · validar · cargar en MySQL |
| `ControladorSaturacion` | UC-07 *(subflujo)* | Calcular `(ocupacion / capacidad) × 100` · determinar código cromático |
| `ControladorIncidencia` | UC-08 | Registrar anomalía · cambiar estado palé a Incidencia · bloquear operaciones |
| `ControladorAutenticacion` | UC-09 *(subflujo)* | Verificar bcrypt · generar JWT firmado con rol · precondición de todos los CdU |
| `ControladorBusqueda` | UC-10 | Consulta LIKE por código de referencia en inventario activo |
| `ControladorUsuarios` | UC-11 | CRUD de cuentas · unicidad de credencial · log de auditoría |
| `ControladorHistorial` | UC-12 | Recuperar movimientos del palé ordenados cronológicamente |

#### Clases de diseño — Backend (implementación)

![Clases Backend](docs/diseno/clases-backend.png)

#### Clases de diseño — Frontend (implementación)

![Clases Frontend](docs/diseno/clases-frontend.png)

### 3.2 Diagramas de secuencia

> Los diagramas de secuencia muestran la interacción entre **Actor → Vista → Controlador → Modelo** para los casos de uso más representativos.

#### UC-01 — Registrar entrada de palé

![Secuencia UC-01](docs/diseno/seq-uc01.png)

#### UC-02 — Registrar salida de palé

![Secuencia UC-02](docs/diseno/seq-uc02.png)

#### UC-03 — Consultar layout interactivo

![Secuencia UC-03](docs/diseno/seq-uc03.png)

#### UC-04 — Reubicar palé entre sectores

![Secuencia UC-04](docs/diseno/seq-uc04.png)

#### UC-09 — Autenticar usuario (JWT)

![Secuencia UC-09](docs/diseno/seq-uc09.png)

#### UC-10 — Buscar palé por referencia

![Secuencia UC-10](docs/diseno/seq-uc10.png)

#### UC-12 — Consultar historial de palé

![Secuencia UC-12](docs/diseno/seq-uc12.png)

### 3.3 Arquitectura del sistema

#### Arquitectura en tres capas

![Arquitectura tres capas](docs/diseno/arquitectura.png)

| Capa | Tecnología | Justificación (RS que cubre) |
|------|-----------|------------------------------|
| **Presentación** | Vanilla JS · SPA hash routing · CSS Grid · HTML5 | Mobile-First sin build step (RS-04, RS-05) · sin instalación cliente (RS-E2) |
| **Negocio** | Node.js 20 · Express 4 · JWT 8h · bcryptjs | API REST para Rollship (RS-E1) · stateless · RBAC 4 roles (RS-03) |
| **Datos** | MySQL 8.0 · InnoDB · Row-Level Locking · Stored Procedures | ACID garantizado (RS-07) · sin deadlocks (RS-E3) · rendimiento < 1,5 s (RS-01) |

#### Diagrama de despliegue

![Diagrama de Despliegue](docs/diseno/despliegue.png)

#### Diagrama de paquetes

![Diagrama de Paquetes](docs/diseno/paquetes.png)

#### Análisis de paquetes

![Análisis de Paquetes](docs/diseno/analisis-paquetes.png)

### 3.4 Modelo de datos (ER)

![Modelo Entidad-Relación](docs/diseno/er-modelo.png)

| Tabla | Derivación del dominio | Filas reales |
|-------|------------------------|-------------|
| `sectores` | ← `Sector` del dominio · 118 filas con capacidades reales | **118** |
| `pales` | ← `Palé` del dominio · estado, sector, mercancía | **2.444** |
| `movimientos` | ← `Movimiento` del dominio · historial ACID completo | **2.444+** |
| `mercancia` | Catálogo productos James Hardie | **9** |
| `usuarios` | ← `Operario` del dominio · bcrypt + JWT + rol | **4** |
| `incidencias` | ← estado Incidencia del ciclo de vida del palé | — |
| `migracion_access` | Staging ETL para datos del MS Access | — |

**Stored procedures MySQL:** `sp_entrada_pale` · `sp_salida_pale` (garantía ACID transaccional)

**Índices de rendimiento:** `idx_movimientos_fecha` · `idx_movimientos_tipo` · `idx_movimientos_pale`

### 3.5 Estructura de paquetes y navegación

#### Diagrama de navegación (frontend SPA)

![Diagrama de Navegación](docs/diseno/navegacion.png)

---
