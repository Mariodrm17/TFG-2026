[← Arquitectura](./04-arquitectura.md) | [← Índice](./README.md) | [Screenshots →](./06-screenshots.md)

[Dominio](./01-dominio.md) | [Casos de Uso](./02-casos-de-uso.md) | [Actividades](./03-actividades.md) | [Arquitectura](./04-arquitectura.md) | [Secuencias](./05-secuencias.md) | [Screenshots](./06-screenshots.md)

---

# Diagramas de Secuencia

> Interacción **Actor → Vista → Controlador → Modelo** para los UC más representativos. Ver [Actividades](./03-actividades.md) para el flujo de proceso de cada UC.

---

## UC-01 — Registrar entrada de palé

> `SELECT … FOR UPDATE` sobre sector · inserción atómica palé + movimiento ENTRADA · ROLLBACK automático si sector lleno.

<div align="center">

![Secuencia UC-01](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc01.png)

</div>

---

## UC-02 — Registrar salida de palé

<div align="center">

![Secuencia UC-02](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc02.png)

</div>

---

## UC-03 — Consultar layout interactivo

> `GET /api/sectores` → semáforo de saturación → respuesta JSON a la Vista SPA · también accesible por Motor Rollship sin JWT.

<div align="center">

![Secuencia UC-03](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc03.png)

</div>

---

## UC-04 — Reubicar palé (doble FOR UPDATE)

> Doble bloqueo exclusivo: palé + sector destino bloqueados simultáneamente para garantizar atomicidad de la reubicación.

<div align="center">

![Secuencia UC-04](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc04.png)

</div>

---

## UC-09 — Autenticar usuario (JWT · bcrypt)

> Verificación bcrypt del hash · emisión JWT firmado con rol y expiración 8h · precondición de todos los demás UC.

<div align="center">

![Secuencia UC-09](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc09.png)

</div>

---

## UC-10 — Buscar palé por referencia

<div align="center">

![Secuencia UC-10](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc10.png)

</div>

---

## UC-12 — Consultar historial de palé

> Recupera todos los movimientos del palé ordenados por `fecha_hora` · permite reconstruir la trazabilidad completa para auditoría.

<div align="center">

![Secuencia UC-12](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/seq-uc12.png)

</div>

---

[← Arquitectura](./04-arquitectura.md) | [← Índice](./README.md) | [Screenshots →](./06-screenshots.md)
