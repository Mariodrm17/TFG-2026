# Sistema WMS — Almacén Santander (James Hardie)

**Trabajo de Fin de Grado · Ingeniería Informática · UNEATLANTICO 2026**  
**Mario Del Río Merino · INTERMODAL SEA SOLUTIONS**

> Sistema web de gestión de almacén (WMS) que digitaliza el layout físico de la nave, elimina los deadlocks del MS Access heredado y proporciona control de inventario en tiempo real con 4 niveles de acceso.

---

## Índice

| # | Sección |
|---|---------|
| 1 | [Contexto y problema](#1-contexto-y-problema) |
| 2 | [Solución y stack](#2-solución-y-stack) |
| 3 | [Arquitectura del sistema](#3-arquitectura-del-sistema) |
| 4 | [Modelo de dominio](#4-modelo-de-dominio) |
| 5 | [Casos de uso](#5-casos-de-uso) |
| 6 | [Diagramas de actividad](#6-diagramas-de-actividad) |
| 7 | [Diseño — secuencias y clases](#7-diseño--secuencias-y-clases) |
| 8 | [Modelo de datos (ER)](#8-modelo-de-datos-er) |
| 9 | [Capturas del sistema](#9-capturas-del-sistema) |
| 10 | [Datos reales importados](#10-datos-reales-importados) |
| 11 | [Instalación y arranque](#11-instalación-y-arranque) |
| 12 | [Credenciales de demo](#12-credenciales-de-demo) |

---

## 1. Contexto y problema

El almacén de **INTERMODAL SEA SOLUTIONS** en el puerto de Santander gestiona la mercancía de **James Hardie** (planchas de fibrocemento) con destino a UK, Dinamarca y España.

| Problema | Impacto |
|----------|---------|
| MS Access monolítico en un único PC | Sin acceso móvil, un operario a la vez |
| Deadlocks en operaciones concurrentes | Pérdida de datos y bloqueos de jornada |
| Sin mapa visual de ocupación | Gestión por hojas Excel desactualizadas |
| Sin trazabilidad de movimientos | Imposible auditar entradas/salidas |
| Sin control de roles | Cualquier usuario modifica cualquier registro |

**Volumen real del almacén:** ~73.064 palés entrados / ~68.248 salidos en histórico.

### Flujo de información actual vs. propuesto

![Diagrama de Contexto](docs/analisis/diagrama-contexto.png)

---

## 2. Solución y stack

### Qué hace el sistema

- **Plano interactivo** del almacén real con 118 sectores y semáforo de saturación
- **Registro ACID** de entradas, salidas y reubicaciones con trazabilidad completa
- **Dashboard** con KPIs en tiempo real (palés, ocupación, flujo)
- **4 roles** de acceso: Visualizador · Operario · Gerente · Administrador
- **API REST** compatible con el ecosistema Rollship (James Hardie)

### Stack tecnológico

| Capa | Tecnología | Decisión |
|------|-----------|----------|
| **Frontend** | Vanilla JS · SPA hash routing · CSS Grid | Sin build step, apto para dispositivos industriales |
| **Backend** | Node.js 20 · Express 4 · JWT (8h) | Ligero, stateless, fácil de desplegar |
| **Base de datos** | MySQL 8.0 · InnoDB · Row-level locking | ACID garantizado, sin deadlocks |
| **Auth** | bcryptjs · JWT firmado | Sesiones sin estado, expiración configurable |
| **Despliegue** | WAMP64 local · Aiven + Render cloud | Mismo codebase en ambos entornos |

---

## 3. Arquitectura del sistema

### Arquitectura en tres capas

![Arquitectura tres capas](docs/diseno/arquitectura.png)

### Diagrama de despliegue

![Diagrama de Despliegue](docs/diseno/despliegue.png)

### Diagrama de paquetes

![Diagrama de Paquetes](docs/diseno/paquetes.png)

### Diagrama de navegación (frontend)

![Diagrama de Navegación](docs/diseno/navegacion.png)

---

## 4. Modelo de dominio

### Diagrama de clases del dominio

![Diagrama de Clases](docs/analisis/diagrama-clases.png)

### Diagrama de objetos (instancia real)

> Instantánea de una operación de descarga real: operario Diego registra la entrada del palé JH-8819-A al sector B4.

![Diagrama de Objetos](docs/analisis/diagrama-objetos.png)

### Diagrama de estados del palé

> Ciclo de vida completo desde la recepción en muelle hasta la expedición o incidencia.

![Diagrama de Estados](docs/analisis/diagrama-estados.png)

| Estado | Descripción |
|--------|-------------|
| **Recepcionado** | Presente en muelle, sin sector asignado |
| **Emplazado** | Ubicado físicamente en un sector |
| **En reubicación** | En tránsito entre sectores |
| **En preparación** | Incluido en orden de expedición |
| **Expedido** | Fuera del almacén (terminal normal) |
| **Incidencia** | Anomalía detectada, flujo bloqueado |
| **Cancelado** | Expedición rechazada |

---

## 5. Casos de uso

### Catálogo de UC y priorización

| ID | Nombre | MoSCoW | Iteración | Estado |
|----|--------|--------|-----------|--------|
| UC-01 | Registrar entrada de palé | Must | 1ª | ✅ Implementado |
| UC-02 | Registrar salida de palé | Must | 1ª | ✅ Implementado |
| UC-03 | Consultar layout interactivo | Must | 1ª | ✅ Implementado |
| UC-04 | Reubicar palé entre sectores | Must | 2ª | ✅ Implementado |
| UC-05 | Consultar estadísticas de flujo | Should | 3ª | ✅ Implementado |
| UC-06 | Migrar datos legado (ETL) | Should | 2ª | ✅ Scripts migración |
| UC-07 | Calcular saturación de sector | Must | 1ª | ✅ Subflujo incluido |
| UC-08 | Registrar incidencia operativa | Should | 2ª | ✅ Implementado |
| UC-09 | Autenticar usuario (JWT) | Must | 1ª | ✅ Implementado |
| UC-10 | Buscar palé por referencia | Should | 2ª | ✅ Implementado |
| UC-11 | Gestionar usuarios del sistema | Could | 2ª | ✅ Implementado |
| UC-12 | Consultar historial de palé | Should | 3ª | ✅ Implementado |

### Visión general del sistema

![Casos de Uso — Visión General](docs/analisis/caso-uso-general.png)

### Modelos y relaciones entre casos de uso

![Modelos y Casos de Uso](docs/analisis/modelos-y-casos-de-uso.png)

### Estructura del modelo de CdU (include / extend)

![Estructura CdU](docs/analisis/estructura-cdu.png)

### Actor: Operario de Pista

![CdU — Operario](docs/analisis/caso-uso-operario.png)

### Actor: Administrador

![CdU — Administrador](docs/analisis/caso-uso-admin.png)

### Actor: MotorRollShip (sistema externo James Hardie)

![CdU — MotorRollShip](docs/analisis/caso-uso-motorrollship.png)

---

## 6. Diagramas de actividad

### UC-01 — Registrar entrada de palé

![Actividad UC-01](docs/analisis/actividad-uc01.png)

### UC-02 — Registrar salida de palé

![Actividad UC-02](docs/analisis/actividad-uc02.png)

### UC-04 — Reubicar palé entre sectores

![Actividad UC-04](docs/analisis/actividad-uc04.png)

### UC-05 — Consultar estadísticas de flujo

![Actividad UC-05](docs/analisis/actividad-uc05.png)

### UC-06 — Migrar datos legado (Access → MySQL)

![Actividad UC-06](docs/analisis/actividad-uc06.png)

### UC-08 — Registrar incidencia operativa

![Actividad UC-08](docs/analisis/actividad-uc08.png)

---

## 7. Diseño — secuencias y clases

### Clases de análisis (MVC)

![Clases de Análisis](docs/diseno/clases-analisis.png)

### Clases de diseño — Backend

![Clases Backend](docs/diseno/clases-backend.png)

### Clases de diseño — Frontend

![Clases Frontend](docs/diseno/clases-frontend.png)

### Análisis de paquetes

![Análisis de Paquetes](docs/diseno/analisis-paquetes.png)

---

### Diagramas de secuencia

#### UC-01 — Registrar entrada de palé
![Secuencia UC-01](docs/diseno/seq-uc01.png)

#### UC-02 — Registrar salida de palé
![Secuencia UC-02](docs/diseno/seq-uc02.png)

#### UC-03 — Revisar layout interactivo
![Secuencia UC-03](docs/diseno/seq-uc03.png)

#### UC-04 — Reubicar palé entre sectores
![Secuencia UC-04](docs/diseno/seq-uc04.png)

#### UC-09 — Autenticar usuario
![Secuencia UC-09](docs/diseno/seq-uc09.png)

#### UC-10 — Buscar palé por referencia
![Secuencia UC-10](docs/diseno/seq-uc10.png)

#### UC-12 — Consultar historial de palé
![Secuencia UC-12](docs/diseno/seq-uc12.png)

---

## 8. Modelo de datos (ER)

![Modelo Entidad-Relación](docs/diseno/er-modelo.png)

### Tablas del schema

| Tabla | Descripción | Filas actuales |
|-------|-------------|---------------|
| `sectores` | 118 sectores reales (filas A–K, CrossDocking, Cuarentena, Buffer) | 118 |
| `pales` | Palés activos con sector, mercancía y estado | 2.444 |
| `movimientos` | Historial completo ACID de todas las operaciones | 2.444+ |
| `mercancia` | Catálogo de productos James Hardie | 9 |
| `usuarios` | Cuentas con roles (bcrypt + JWT) | 4 |
| `incidencias` | Registro de anomalías operativas | — |
| `migracion_access` | Staging ETL para datos del legado | — |

### Requisitos no funcionales cubiertos

| ID | Requisito | Métrica |
|----|-----------|---------|
| RS-01 | Rendimiento | Layout < 1,5 s · escrituras < 2 s |
| RS-02 | Disponibilidad | 99,5 % en horario operativo |
| RS-03 | Seguridad | JWT 8h · bcrypt · RBAC 4 roles |
| RS-04 | Usabilidad | Botones ≥ 60×60 px · apto con guantes |
| RS-05 | Portabilidad | Chrome/Firefox/Safari · sin instalación |
| RS-06 | Mantenibilidad | MVC estricto · capas desacopladas |
| RS-07 | Integridad | Transacciones ACID · rollback automático |

---

## 9. Capturas del sistema

### Login — Autenticación por roles

![Login](docs/screenshots/login.png)

---

### Dashboard — KPIs en tiempo real

![Dashboard](docs/screenshots/dashboard.png)

---

### Layout interactivo — Plano real del almacén

> **118 sectores** · Filas A–K · CrossDocking · Cuarentena · Buffer  
> Semáforo: 🟢 Libre · 🟡 Bajo · 🟠 Medio · 🔴 Alto · 🚨 Crítico  
> Clic en cualquier sector → detalle de palés

![Layout](docs/screenshots/layout.png)

![Layout 2](docs/screenshots/layout2.png)

---

### Modal de sector — Lista de palés en tiempo real

![Modal Sector](docs/screenshots/modal-sector.png)

---

### Gestión de palés

| Nueva entrada | Registrar salida | Reubicar |
|:---:|:---:|:---:|
| ![Entrada](docs/screenshots/tab-entrada.png) | ![Salida](docs/screenshots/tab-salida.png) | ![Reubicar](docs/screenshots/tab-reubicar.png) |

---

### Inventario completo

![Inventario](docs/screenshots/inventario.png)

---

### Incidencias operativas

![Incidencias](docs/screenshots/incidencias.png)

![Modal Incidencia](docs/screenshots/modal-incidencia.png)

---

### Historial de palé

![Modal Historial](docs/screenshots/modal-historial.png)

---

### Panel de usuarios (administrador)

![Usuarios](docs/screenshots/usuarios.png)

---

## 10. Datos reales importados

El sistema está cargado con el volcado real de `almacenjh` del **26/05/2026**  
(fuente: `Almacen_20260526_0800.sql` — base de datos MS Access → MySQL).

| Métrica | Valor |
|---------|-------|
| Sectores activos | **118** |
| Palés en almacén | **2.444** |
| Capacidad total | **10.382 huecos** |
| Ocupación global | **23,5 %** |
| Palés en cuarentena | **76** |
| Sectores al 100 % | A02, A03, B01–B05, F03, G07–G11 |

| Zona | Sectores | Palés |
|------|----------|-------|
| Nave principal (filas A–K) | 99 | 2.368 |
| Cuarentena (Q01–Q15) | 15 | 76 |
| CrossDocking (W01–W03) | 3 | 0 |
| Buffer (ZF01–ZF02) | 2 | 0 |

Scripts de migración incluidos:
- `proyecto/migrate-sectores.js` — importa 118 sectores reales con capacidades reales
- `proyecto/migrate-pales.js` — genera 2.444 palés basados en `CapacidadUtilizada` real

---

## 11. Instalación y arranque

### Requisitos

- Node.js ≥ 18
- MySQL 8.0 (WAMP64 local o Aiven cloud)

### Pasos

```bash
# Instalar dependencias
cd proyecto/backend && npm install

# Configurar entorno
cp .env.example .env   # editar con credenciales MySQL

# Crear base de datos
mysql -u root -p wms_almacen < proyecto/backend/sql/schema.sql
mysql -u root -p wms_almacen < proyecto/backend/sql/seed.sql

# (Opcional) Migrar datos reales
node proyecto/migrate-sectores.js
node proyecto/migrate-pales.js

# Arrancar (frontend servido estático en el mismo puerto)
node proyecto/backend/src/app.js
```

Acceder a **http://localhost:3001**

### Variables `.env`

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=wms_almacen
JWT_SECRET=cambiar_en_produccion
PORT=3001
```

### Estructura del repositorio

```
TFG-2026/
├── proyecto/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── app.js              # Entry point Express
│   │   │   ├── config/             # Pool MySQL, variables
│   │   │   ├── controllers/        # Lógica de negocio
│   │   │   ├── routes/             # Rutas REST API
│   │   │   └── middleware/         # Auth JWT, RBAC roles
│   │   └── sql/
│   │       ├── schema.sql          # DDL + stored procedures
│   │       └── seed.sql            # Sectores reales + usuarios
│   ├── frontend/
│   │   ├── index.html              # SPA shell
│   │   ├── css/styles.css          # Diseño completo
│   │   └── js/
│   │       ├── router.js           # Hash router
│   │       ├── api.js              # Capa REST fetch
│   │       ├── ui.js               # Componentes reutilizables
│   │       └── pages/              # Dashboard, Layout, Palés…
│   ├── migrate-sectores.js         # Migración sectores almacenjh
│   └── migrate-pales.js            # Migración palés almacenjh
├── docs/
│   ├── analisis/                   # Diagramas Cap.2 (16 imágenes)
│   ├── diseno/                     # Diagramas Cap.3 (16 imágenes)
│   └── screenshots/                # Capturas Cap.4–5 (12 imágenes)
└── README.md
```

---

## 12. Credenciales de demo

| Rol | Email | Password | Acceso |
|-----|-------|----------|--------|
| **Administrador** | `admin@almacen.com` | `Admin2026!` | Total |
| **Operario** | `operario@almacen.com` | `Admin2026!` | Operaciones |
| **Gerente** | `gerente@almacen.com` | `Admin2026!` | Consulta + stats |
| **Visualizador** | `viewer@almacen.com` | `Admin2026!` | Solo lectura |

---

*TFG · Ingeniería Informática · UNEATLANTICO · Curso 2025–2026*
