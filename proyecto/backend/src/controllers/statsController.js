const { pool } = require('../config/database');

// GET /api/stats - UC-05: Dashboard de estadísticas para administrador
async function getDashboard(req, res) {
  try {
    // KPIs globales
    const [[kpis]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM pales WHERE estado != 'expedido')                        AS pales_en_almacen,
        (SELECT COUNT(*) FROM pales WHERE DATE(fecha_entrada) = CURDATE())             AS entradas_hoy,
        (SELECT COUNT(*) FROM movimientos WHERE tipo = 'salida' AND DATE(fecha_hora) = CURDATE()) AS salidas_hoy,
        (SELECT COUNT(*) FROM movimientos WHERE tipo = 'reubicacion' AND DATE(fecha_hora) = CURDATE()) AS reubicaciones_hoy,
        (SELECT ROUND(AVG(ocupacion_actual/capacidad_max)*100, 1) FROM sectores WHERE activo=1) AS ocupacion_media_pct
    `);

    // Movimientos últimos 7 días por tipo
    const [movimientos7d] = await pool.query(`
      SELECT
        DATE(fecha_hora)   AS fecha,
        tipo,
        COUNT(*)           AS total
      FROM movimientos
      WHERE fecha_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(fecha_hora), tipo
      ORDER BY fecha ASC
    `);

    // Top 5 sectores más ocupados
    const [topSectores] = await pool.query(`
      SELECT codigo, nombre, ocupacion_actual, capacidad_max,
             ROUND((ocupacion_actual/capacidad_max)*100, 1) AS pct
      FROM sectores
      WHERE activo = 1
      ORDER BY pct DESC
      LIMIT 5
    `);

    // Distribución por estado de palés
    const [estadosPales] = await pool.query(`
      SELECT estado, COUNT(*) AS total
      FROM pales
      GROUP BY estado
    `);

    res.json({ kpis, movimientos7d, topSectores, estadosPales });
  } catch (err) {
    console.error('Error en getDashboard:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

module.exports = { getDashboard };
