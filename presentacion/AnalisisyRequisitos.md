# Análisis y requisitos

## 1 Glosario

| Término | Definición |
|---------|-----------|
| **Sector / Área Lógica** | Cada una de las 118 divisiones físicas de la pista logística pensadas para el acopio de palés |
| **Palé (Goods)** | Elemento atómico indivisible de manipulación que contiene la manufactura de James Hardie |
| **Deadlock** | Error grave en MS Access cuando múltiples terminales intentan inscribir un movimiento concurrente |
| **Layout Virtual** | Plano web interactivo mapeado sobre el almacén físico con semáforos de saturación |
| **Rollship** | ERP propietario en PHP/Laravel del cliente; el WMS debe integrarse con él vía API REST |
| **Módulo Logístico Integrado** | El propio sistema WMS objeto de este TFG |

## 2 Modelo del dominio

#### Diagrama de clases conceptuales

![Diagrama de Clases del Dominio](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/diagrama-clases.png)

| Entidad | Descripción | Relaciones clave |
|---------|-------------|-----------------|
| `Almacen` | Recinto logístico completo (Santander) | 1 almacén → 118 sectores |
| `Sector` | Área física de almacenaje con capacidad definida | 1 sector → 0..* palés |
| `Palé` | Unidad de mercancía James Hardie; tiene estado y código único | Objeto de todo movimiento |
| `Movimiento` | Registro transaccional ACID de cada operación | 1 palé → 1..* movimientos |
| `Operario` | Actor humano con credenciales y rol | Notifica movimientos |
| `Cliente` | James Hardie — propietario de la mercancía | 1 cliente por almacén |

#### Diagrama de objetos (instantánea real)

> Operario Diego registra la entrada del palé JH-8819-A al sector B4 — operación real del almacén.

![Diagrama de Objetos](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/diagrama-objetos.png)

#### Diagrama de estados del palé

> El ciclo de vida completo del palé desde recepción en muelle hasta expedición. Los **casos de uso del sistema son los que provocan cada transición de estado**.

![Diagrama de Estados](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/diagrama-estados.png)

| Estado | Descripción | UC que lo provoca |
|--------|-------------|-------------------|
| **Recepcionado** | En muelle, sin sector asignado | Descarga física |
| **Emplazado** | Ubicado en un sector con registro ACID | UC-01 Entrada palé |
| **En reubicación** | En tránsito entre sectores | UC-04 Reubicar |
| **En preparación** | Incluido en orden de expedición | UC-02 (flujo previo) |
| **Expedido** | Fuera del almacén | UC-02 Salida palé |
| **Incidencia** | Anomalía detectada, operación bloqueada | UC-08 Incidencia |
| **Cancelado** | Expedición rechazada | Administrador |

## 3 Requisitos

#### Restricciones impuestas por la empresa (Requisitos no funcionales)

Estos son los requisitos que **la empresa cliente impuso como restricciones no negociables** al equipo de ingeniería:

| ID | Restricción de empresa | Origen |
|----|------------------------|--------|
| RS-E1 | La integración con Rollship debe realizarse mediante **API REST** (el ERP es PHP/Laravel y consume JSON) | James Hardie / INTERMODAL |
| RS-E2 | El sistema debe operar en **navegador web** sin instalación en dispositivos (tablets industriales) | INTERMODAL SEA SOLUTIONS |
| RS-E3 | La base de datos debe ser **MySQL** (infraestructura WAMP64 ya disponible en la empresa) | INTERMODAL SEA SOLUTIONS |
| RS-E4 | La interfaz debe ser **mobile-first** y apta para uso con guantes (CTAs ≥ 60×60 px) | Operarios de pista |
| RS-E5 | Los datos históricos del **MS Access** deben migrarse sin pérdida a MySQL | James Hardie (auditoría) |

#### Requisitos suplementarios FURPS+

