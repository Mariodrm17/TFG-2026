const express  = require('express');
const router   = express.Router();
const { listarUsuarios, crearUsuario, actualizarUsuario } = require('../controllers/usuarioController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.get('/',     verificarToken, soloAdmin, listarUsuarios);
router.post('/',    verificarToken, soloAdmin, crearUsuario);
router.put('/:id',  verificarToken, soloAdmin, actualizarUsuario);

module.exports = router;
