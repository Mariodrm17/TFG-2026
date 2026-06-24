[1. Contexto](./Introduccion.md) | [2. Análisis y Requisitos](./AnalisisyRequisitos.md) | [3. Arquitectura](./Arquitectura.md) | [4. Demostración](./Demostracion.md) | [5. Conclusiones](./Conclusiones.md)

---

## 1. Identificación y Jerarquía de Actores

<div align="center">

![Diagrama de Contexto General](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-general.png)

</div>

- **RBAC con 4 roles:** visualizador → operario → gerente → administrador. Cada nivel hereda los permisos del anterior; ningún rol accede a funciones fuera de su ámbito sin escalada explícita.
- **Actor humano vs. sistema externo:** Rollship ERP actúa como actor automatizado — no tiene sesión JWT, interactúa exclusivamente vía API REST con una clave de API fija.
- **Actor externo transitorio:** MS Access Legacy solo aparece como fuente de datos en UC-06 (migración ETL, operación única); tras la migración, queda eliminado del flujo operativo.

---

## 2. Casos de Uso: Operativa de Pista

<div align="center">

![CdU — Operario de Pista](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-operario.png)

</div>

- **Operario de Pista (Carga Operativa):** 6 casos de uso directos — entrada, salida, layout, reubicación, búsqueda e historial. UC-07 (saturación) y UC-09 (auth) son subflujos automáticos `<<include>>`; UC-08 (incidencia) se activa solo si algo sale mal `<<extend>>`.

---

## 3. Casos de Uso: Administración y Sistema Externo

<div align="center">

![CdU — Administrador](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-admin.png)

</div>

- **Administrador (Control Total):** Hereda todos los UC del Operario y añade UC-05 (estadísticas de flujo), UC-06 (migración ETL Access→MySQL) y UC-11 (gestión de usuarios). Es el único rol con acceso al panel de datos históricos.

<div align="center">

![CdU — Motor Rollship](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-motorrollship.png)

</div>

- **Motor Rollship (Actor Automatizado):** Solo tiene acceso a UC-03 (layout interactivo) vía API REST. No autenticado por JWT — consume el endpoint público de ocupación de sectores para sincronizar con el ERP de James Hardie.

---

## 4. Detalle de Casos de Uso Clave

#### UC-01 — Registrar entrada de palé · Must · Sprint 1

| | |
|--|--|
| **Precondiciones** | Usuario autenticado · mercancía en muelle · sector destino con capacidad libre |
| **Flujo normal** | 1. Accede al layout → 2. Selecciona sector verde → 3. Introduce código referencia → 4. Sistema valida capacidad con `FOR UPDATE` → 5. Persiste palé + movimiento ENTRADA en transacción ACID → 6. Actualiza semáforo de saturación |
| **Excepción A1** | Sector alcanza capacidad concurrentemente → rechaza con "Capacidad Máxima Superada" |
| **Excepción A2** | Código ya existe en sistema activo → alerta de duplicado |
| **Postcondiciones** | Palé en estado **Emplazado** · movimiento ENTRADA registrado |
| **Include** | UC-07 Calcular saturación · UC-09 Autenticación |

<div align="center">

![Actividad UC-01](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc01.png)

</div>

---

#### UC-04 — Reubicar palé entre sectores · Must · Sprint 2

| | |
|--|--|
| **Precondiciones** | Palé en estado Emplazado · sector destino con capacidad libre |
| **Flujo normal** | 1. Localiza palé → 2. Selecciona sector destino → 3. Sistema bloquea palé + sector destino simultáneamente (doble `FOR UPDATE`) → 4. Transfiere palé · actualiza contadores de ambos sectores · registra movimiento REUBICACION |
| **Postcondiciones** | Palé **Emplazado** en nuevo sector · historial de la reubicación conservado |

<div align="center">

![Actividad UC-04](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc04.png)

</div>

---

[1. Contexto](./Introduccion.md) | [2. Análisis y Requisitos](./AnalisisyRequisitos.md) | [3. Arquitectura](./Arquitectura.md) | [4. Demostración](./Demostracion.md) | [5. Conclusiones](./Conclusiones.md)
