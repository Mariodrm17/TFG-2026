[1. Contexto](./Introduccion.md) | [2. Análisis y Requisitos](./AnalisisyRequisitos.md) | [3. Arquitectura](./Arquitectura.md) | [4. Demostración](./Demostracion.md) | [5. Conclusiones](./Conclusiones.md)

---

## 1. Arquitectura MVC en Capas

<div align="center">

![Arquitectura del Sistema en Capas](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/arquitectura.png)

</div>

- **SPA sin framework:** Vanilla JS con hash routing (`#/layout`, `#/operaciones`, `#/inventario`) — cero dependencias en cliente, funciona en cualquier navegador del almacén sin instalación.
- **Middleware JWT centralizado:** Toda ruta REST pasa por `verificarSesion(token)` antes de llegar al controlador. Un único punto de control RBAC; si el token es inválido o el rol insuficiente, la petición no llega al controlador.
- **Un controlador por caso de uso:** 12 UC → 12 controladores independientes. Ningún controlador llama a otro — la lógica de cada UC está completamente encapsulada.

---

## 2. Diagrama de Despliegue

<div align="center">

![Diagrama de Despliegue](https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/despliegue.png)

</div>

- **Infraestructura WAMP64 existente:** Apache, MySQL 8.0 y Node.js 20 corren en la misma máquina de la empresa — sin coste adicional de infraestructura ni cambio de entorno para el cliente.
- **Express sirve el frontend estáticamente:** La SPA se distribuye como ficheros estáticos desde el propio servidor Node.js — cero dependencias en el dispositivo del operario más allá del navegador.
- **Acceso desde cualquier dispositivo de la red:** Tablets industriales, móviles y PCs del almacén acceden vía navegador a la misma URL local — el RBAC garantiza que cada dispositivo ve solo lo que su rol permite.

---

## 3. Modelo Entidad-Relación y Transacción ACID

<div align="center">

<img src="https://github.com/Mariodrm17/TFG-2026/blob/main/docs/diseno/er-modelo.png" width="95%" alt="Modelo ER">

</div>

- **PALES como tabla central:** Todas las foreign keys convergen en `pales` — pivote entre `sectores`, `mercancia`, `movimientos` y `usuarios`. La integridad referencial de InnoDB impide borrar un palé con movimientos asociados.
- **Doble FK sector en MOVIMIENTOS:** `sector_origen` + `sector_destino` registra la reubicación (UC-04) en una sola fila. El historial completo de un palé en UC-12 se obtiene con un `SELECT … WHERE pale_id = ? ORDER BY fecha_hora`.
- **MIGRACION_ACCESS como tabla de staging:** Los datos del Access se importan en bruto como `datos_raw : json`, se procesan y se marcan `procesado = 1`. La migración ETL es idempotente — se puede relanzar sin duplicar registros.

```sql
-- ControladorEntradaPale — transacción ACID UC-01
START TRANSACTION;

  SELECT id, ocupacion_actual, capacidad_max
    FROM sectores WHERE id = ? FOR UPDATE;       -- Row-Level Lock: bloqueo exclusivo del sector

  INSERT INTO pales (codigo_ref, sector_id, mercancia_id, estado)
    VALUES (?, ?, ?, 'emplazado');

  INSERT INTO movimientos (pale_id, usuario_id, tipo, sector_destino, fecha_hora)
    VALUES (LAST_INSERT_ID(), ?, 'entrada', ?, NOW());  -- timestamp del servidor

  UPDATE sectores
    SET ocupacion_actual = ocupacion_actual + 1
    WHERE id = ?;

COMMIT;  -- ROLLBACK automático si cualquier paso falla
```

[1. Contexto](./Introduccion.md) | [2. Análisis y Requisitos](./AnalisisyRequisitos.md) | [3. Arquitectura](./Arquitectura.md) | [4. Demostración](./Demostracion.md) | [5. Conclusiones](./Conclusiones.md)
