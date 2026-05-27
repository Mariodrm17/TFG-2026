const { pool } = require('../config/database');

// GET /api/sectores - Layout completo con ocupación (UC-03)
async function getLayout(req, res) {
  try {
    const [sectores] = await pool.query(`
      SELECT
        s.id,
        s.codigo,
        s.nombre,
        s.capacidad_max,
        s.ocupacion_actual,
        s.activo,
        s.notas,
        ROUND((s.ocupacion_actual / s.capacidad_max) * 100, 1) AS porcentaje_ocupacion,
        CASE
          WHEN s.ocupacion_actual = 0                                         THEN 'libre'
          WHEN (s.ocupacion_actual / s.capacidad_max) < 0.5                   THEN 'bajo'
          WHEN (s.ocupacion_actual / s.capacidad_max) < 0.75                  THEN 'medio'
          WHEN (s.ocupacion_actual / s.capacidad_max) < 0.95                  THEN 'alto'
          ELSE                                                                      'critico'
        END AS estado_saturacion
      FROM sectores s
      ORDER BY s.codigo
    `);

    // Estadísticas globales del almacén
    const totalPales    = sectores.reduce((s, x) => s + x.ocupacion_actual, 0);
    const totalCapacidad= sectores.reduce((s, x) => s + x.capacidad_max, 0);
    const pctGlobal     = totalCapacidad > 0
      ? Math.round((totalPales / totalCapacidad) * 1000) / 10
      : 0;

    res.json({
      sectores,
      resumen: {
        total_sectores:   sectores.length,
        total_pales:      totalPales,
        capacidad_total:  totalCapacidad,
        ocupacion_global: pctGlobal,
      },
    });
  } catch (err) {
    console.error('Error en getLayout:', err);
    res.status(500).json({ error: 'Error al obtener el layout del almacén' });
  }
}

// GET /api/sectores/:id - Detalle de un sector con sus palés
async function getSectorDetalle(req, res) {
  const { id } = req.params;
  try {
    const [[sector]] = await pool.query(
      `SELECT s.*,
        ROUND((s.ocupacion_actual / s.capacidad_max) * 100, 1) AS porcentaje_ocupacion
       FROM sectores s WHERE s.id = ?`,
      [id]
    );

    if (!sector) return res.status(404).json({ error: 'Sector no encontrado' });

    const [pales] = await pool.query(
      `SELECT p.id, p.codigo_ref, p.estado, p.fecha_entrada, m.descripcion AS mercancia
         FROM pales p
         LEFT JOIN mercancia m ON p.mercancia_id = m.id
        WHERE p.sector_id = ? AND p.estado != 'expedido'
        ORDER BY p.fecha_entrada DESC`,
      [id]
    );

    res.json({ sector, pales });
  } catch (err) {
    console.error('Error en getSectorDetalle:', err);
    res.status(500).json({ error: 'Error al obtener detalle del sector' });
  }
}

// PUT /api/sectores/:id - Actualizar capacidad o notas (solo admin)
async function actualizarSector(req, res) {
  const { id } = req.params;
  const { capacidad_max, notas, activo } = req.body;

  try {
    const campos = [];
    const valores = [];

    if (capacidad_max !== undefined) { campos.push('capacidad_max = ?'); valores.push(capacidad_max); }
    if (notas !== undefined)         { campos.push('notas = ?');         valores.push(notas); }
    if (activo !== undefined)        { campos.push('activo = ?');         valores.push(activo); }

    if (campos.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos a actualizar' });
    }

    valores.push(id);
    await pool.query(`UPDATE sectores SET ${campos.join(', ')} WHERE id = ?`, valores);

    res.json({ mensaje: 'Sector actualizado correctamente' });
  } catch (err) {
    console.error('Error en actualizarSector:', err);
    res.status(500).json({ error: 'Error al actualizar el sector' });
  }
}

module.exports = { getLayout, getSectorDetalle, actualizarSector };
