const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
}

function soloGerente(req, res, next) {
  if (!['gerente', 'administrador'].includes(req.usuario?.rol)) {
    return res.status(403).json({ error: 'Acceso restringido a gerentes y administradores' });
  }
  next();
}

function puedeOperar(req, res, next) {
  if (!['operario', 'gerente', 'administrador'].includes(req.usuario?.rol)) {
    return res.status(403).json({ error: 'Acceso restringido a operarios, gerentes y administradores' });
  }
  next();
}

module.exports = { verificarToken, soloAdmin, soloGerente, puedeOperar };
