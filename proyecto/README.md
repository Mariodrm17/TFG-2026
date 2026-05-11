# WMS · Sistema de Gestión de Almacén — James Hardie

**TFG - Ingeniería Informática | Mario Del Río Merino | UNEATLANTICO 2026**

Sistema web interactivo de gestión de almacén (WMS) desarrollado para **INTERMODAL SEA SOLUTIONS**,
diseñado para digitalizar y reemplazar el sistema heredado MS Access del almacén de Santander
que opera la cuenta de **James Hardie** (~68.000 palés/año, 38 sectores).

---

## Arquitectura del Proyecto

```
proyecto/
├── backend/    → API REST (Node.js + Express + MySQL)
│   ├── sql/    → Schema + datos iniciales
│   └── src/
│       ├── controllers/   → Lógica de negocio
│       ├── routes/        → Rutas API
│       ├── middleware/     → JWT auth
│       └── config/        → BD y entorno
└── frontend/   → SPA (React + Vite)
    └── src/
        ├── pages/         → Vistas principales
        ├── components/    → Componentes reutilizables
        ├── services/      → API client (Axios)
        └── styles/        → CSS global
```

### Stack tecnológico

| Capa       | Tecnología                         |
|------------|------------------------------------|
| Frontend   | React 18, Vite, React Router v6    |
| Backend    | Node.js 18, Express.js             |
| Base datos | MySQL 8.0 (InnoDB — ACID)          |
| Auth       | JWT (jsonwebtoken + bcryptjs)      |
| HTTP       | Axios                              |

---

## Instalación y arranque

### Requisitos previos
- Node.js 18+
- MySQL 8.0+
- npm

### 1. Base de datos

```bash
# Crear la base de datos y las tablas
mysql -u root -p < backend/sql/schema.sql

# Cargar datos iniciales (38 sectores + mercancías + usuarios demo)
mysql -u root -p wms_almacen < backend/sql/seed.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # Edita la contraseña de MySQL
npm install
npm run dev                 # → http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # → http://localhost:5173
```

---

## Credenciales demo

| Rol            | Email                    | Contraseña  |
|----------------|--------------------------|-------------|
| Administrador  | admin@almacen.com        | Admin2026!  |
| Operario       | operario@almacen.com     | Admin2026!  |

---

## Casos de Uso implementados

| UC   | Descripción                                          | Rol        | Estado |
|------|------------------------------------------------------|------------|--------|
| UC-01 | Registrar entrada de palé (con Row-Level Locking)   | Operario   | ✅     |
| UC-02 | Registrar expedición (salida) de palé               | Operario   | ✅     |
| UC-03 | Layout interactivo con semáforos de ocupación       | Todos      | ✅     |
| UC-04 | Reubicar palé entre sectores                        | Operario   | ✅     |
| UC-05 | Dashboard estadístico (KPIs, gráficos)              | Admin      | ✅     |
| UC-06 | Migración ETL desde MS Access (schema preparado)    | Admin      | 🔄     |
| UC-07 | Calcular saturación de sector (subflujo automático) | Sistema    | ✅     |
| UC-08 | Registrar y resolver incidencias operativas         | Ambos      | ✅     |
| UC-09 | Autenticación JWT con roles (subflujo)              | Sistema    | ✅     |
| UC-10 | Buscar palé por referencia                          | Todos      | ✅     |
| UC-11 | Gestionar usuarios del sistema (CRUD)               | Admin      | ✅     |
| UC-12 | Consultar historial completo de un palé             | Todos      | ✅     |

---

## API REST — Endpoints

### Auth
| Método | Ruta              | Auth | Descripción            |
|--------|-------------------|------|------------------------|
| POST   | /api/auth/login   | —    | Iniciar sesión (JWT)   |
| GET    | /api/auth/perfil  | JWT  | Perfil del usuario     |

### Sectores / Layout (UC-03, UC-07)
| Método | Ruta                | Auth       | Descripción                    |
|--------|---------------------|------------|--------------------------------|
| GET    | /api/sectores       | JWT        | Layout completo con ocupación  |
| GET    | /api/sectores/:id   | JWT        | Detalle + palés de un sector   |
| PUT    | /api/sectores/:id   | JWT+Admin  | Actualizar capacidad/notas     |

### Palés (UC-01, UC-02, UC-04, UC-10, UC-12)
| Método | Ruta                    | Auth | Descripción                     |
|--------|-------------------------|------|---------------------------------|
| GET    | /api/pales              | JWT  | Listado con filtros y paginación |
| GET    | /api/pales/:id          | JWT  | Detalle + historial completo    |
| POST   | /api/pales/entrada      | JWT  | UC-01: Registrar entrada         |
| POST   | /api/pales/:id/salida   | JWT  | UC-02: Registrar salida          |
| PUT    | /api/pales/:id/reubicar | JWT  | UC-04: Reubicar palé             |

### Incidencias (UC-08)
| Método | Ruta                         | Auth       | Descripción                      |
|--------|------------------------------|------------|----------------------------------|
| POST   | /api/incidencias             | JWT        | Registrar incidencia operativa   |
| GET    | /api/incidencias             | JWT+Admin  | Listar incidencias con filtros   |
| PUT    | /api/incidencias/:id/resolver| JWT+Admin  | Resolver incidencia (admin)      |

### Usuarios (UC-11)
| Método | Ruta               | Auth       | Descripción              |
|--------|--------------------|------------|--------------------------|
| GET    | /api/usuarios      | JWT+Admin  | Listar todos los usuarios |
| POST   | /api/usuarios      | JWT+Admin  | Crear nuevo usuario       |
| PUT    | /api/usuarios/:id  | JWT+Admin  | Actualizar usuario        |

### Estadísticas (UC-05)
| Método | Ruta        | Auth       | Descripción                      |
|--------|-------------|------------|----------------------------------|
| GET    | /api/stats  | JWT+Admin  | Dashboard (KPIs + movimientos)   |

### Mercancía
| Método | Ruta           | Auth | Descripción                |
|--------|----------------|------|----------------------------|
| GET    | /api/mercancia | JWT  | Listar tipos de mercancía  |

---

## Control de concurrencia

El backend implementa **Row-Level Locking** de MySQL InnoDB mediante transacciones explícitas:

```js
await conn.beginTransaction();
// SELECT ... FOR UPDATE  ← bloqueo exclusivo de fila (InnoDB)
// INSERT / UPDATE transaccional
await conn.commit();
```

Esto garantiza que dos operarios no puedan asignar el último hueco de un sector
simultáneamente, eliminando las condiciones de carrera del sistema Access heredado.

---

## Diseño visual

Paleta de colores basada en la identidad corporativa de **Intermodal Sea Solutions**:
- **Primario**: Azul marino profundo (`#0B3069`)
- **Acento**: Naranja logístico (`#e8702a`)
- **Semáforo**: Verde → Amarillo → Naranja → Rojo (ocupación de sectores)
