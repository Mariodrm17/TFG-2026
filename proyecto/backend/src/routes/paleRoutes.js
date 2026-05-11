const express  = require('express');
const router   = express.Router();
const {
  entradaPale, salidaPale, reubicarPale, listarPales, detallePale,
} = require('../controllers/paleController');
const { verificarToken } = require('../middleware/auth');

router.get('/',           verificarToken, listarPales);
router.get('/:id',        verificarToken, detallePale);
router.post('/entrada',   verificarToken, entradaPale);
router.post('/:id/salida',verificarToken, salidaPale);
router.put('/:id/reubicar',verificarToken, reubicarPale);

module.exports = router;
