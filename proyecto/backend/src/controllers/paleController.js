const { pool } = require('../config/database');

// POST /api/pales/entrada - UC-01: Anotar Entrada de Palé
async function entradaPale(req, res) {
  const { codigo_ref, sector_id, mercancia_id, notas } = req.body;
  const usuario_id = req.usuario.id;

  if (!codigo_ref || !sector_id) {
    return res.status(400).json({ error: 'codigo_ref y sector_id son obligatorios' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar que el código de palé no exista ya activo
    const [[paleExistente]] = await conn.query(
      "SELECT id FROM pales WHERE codigo_ref = ? AND estado != 'expedido'",
      [codigo_ref]
    );
    if (paleExistente) {
      await conn.rollback();
      return res.status(409).json({ error: `El palé ${codigo_ref} ya está registrado en el almacén` });
    }

    // Bloqueo a nivel de fila del sector (Row-Level Locking InnoDB)
    const [[sector]] = await conn.query(
      'SELECT id, ocupacion_actual, capacidad_max, activo FROM sectores WHERE id = ? FOR UPDATE',
      [sector_id]
    );

    if (!sector || !sector.activo) {
      await conn.rollback();
      return res.status(404).json({ error: 'Sector no encontrado o inactivo' });
    }

    if (sector.ocupacion_actual >= sector.capacidad_max) {
      await conn.rollback();
      return res.status(409).json({
        error: 'Capacidad máxima del sector superada. Por favor, selecciona otro sector.',
      });
    }

    // Insertar palé
    const [result] = await conn.query(
      "INSERT INTO pales (codigo_ref, mercancia_id, sector_id, estado) VALUES (?, ?, ?, 'emplazado')",
      [codigo_ref, mercancia_id || null, sector_id]
    );
    const pale_id = result.insertId;

    // Incrementar ocupación del sector
    await conn.query(
      'UPDATE sectores SET ocupacion_actual = ocupacion_actual + 1 WHERE id = ?',
      [sector_id]
    );

    // Registrar movimiento
    await conn.query(
      "INSERT INTO movimientos (pale_id, usuario_id, tipo, sector_destino, notas) VALUES (?, ?, 'entrada', ?, ?)",
      [pale_id, usuario_id, sector_id, notas || null]
    );

    await conn.commit();

    res.status(201).json({
      mensaje:  'Palé registrado correctamente',
      pale_id,
      codigo_ref,
      sector_id,
    });
  } catch (err) {
    await conn.rollback();
    console.error('Error en entradaPale:', err);
    res.status(500).json({ error: 'Error al registrar la entrada del palé' });
  } finally {
    conn.release();
  }
}

// POST /api/pales/:id/salida - UC-02: Consignar Expedición de Palé
async function salidaPale(req, res) {
  const { id } = req.params;
  const { notas } = req.body;
  const usuario_id = req.usuario.id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[pale]] = await conn.query(
      "SELECT id, sector_id, estado FROM pales WHERE id = ? AND estado != 'expedido' FOR UPDATE",
      [id]
    );

    if (!pale) {
      await conn.rollback();
      return res.status(404).json({ error: 'Palé no encontrado o ya expedido' });
    }

    const sector_origen = pale.sector_id;

    await conn.query(
      "UPDATE pales SET estado = 'expedido', sector_id = NULL, fecha_salida = NOW() WHERE id = ?",
      [id]
    );

    if (sector_origen) {
      await conn.query(
        'UPDATE sectores SET ocupacion_actual = GREATEST(0, ocupacion_actual - 1) WHERE id = ?',
        [sector_origen]
      );
    }

    await conn.query(
      "INSERT INTO movimientos (pale_id, usuario_id, tipo, sector_origen, notas) VALUES (?, ?, 'salida', ?, ?)",
      [id, usuario_id, sector_origen, notas || null]
    );

    await conn.commit();
    res.json({ mensaje: 'Palé expedido correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en salidaPale:', err);
    res.status(500).json({ error: 'Error al registrar la salida del palé' });
  } finally {
    conn.release();
  }
}

// PUT /api/pales/:id/reubicar - UC-04: Reemplazar Ubicación
async function reubicarPale(req, res) {
  const { id } = req.params;
  const { sector_destino_id, notas } = req.body;
  const usuario_id = req.usuario.id;

  if (!sector_destino_id) {
    return res.status(400).json({ error: 'sector_destino_id es obligatorio' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[pale]] = await conn.query(
      "SELECT id, sector_id FROM pales WHERE id = ? AND estado NOT IN ('expedido') FOR UPDATE",
      [id]
    );

    if (!pale) {
      await conn.rollback();
      return res.status(404).json({ error: 'Palé no encontrado o ya expedido' });
    }

    if (pale.sector_id === sector_destino_id) {
      await conn.rollback();
      return res.status(400).json({ error: 'El palé ya se encuentra en ese sector' });
    }

    // Verificar capacidad del sector destino
    const [[sectorDestino]] = await conn.query(
      'SELECT ocupacion_actual, capacidad_max FROM sectores WHERE id = ? FOR UPDATE',
      [sector_destino_id]
    );

    if (!sectorDestino) {
      await conn.rollback();
      return res.status(404).json({ error: 'Sector destino no encontrado' });
    }

    if (sectorDestino.ocupacion_actual >= sectorDestino.capacidad_max) {
      await conn.rollback();
      return res.status(409).json({ error: 'Capacidad máxima del sector destino superada' });
    }

    const sector_origen = pale.sector_id;

    // Mover el palé
    await conn.query(
      "UPDATE pales SET sector_id = ?, estado = 'emplazado' WHERE id = ?",
      [sector_destino_id, id]
    );

    // Actualizar contadores
    if (sector_origen) {
      await conn.query(
        'UPDATE sectores SET ocupacion_actual = GREATEST(0, ocupacion_actual - 1) WHERE id = ?',
        [sector_origen]
      );
    }
    await conn.query(
      'UPDATE sectores SET ocupacion_actual = ocupacion_actual + 1 WHERE id = ?',
      [sector_destino_id]
    );

    await conn.query(
      "INSERT INTO movimientos (pale_id, usuario_id, tipo, sector_origen, sector_destino, notas) VALUES (?, ?, 'reubicacion', ?, ?, ?)",
      [id, usuario_id, sector_origen, sector_destino_id, notas || null]
    );

    await conn.commit();
    res.json({ mensaje: 'Palé reubicado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en reubicarPale:', err);
    res.status(500).json({ error: 'Error al reubicar el palé' });
  } finally {
    conn.release();
  }
}

// GET /api/pales - Listado con filtros
async function listarPales(req, res) {
  const { estado, sector_id, buscar, pagina = 1, limite = 20 } = req.query;
  const offset = (pagina - 1) * limite;

  try {
    let where = ['1=1'];
    const params = [];

    if (estado)    { where.push('p.estado = ?');            params.push(estado); }
    if (sector_id) { where.push('p.sector_id = ?');         params.push(sector_id); }
    if (buscar)    { where.push('p.codigo_ref LIKE ?');      params.push(`%${buscar}%`); }

    const whereStr = where.join(' AND ');

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM pales p WHERE ${whereStr}`,
      params
    );

    const [pales] = await pool.query(
      `SELECT p.id, p.codigo_ref, p.estado, p.fecha_entrada, p.fecha_salida,
              s.codigo AS sector_codigo, s.nombre AS sector_nombre,
              m.descripcion AS mercancia
         FROM pales p
         LEFT JOIN sectores s  ON p.sector_id    = s.id
         LEFT JOIN mercancia m ON p.mercancia_id = m.id
        WHERE ${whereStr}
        ORDER BY p.fecha_entrada DESC
        LIMIT ? OFFSET ?`,
      [...params, parseInt(limite), offset]
    );

    res.json({ pales, total, pagina: parseInt(pagina), limite: parseInt(limite) });
  } catch (err) {
    console.error('Error en listarPales:', err);
    res.status(500).json({ error: 'Error al listar palés' });
  }
}

// GET /api/pales/:id - Detalle de un palé con su historial
async function detallePale(req, res) {
  const { id } = req.params;
  try {
    const [[pale]] = await pool.query(
      `SELECT p.*, s.codigo AS sector_codigo, m.descripcion AS mercancia
         FROM pales p
         LEFT JOIN sectores s  ON p.sector_id    = s.id
         LEFT JOIN mercancia m ON p.mercancia_id = m.id
        WHERE p.id = ?`,
      [id]
    );

    if (!pale) return res.status(404).json({ error: 'Palé no encontrado' });

    const [historial] = await pool.query(
      `SELECT mv.tipo, mv.fecha_hora, mv.notas,
              u.nombre AS usuario,
              so.codigo AS sector_origen, sd.codigo AS sector_destino
         FROM movimientos mv
         LEFT JOIN usuarios u  ON mv.usuario_id     = u.id
         LEFT JOIN sectores so ON mv.sector_origen   = so.id
         LEFT JOIN sectores sd ON mv.sector_destino  = sd.id
        WHERE mv.pale_id = ?
        ORDER BY mv.fecha_hora ASC`,
      [id]
    );

    res.json({ pale, historial });
  } catch (err) {
    console.error('Error en detallePale:', err);
    res.status(500).json({ error: 'Error al obtener detalle del palé' });
  }
}

module.exports = { entradaPale, salidaPale, reubicarPale, listarPales, detallePale };