| ID | Requisito | Métrica |
|----|-----------|---------|
| RS-01 | **Rendimiento** | Layout < 1,5 s · escrituras < 2 s para 68.000 tx/año |
| RS-02 | **Disponibilidad** | 99,5 % en horario operativo (07:00–20:00) |
| RS-03 | **Seguridad** | JWT 8h · bcrypt · RBAC 4 roles (visualizador/operario/gerente/admin) |
| RS-04 | **Usabilidad** | Botones ≥ 60×60 px · apto con guantes · Mobile-First |
| RS-05 | **Portabilidad** | Chrome / Firefox / Safari · sin instalación cliente |
| RS-06 | **Mantenibilidad** | Arquitectura MVC estricta · capas desacopladas · API REST |
| RS-07 | **Integridad** | Transacciones ACID · InnoDB Row-Level Locking · rollback automático |

## 4 Actores y casos de uso

#### Diagrama de contexto global del sistema

> El diagrama de contexto muestra todos los actores externos y cómo **los casos de uso navegan los estados del palé** desde Recepcionado hasta Expedido.

![Diagrama de Contexto](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/diagrama-contexto.png)

**Actores identificados:**

| Actor | Tipo | Interacción |
|-------|------|-------------|
| **Operario de Pista** | Principal humano | UC-01, UC-02, UC-03, UC-04, UC-08, UC-10, UC-12 |
| **Administrador** | Humano privilegiado | Todos los UC + UC-05, UC-06, UC-11 |
| **Motor Rollship** | Sistema externo (James Hardie ERP) | UC-03 (consulta layout vía API) |
| **MS Access Legacy** | Sistema externo transitorio | UC-06 (fuente de datos ETL) |

#### Diagrama general — visión global del sistema

![Casos de Uso — Visión General](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-general.png)

#### Actor: Operario de Pista

> El actor es siempre el **punto de inicio** del caso de uso.

![CdU — Operario](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-operario.png)

#### Actor: Administrador

![CdU — Administrador](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-admin.png)

#### Actor: Motor Rollship (sistema externo James Hardie)

![CdU — MotorRollShip](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-motorrollship.png)

#### Modelos y relaciones entre casos de uso (include / extend)

![Modelos y Casos de Uso](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/modelos-y-casos-de-uso.png)

![Estructura CdU include/extend](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/estructura-cdu.png)

## 5 Catálogo y priorización MoSCoW

| ID | Nombre del caso de uso | Actor principal | MoSCoW | Iteración | Estado |
|----|------------------------|-----------------|--------|-----------|--------|
| UC-01 | Registrar entrada de palé | Operario / Admin | **Must** | Sprint 1 | ✅ Implementado |
| UC-02 | Registrar salida de palé | Operario / Admin | **Must** | Sprint 1 | ✅ Implementado |
| UC-03 | Consultar layout interactivo | Operario / Admin / Rollship | **Must** | Sprint 1 | ✅ Implementado |
| UC-04 | Reubicar palé entre sectores | Operario / Admin | **Must** | Sprint 2 | ✅ Implementado |
| UC-05 | Consultar estadísticas de flujo | Administrador | Should | Sprint 3 | ✅ Implementado |
| UC-06 | Migrar datos legado (ETL Access→MySQL) | Administrador | Should | Sprint 2 | ✅ Scripts incluidos |
| UC-07 | Calcular saturación de sector | Sistema (subflujo) | **Must** | Sprint 1 | ✅ Subflujo en UC-01/03 |
| UC-08 | Registrar incidencia operativa | Operario / Admin | Should | Sprint 2 | ✅ Implementado |
| UC-09 | Autenticar usuario (JWT) | Todos los actores | **Must** | Sprint 1 | ✅ Implementado |
| UC-10 | Buscar palé por referencia | Operario / Admin | Should | Sprint 2 | ✅ Implementado |
| UC-11 | Gestionar usuarios del sistema | Administrador | Could | Sprint 2 | ✅ Implementado |
| UC-12 | Consultar historial de palé | Operario / Admin | Should | Sprint 3 | ✅ Implementado |

