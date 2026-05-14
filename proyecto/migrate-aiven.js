// Script de migración a Aiven — ejecutar una sola vez
// node migrate-aiven.js

const mysql = require('./backend/node_modules/mysql2/promise');
const fs    = require('fs');
const path  = require('path');

const config = {
  host:               'mysql-2d522125-mario-tfg.h.aivencloud.com',
  port:               26204,
  user:               'avnadmin',
  password:           process.env.AIVEN_PASS,   // pasa la contraseña como variable
  database:           'defaultdb',
  ssl:                { rejectUnauthorized: false },
  multipleStatements: true,
};

(async () => {
  if (!config.password) {
    console.error('❌  Falta la contraseña. Ejecuta: $env:AIVEN_PASS="tu_password"; node migrate-aiven.js');
    process.exit(1);
  }

  const conn = await mysql.createConnection(config);
  console.log('✅ Conectado a Aiven MySQL');

  const schemaSQL = fs.readFileSync(
    path.join(__dirname, 'backend/sql/schema.sql'), 'utf8'
  );
  const seedSQL = fs.readFileSync(
    path.join(__dirname, 'backend/sql/seed.sql'), 'utf8'
  );

  console.log('⏳ Ejecutando schema.sql...');
  await conn.query(schemaSQL);
  console.log('✅ Schema creado');

  console.log('⏳ Ejecutando seed.sql...');
  await conn.query(seedSQL);
  console.log('✅ Datos de prueba insertados');

  await conn.end();
  console.log('🎉 Migración completada. Ya puedes hacer deploy en Render.');
})().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
