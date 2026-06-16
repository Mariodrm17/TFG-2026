## Introducción y contexto

### 1 Problema operativo

El almacén de **INTERMODAL SEA SOLUTIONS** en el puerto de Santander gestiona la mercancía de **James Hardie** (planchas de fibrocemento con destino UK, Dinamarca y España). El sistema heredado era MS Access en un único PC de escritorio, con los siguientes problemas críticos:

| Problema | Impacto real |
|----------|-------------|
| MS Access monolítico en un único PC | Un operario a la vez, sin acceso móvil |
| Deadlocks en operaciones concurrentes | Pérdida de datos y bloqueos de jornada |
| Sin mapa visual de ocupación | Gestión por hojas Excel desactualizadas |
| Sin trazabilidad de movimientos | Imposible auditar entradas/salidas |
| Sin control de roles | Cualquier usuario modifica cualquier registro |

**Volumen real del almacén:** ~73.064 palés entrados / ~68.248 salidos en histórico · **118 sectores físicos** · **10.382 huecos de capacidad total**

### 2 Estado del arte

Se analizaron soluciones WMS comerciales (Wareventory), sistemas de automatización logística (Schneider Electric) y la literatura técnica sobre bases de datos ACID (InnoDB, Date 2004, Elmasri & Navathe 2016). La conclusión fue que una solución personalizada es la única opción viable dado que:
- El cliente tiene restricción de integración con **Rollship** (ERP propietario en PHP/Laravel)
- El sistema debe operar en red interna sin instalación en dispositivos
- Los datos históricos del Access deben migrarse sin pérdida

### 3 Hipótesis y objetivos

**Hipótesis:** Un módulo web transaccional sobre MySQL InnoDB elimina los deadlocks del Access y habilita el control multiusuario en tiempo real.

| # | Objetivo específico | Capítulo |
|---|---------------------|----------|
| O1 | Modelar el dominio y especificar requisitos del WMS | Cap. 2 |
| O2 | Diseñar la arquitectura MVC y los modelos de datos | Cap. 3 |
| O3 | Implementar y verificar el sistema funcional completo | Cap. 4 y 5 |

### 4 Metodología

Desarrollo **iterativo e incremental** en 3 sprints:
- **Sprint 1:** UC-01, UC-02, UC-03, UC-09 (núcleo operativo)
- **Sprint 2:** UC-04, UC-06, UC-08, UC-10, UC-11 (gestión avanzada)
- **Sprint 3:** UC-05, UC-12 (dashboard y trazabilidad)

Metodología de elicitación: **Job Shadowing** en pista logística + entrevistas con operarios y gerencia.

---
