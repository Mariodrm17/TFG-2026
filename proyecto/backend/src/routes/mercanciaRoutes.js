const express  = require('express');
const router   = express.Router();
const { pool } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// GET /api/mercancia - Listar tipos de mercancía
router.get('/', verificarToken, async (req, res) => {
  try {
    const [mercancias] = await pool.query(
      'SELECT id, codigo, descripcion, tipo, peso_kg FROM mercancia ORDER BY tipo, descripcion'
    );
    res.json({ mercancias });
  } catch (err) {
    console.error('Error en listarMercancia:', err);
    res.status(500).json({ error: 'Error al listar mercancías' });
  }
});

module.exports = router;
