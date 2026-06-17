[← Dominio](./01-dominio.md) | [← Índice](./README.md) | [Actividades →](./03-actividades.md)

[Dominio](./01-dominio.md) | [Casos de Uso](./02-casos-de-uso.md) | [Actividades](./03-actividades.md) | [Arquitectura](./04-arquitectura.md) | [Secuencias](./05-secuencias.md) | [Screenshots](./06-screenshots.md)

---

# Casos de Uso

---

## Visión general — todos los actores

> 12 UC · 4 actores: Operario de Pista · Administrador · Motor Rollship · MS Access Legacy.

<div align="center">

![CdU General](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-general.png)

</div>

---

## Actor: Operario de Pista

> 6 UC directos: UC-01 · 02 · 03 · 04 · 10 · 12. UC-07 y UC-09 como `<<include>>` automático; UC-08 como `<<extend>>` si hay error.

<div align="center">

![CdU Operario de Pista](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-operario.png)

</div>

---

## Actor: Administrador

> Hereda todos los UC del Operario y añade UC-05 (estadísticas) · UC-06 (migración ETL) · UC-11 (gestión de usuarios).

<div align="center">

![CdU Administrador](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-admin.png)

</div>

---

## Actor: Motor Rollship

> Actor sistema (James Hardie ERP). Solo accede a UC-03 vía `GET /api/sectores` — sin sesión JWT, solo API REST pública.

<div align="center">

![CdU Motor Rollship](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/caso-uso-motorrollship.png)

</div>

---

## Modelos y relaciones entre casos de uso

<div align="center">

![Modelos y Casos de Uso](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/modelos-y-casos-de-uso.png)

</div>

---

## Estructura include / extend

> Árbol completo de dependencias: qué UC incluyen a cuáles y cuáles se extienden bajo qué condición.

<div align="center">

![Estructura CdU](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/analisis/estructura-cdu.png)

</div>

---

[← Dominio](./01-dominio.md) | [← Índice](./README.md) | [Actividades →](./03-actividades.md)