## 6 Detalle de casos de uso

> Cada caso de uso incluye el **diagrama de actividad** (flujo de procesos para que el CdU sea un éxito) y la descripción textual.

---

#### UC-01 — Registrar entrada de palé

**Actor:** Operario de Pista · **Prioridad:** Must · **Estado:** ✅

| | |
|--|--|
| **Precondiciones** | Usuario autenticado con rol ≥ Operario · mercancía físicamente en muelle · sector destino con capacidad libre |
| **Flujo normal** | 1. Operario accede al layout → 2. Selecciona sector verde → 3. Introduce código referencia del palé → 4. Sistema valida capacidad con `FOR UPDATE` (bloqueo de fila) → 5. Persiste palé + movimiento ENTRADA en transacción ACID → 6. Actualiza semáforo de saturación → 7. Muestra confirmación |
| **Excepción A1** | Sector alcanza capacidad límite concurrentemente → sistema rechaza con "Capacidad Máxima Superada" |
| **Excepción A2** | Código de referencia ya existe en sistema activo → alerta de duplicado |
| **Postcondiciones** | Palé en estado **Emplazado** · ocupación del sector incrementada · movimiento ENTRADA registrado en `movimientos` |
| **Include** | UC-07 Calcular saturación · UC-09 Autenticación |

**Diagrama de actividad — UC-01:**

![Actividad UC-01](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/actividad-uc01.png)

---

#### UC-02 — Registrar salida de palé

**Actor:** Operario de Pista · **Prioridad:** Must · **Estado:** ✅

| | |
|--|--|
| **Precondiciones** | Palé en estado Emplazado o En preparación · orden de expedición autorizada |
| **Flujo normal** | 1. Operario busca palé por código → 2. Sistema verifica estado válido → 3. Operario confirma salida → 4. Sistema actualiza palé a **Expedido** · decrementa ocupación del sector · registra movimiento SALIDA |
| **Excepción** | Palé ya expedido o en estado Incidencia → operación rechazada |
| **Postcondiciones** | Palé en estado **Expedido** · sector liberado · trazabilidad completa |

**Diagrama de actividad — UC-02:**

![Actividad UC-02](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/actividad-uc02.png)

---

#### UC-04 — Reubicar palé entre sectores

**Actor:** Operario de Pista · **Prioridad:** Must · **Estado:** ✅

| | |
|--|--|
| **Precondiciones** | Palé en estado Emplazado · sector destino con capacidad libre |
| **Flujo normal** | 1. Operario localiza palé → 2. Selecciona sector destino → 3. Sistema bloquea palé + sector destino simultáneamente (doble `FOR UPDATE`) → 4. Transfiere palé · actualiza contadores de ambos sectores · registra movimiento REUBICACION |
| **Postcondiciones** | Palé en estado **Emplazado** en nuevo sector · historial de la reubicación conservado |

**Diagrama de actividad — UC-04:**

![Actividad UC-04](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/actividad-uc04.png)

---

#### UC-05 — Consultar estadísticas de flujo

**Actor:** Administrador · **Prioridad:** Should · **Estado:** ✅

**Diagrama de actividad — UC-05:**

![Actividad UC-05](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/actividad-uc05.png)

---

#### UC-06 — Migrar datos legado (Access → MySQL)

**Actor:** Administrador · **Prioridad:** Should · **Estado:** ✅ (scripts incluidos)

**Diagrama de actividad — UC-06:**

![Actividad UC-06](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/actividad-uc06.png)

---

#### UC-08 — Registrar incidencia operativa

**Actor:** Operario / Administrador · **Prioridad:** Should · **Estado:** ✅

**Diagrama de actividad — UC-08:**

![Actividad UC-08](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/actividad-uc08.png)

---
