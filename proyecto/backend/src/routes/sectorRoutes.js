const express  = require('express');
const router   = express.Router();
const { getLayout, getSectorDetalle, actualizarSector } = require('../controllers/sectorController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.get('/',     verificarToken,             getLayout);
router.get('/:id',  verificarToken,             getSectorDetalle);
router.put('/:id',  verificarToken, soloAdmin,  actualizarSector);

module.exports = router;
