# WMS Almacén Santander — Sistema de Gestión de Almacén
**Trabajo de Fin de Grado · Ingeniería Informática · UNEATLANTICO 2026**  
*Mario Del Río Merino — INTERMODAL SEA SOLUTIONS*

---

## Índice

1. [Contexto y problema](#1-contexto-y-problema)
2. [Solución propuesta](#2-solución-propuesta)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Arquitectura del sistema](#4-arquitectura-del-sistema)
5. [Modelo de datos](#5-modelo-de-datos)
6. [Casos de uso](#6-casos-de-uso)
7. [Diagramas de secuencia](#7-diagramas-de-secuencia)
8. [Diagramas de actividad](#8-diagramas-de-actividad)
9. [Diagramas de clases](#9-diagramas-de-clases)
10. [Capturas de pantalla](#10-capturas-de-pantalla)
11. [Datos reales del almacén](#11-datos-reales-del-almacén)
12. [Instalación y arranque](#12-instalación-y-arranque)
13. [Credenciales de demo](#13-credenciales-de-demo)

---

## 1. Contexto y problema

El almacén de **INTERMODAL SEA SOLUTIONS** en Santander gestiona la mercancía de **James Hardie** (planchas de fibrocemento) en tránsito hacia destinos europeos: UK, Dinamarca, España y Francia.

El sistema anterior era una base de datos **Microsoft Access** monolítica con:
- Acceso exclusivo (un operario a la vez)
- Sin interfaz web ni acceso móvil
- Deadlocks frecuentes en operaciones concurrentes
- Sin trazabilidad de movimientos ni control de roles
- Histórico de **~73.000 palés** manejados (68.248 salidas registradas)

![Diagrama de Contexto](docs/analisis/diagrama-contexto.png)

---

## 2. Solución propuesta

Sistema **WMS web** multiusuario con:
- Plano interactivo del almacén real (118 sectores)
- Registro de entradas, salidas y reubicaciones de palés
- Dashboard de estadísticas en tiempo real
- Control de acceso por roles (4 niveles)
- Trazabilidad completa de cada palé
- Arquitectura ACID con MySQL InnoDB (sin deadlocks)

---

## 3. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Vanilla JS · SPA con hash routing · CSS Grid/Flex |
| **Backend** | Node.js 20 · Express 4 · JWT (8h) · bcryptjs |
| **Base de datos** | MySQL 8.0 InnoDB · Row-level locking · Procedimientos almacenados |
| **Despliegue local** | WAMP64 · Puerto 3001 |
| **Despliegue cloud** | Aiven (MySQL) · Render (Node.js) |

---

## 4. Arquitectura del sistema

### Arquitectura en tres capas

![Arquitectura tres capas](docs/diseno/arquitectura-tres-capas.png)

### Diagrama de despliegue

![Diagrama de Despliegue](docs/diseno/despliegue.png)

### Diagrama de paquetes

![Diagrama de Paquetes](docs/diseno/paquetes.png)

---

## 5. Modelo de datos

### Diagrama Entidad-Relación

![Modelo ER](docs/diseno/er-modelo.png)

**Tablas principales:**

| Tabla | Descripción | Registros actuales |
|-------|-------------|-------------------|
| `sectores` | 118 sectores reales del almacén | 118 |
| `pales` | Palés activos con sector y mercancía | 2.444 |
| `movimientos` | Historial completo de operaciones | 2.444+ |
| `mercancia` | Catálogo de productos JH | 9 |
| `usuarios` | Cuentas con roles | 4 |
| `incidencias` | Registro de incidencias operativas | — |

---

## 6. Casos de uso

### Visión general

![Casos de Uso — Visión General](docs/analisis/caso-uso-general.png)

### Modelos y actores

![Modelos y Casos de Uso](docs/analisis/modelos-y-casos-de-uso.png)

### Actor: Administrador

![Casos de Uso — Administrador](docs/analisis/caso-uso-admin.png)

### Actor: Operario de Pista

![Casos de Uso — Operario](docs/analisis/caso-uso-operario.png)

### Actor: MotorRollShip (sistema externo)

![Casos de Uso — MotorRollShip](docs/analisis/caso-uso-motorrollship.png)

### Diagrama de estados del palé

![Diagrama de Estados](docs/analisis/diagrama-estados.png)

---

## 7. Diagramas de secuencia

Los diagramas de secuencia muestran la interacción entre capas para cada UC implementado.

### UC-01 — Registrar entrada de palé
![Secuencia UC-01](docs/diseno/seq-uc01.png)

### UC-02 — Registrar salida de palé
![Secuencia UC-02](docs/diseno/seq-uc02.png)

### UC-03 — Revisar layout interactivo
![Secuencia UC-03](docs/diseno/seq-uc03.png)

### UC-04 — Reubicar palé entre sectores
![Secuencia UC-04](docs/diseno/seq-uc04.png)

### UC-09 — Autenticar usuario
![Secuencia UC-09](docs/diseno/seq-uc09.png)

### UC-10 — Buscar palé por referencia
![Secuencia UC-10](docs/diseno/seq-uc10.png)

### UC-12 — Consultar historial de palé
![Secuencia UC-12](docs/diseno/seq-uc12.png)

---

## 8. Diagramas de actividad

Los diagramas de actividad detallan los flujos operativos con decisiones y bifurcaciones.

### UC-01 — Registrar entrada de palé
![Actividad UC-01](docs/analisis/actividad-uc01.png)

### UC-02 — Registrar salida de palé
![Actividad UC-02](docs/analisis/actividad-uc02.png)

### UC-04 — Reubicar palé entre sectores
![Actividad UC-04](docs/analisis/actividad-uc04.png)

### UC-05 — Consultar estadísticas de flujo
![Actividad UC-05](docs/analisis/actividad-uc05.png)

### UC-06 — Migrar datos del legado (Access → MySQL)
![Actividad UC-06](docs/analisis/actividad-uc06.png)

### UC-08 — Registrar incidencia operativa
![Actividad UC-08](docs/analisis/actividad-uc08.png)

---

## 9. Diagramas de clases

### Diagrama de clases del dominio (análisis)
![Clases — Análisis](docs/analisis/diagrama-clases.png)

### Clases de análisis MVC
![Clases — Análisis MVC](docs/diseno/clases-analisis.png)

### Clases de diseño — Backend
![Clases — Backend](docs/diseno/clases-backend.png)

### Clases de diseño — Frontend
![Clases — Frontend](docs/diseno/clases-frontend.png)

---

## 10. Capturas de pantalla

### Login — Autenticación JWT por roles
![Login](docs/screenshots/login.png)

---

### Dashboard — KPIs en tiempo real
![Dashboard](docs/screenshots/dashboard.png)

---

### Layout interactivo — Plano real del almacén
> 118 sectores · Filas A–K · CrossDocking · Cuarentena · Buffer  
> Clic en cualquier sector para ver sus palés

![Layout Sectores](docs/screenshots/layout-sectores.png)

---

### Modal de sector — Palés por sector
![Modal Sector](docs/screenshots/modal-sector.png)

---

### Gestión de palés — Nueva entrada
![Tab Nueva Entrada](docs/screenshots/tab-entrada.png)

### Gestión de palés — Registrar salida
![Tab Salida](docs/screenshots/tab-salida.png)

### Gestión de palés — Reubicar
![Tab Reubicar](docs/screenshots/tab-reubicar.png)

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
![Panel Usuarios](docs/screenshots/usuarios.png)

---

## 11. Datos reales del almacén

El sistema está cargado con el volcado real de `almacenjh` del **26/05/2026**:

| Métrica | Valor |
|---------|-------|
| Sectores activos | **118** |
| Palés en almacén | **2.444** |
| Capacidad total | **10.382 huecos** |
| Ocupación global | **23,5 %** |
| Sectores al 100 % | A02, A03, B01–B05, F03, G07–G11 |
| Palés en cuarentena | **76** (Q01–Q12) |

**Distribución por zonas:**

| Zona | Sectores | Palés |
|------|----------|-------|
| Nave principal (A–K) | 99 | 2.368 |
| Cuarentena (Q01–Q15) | 15 | 76 |
| CrossDocking (W01–W03) | 3 | 0 |
| Buffer (ZF01–ZF02) | 2 | 0 |

---

## 12. Instalación y arranque

### Requisitos

- Node.js ≥ 18
- MySQL 8.0 (WAMP64 en local o Aiven en cloud)

### Pasos

```bash
# 1. Instalar dependencias del backend
cd backend
npm install

# 2. Configurar entorno
cp .env.example .env
# Editar .env con credenciales de BD

# 3. Crear schema y datos iniciales
mysql -u root -p wms_almacen < backend/sql/schema.sql
mysql -u root -p wms_almacen < backend/sql/seed.sql

# 4. (Opcional) Migrar datos reales desde volcado almacenjh
node migrate-sectores.js
node migrate-pales.js

# 5. Arrancar servidor (sirve también el frontend estático)
cd backend
node src/app.js
```

Acceder a **http://localhost:3001**

### Variables de entorno (`.env`)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=wms_almacen
JWT_SECRET=cambiar_en_produccion
PORT=3001
```

---

## 13. Credenciales de demo

| Rol | Email | Password |
|-----|-------|----------|
| Administrador | `admin@almacen.com` | `Admin2026!` |
| Operario | `operario@almacen.com` | `Admin2026!` |
| Gerente | `gerente@almacen.com` | `Admin2026!` |
| Visualizador | `viewer@almacen.com` | `Admin2026!` |

---

## Estructura del proyecto

```
proyecto/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Entry point Express
│   │   ├── config/database.js      # Pool MySQL
│   │   ├── controllers/            # Lógica de negocio
│   │   ├── routes/                 # Rutas REST
│   │   └── middleware/             # Auth JWT, roles
│   └── sql/
│       ├── schema.sql              # DDL + procedimientos almacenados
│       └── seed.sql                # Sectores reales + usuarios demo
├── frontend/
│   ├── index.html                  # SPA shell
│   ├── css/styles.css              # Estilos completos
│   └── js/
│       ├── router.js               # Hash router
│       ├── api.js                  # Capa fetch → REST API
│       ├── ui.js                   # Componentes UI reutilizables
│       └── pages/                  # Módulos de cada vista
│           ├── dashboard.js
│           ├── layout.js           # Plano interactivo del almacén
│           ├── pales.js
│           ├── inventario.js
│           └── incidencias.js
├── docs/
│   ├── analisis/                   # Diagramas Cap.2 (14 imágenes)
│   ├── diseno/                     # Diagramas Cap.3 (14 imágenes)
│   └── screenshots/                # Capturas Cap.4–5 (12 imágenes)
├── migrate-sectores.js             # Migración sectores reales (almacenjh)
├── migrate-pales.js                # Migración palés reales (almacenjh)
└── README.md
```

---

*TFG · Ingeniería Informática · UNEATLANTICO · Curso 2025–2026*
