const { pool } = require('../config/database');

// POST /api/incidencias - UC-08: Registrar incidencia operativa
async function crearIncidencia(req, res) {
  const { pale_id, descripcion, tipo } = req.body;
  const usuario_id = req.usuario.id;

  if (!pale_id || !descripcion) {
    return res.status(400).json({ error: 'pale_id y descripción son obligatorios' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[pale]] = await conn.query(
      "SELECT id, estado FROM pales WHERE id = ? AND estado NOT IN ('expedido') FOR UPDATE",
      [pale_id]
    );

    if (!pale) {
      await conn.rollback();
      return res.status(404).json({ error: 'Palé no encontrado o ya expedido' });
    }

    const [result] = await conn.query(
      "INSERT INTO incidencias (pale_id, usuario_id, descripcion, tipo) VALUES (?, ?, ?, ?)",
      [pale_id, usuario_id, descripcion, tipo || 'otro']
    );

    // Bloquear el palé durante la incidencia
    await conn.query(
      "UPDATE pales SET estado = 'en_preparacion' WHERE id = ?",
      [pale_id]
    );

    await conn.commit();
    res.status(201).json({ mensaje: 'Incidencia registrada correctamente', id: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error('Error en crearIncidencia:', err);
    res.status(500).json({ error: 'Error al registrar la incidencia' });
  } finally {
    conn.release();
  }
}

// GET /api/incidencias - Listar incidencias (filtros opcionales)
async function listarIncidencias(req, res) {
  const { estado, pagina = 1, limite = 20 } = req.query;
  const offset = (pagina - 1) * limite;

  try {
    const where = ['1=1'];
    const params = [];

    if (estado) { where.push('i.estado = ?'); params.push(estado); }

    const whereStr = where.join(' AND ');

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM incidencias i WHERE ${whereStr}`,
      params
    );

    const [incidencias] = await pool.query(
      `SELECT i.id, i.descripcion, i.tipo, i.estado,
              i.fecha_creacion, i.fecha_resolucion, i.notas_resolucion,
              p.id AS pale_id, p.codigo_ref AS pale_codigo, p.estado AS pale_estado,
              s.codigo AS sector_codigo,
              u.nombre AS usuario_reporta,
              ur.nombre AS usuario_resuelve
         FROM incidencias i
         JOIN pales p    ON i.pale_id    = p.id
         LEFT JOIN sectores s  ON p.sector_id  = s.id
         JOIN usuarios u  ON i.usuario_id = u.id
         LEFT JOIN usuarios ur ON i.resuelto_por = ur.id
        WHERE ${whereStr}
        ORDER BY i.fecha_creacion DESC
        LIMIT ? OFFSET ?`,
      [...params, parseInt(limite), offset]
    );

    res.json({ incidencias, total });
  } catch (err) {
    console.error('Error en listarIncidencias:', err);
    res.status(500).json({ error: 'Error al listar incidencias' });
  }
}

// PUT /api/incidencias/:id/resolver - Resolver incidencia (admin, UC-08 flujo A1)
async function resolverIncidencia(req, res) {
  const { id } = req.params;
  const { notas_resolucion } = req.body;
  const usuario_id = req.usuario.id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[incidencia]] = await conn.query(
      "SELECT id, pale_id, estado FROM incidencias WHERE id = ? FOR UPDATE",
      [id]
    );

    if (!incidencia || incidencia.estado !== 'abierta') {
      await conn.rollback();
      return res.status(404).json({ error: 'Incidencia no encontrada o ya resuelta' });
    }

    await conn.query(
      `UPDATE incidencias
          SET estado = 'resuelta', resuelto_por = ?, fecha_resolucion = NOW(), notas_resolucion = ?
        WHERE id = ?`,
      [usuario_id, notas_resolucion || null, id]
    );

    // Devolver el palé al estado emplazado
    await conn.query(
      "UPDATE pales SET estado = 'emplazado' WHERE id = ? AND estado = 'en_preparacion'",
      [incidencia.pale_id]
    );

    await conn.commit();
    res.json({ mensaje: 'Incidencia resuelta. Palé devuelto a estado emplazado.' });
  } catch (err) {
    await conn.rollback();
    console.error('Error en resolverIncidencia:', err);
    res.status(500).json({ error: 'Error al resolver la incidencia' });
  } finally {
    conn.release();
  }
}

module.exports = { crearIncidencia, listarIncidencias, resolverIncidencia };
