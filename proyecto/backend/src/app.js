require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { testConnection } = require('./config/database');

const authRoutes        = require('./routes/authRoutes');
const sectorRoutes      = require('./routes/sectorRoutes');
const paleRoutes        = require('./routes/paleRoutes');
const statsRoutes       = require('./routes/statsRoutes');
const incidenciaRoutes  = require('./routes/incidenciaRoutes');
const usuarioRoutes     = require('./routes/usuarioRoutes');
const mercanciaRoutes   = require('./routes/mercanciaRoutes');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// API routes (before static, so /api/* never falls through to static)
app.use('/api/auth',        authRoutes);
app.use('/api/sectores',    sectorRoutes);
app.use('/api/pales',       paleRoutes);
app.use('/api/stats',       statsRoutes);
app.use('/api/incidencias', incidenciaRoutes);
app.use('/api/usuarios',    usuarioRoutes);
app.use('/api/mercancia',   mercanciaRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', app: 'WMS Almacén Santander', version: '2.0.0' });
});

// Serve static vanilla HTML/CSS/JS frontend
const FRONTEND = path.join(__dirname, '../../frontend');
app.use(express.static(FRONTEND));

// SPA fallback: any non-API GET returns index.html (hash router handles the rest)
app.get(/^(?!\/api)/, (req, res) => {
  res.sendFile(path.join(FRONTEND, 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`\x1b[32m🚀 Servidor WMS → http://localhost:${PORT}\x1b[0m`);
    console.log(`\x1b[36m📦 Frontend servido desde: ${FRONTEND}\x1b[0m`);
  });
});
