const express  = require('express');
const router   = express.Router();
const { crearIncidencia, listarIncidencias, resolverIncidencia } = require('../controllers/incidenciaController');
const { verificarToken, soloAdmin, soloGerente, puedeOperar } = require('../middleware/auth');

router.post('/',            verificarToken, puedeOperar, crearIncidencia);
router.get('/',             verificarToken, soloGerente, listarIncidencias);
router.put('/:id/resolver', verificarToken, soloAdmin,   resolverIncidencia);

module.exports = router;
