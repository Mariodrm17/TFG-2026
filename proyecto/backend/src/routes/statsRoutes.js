const express = require('express');
const router  = express.Router();
const { getDashboard } = require('../controllers/statsController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.get('/', verificarToken, soloAdmin, getDashboard);

module.exports = router;
