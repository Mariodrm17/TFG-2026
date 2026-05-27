// Script de migración de palés — ejecutar una sola vez después de migrate-sectores.js
// Genera palés reales basados en la ocupación de almacenjh.ubicaciones (26/05/2026)
// node migrate-pales.js

const mysql = require('./backend/node_modules/mysql2/promise');
require('./backend/node_modules/dotenv/config');

const config = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'wms_almacen',
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  multipleStatements: true,
};

// Datos de almacenjh.ubicaciones (26/05/2026):
// [codigo, ocupacion_actual, idSku_almacenjh, fecha_referencia, destino]
// Solo sectores con ocupacion > 0, excluidas BARCO01/02 y ficticias
const OCUPACION = [
  // FILA A
  ['A01', 46,   3, '2026-05-14'],
  ['A02',100,   3, '2026-05-14'],
  ['A03',100,   3, '2026-05-14'],
  ['A04', 14,   3, '2026-05-14'],
  ['A05',  7,   4, '2026-05-20'],
  ['A06', 25,  74, '2026-05-22'],
  // FILA B
  ['B01',100,   4, '2026-05-18'],
  ['B02',100,   4, '2026-05-18'],
  ['B03',100,   4, '2026-05-20'],
  ['B04',100,   4, '2026-05-20'],
  ['B05',100,   4, '2026-05-20'],
  // FILA C
  ['C01', 48,   1, '2026-05-19'],
  ['C02', 48,   2, '2026-05-19'],
  ['C03', 34,   1, '2026-05-22'],
  // FILA D
  ['D02',  2,  85, '2026-02-04'],
  ['D03', 37,   2, '2026-05-18'],
  ['D04', 51, 107, '2026-05-14'],
  // FILA F
  ['F01', 39, 100, '2026-02-16'],
  ['F02', 73,   3, '2026-05-13'],
  ['F03',100,   3, '2026-05-17'],
  ['F05', 24,  88, '2026-03-27'],
  ['F07', 13, 106, '2026-02-18'],
  ['F09', 29,  74, '2026-05-06'],
  ['F10', 56, 106, '2026-02-18'],
  // FILA G
  ['G03', 76, 100, '2026-02-16'],
  ['G06', 59,   4, '2026-05-04'],
  ['G07',100,   4, '2026-05-11'],
  ['G08',100,   4, '2026-05-11'],
  ['G09',100,   4, '2026-05-11'],
  ['G10',100,   4, '2026-05-15'],
  ['G11',100,   4, '2026-05-18'],
  // FILA H
  ['H06',  4,  73, '2026-02-06'],
  ['H07', 20, 100, '2026-02-13'],
  ['H11', 21, 120, '2026-05-22'],
  // FILA J
  ['J01',  1,  75, '2026-05-22'],
  ['J03', 32,  86, '2026-05-15'],
  ['J04', 60,  76, '2026-03-28'],
  ['J06', 46,  77, '2026-05-15'],
  ['J07', 10,  85, '2026-05-22'],
  ['J10', 48,  75, '2026-05-15'],
  // FILA K
  ['K01', 51,  76, '2026-04-14'],
  ['K04',  9,  88, '2026-01-23'],
  ['K09',  9, 104, '2026-02-17'],
  ['K10', 76, 100, '2026-02-17'],
  // CUARENTENA
  ['Q01',  3,   3, '2025-02-09'],
  ['Q02',  1,  73, '2025-06-15'],
  ['Q03',  7,   4, '2025-06-15'],
  ['Q04',  7,  74, '2025-06-15'],
  ['Q05',  4,  77, '2025-06-15'],
  ['Q06',  5,  76, '2025-06-15'],
  ['Q07',  3, 100, '2026-02-11'],
  ['Q08', 27,   1, '2025-06-15'],
  ['Q09', 13,   2, '2025-06-15'],
  ['Q10',  2,  76, '2025-06-15'],
  ['Q11',  1,  88, '2025-06-15'],
  ['Q12',  3, 107, '2026-04-01'],
];

// Mapeo de IdSku de almacenjh → codigo de mercancia en wms_almacen
// Basado en la tabla sku de almacenjh y el destino del sector
const SKU_MERCANCIA = {
  1:   'JH-PIZARRA-XL',    // 71024 UK 2400x1200x12.5
  2:   'JH-PIZARRA-XL',    // 72024 UK 2400x1200x15
  3:   'JH-PIZARRA-STD',   // 71042 DK 1200x900x12.5
  4:   'JH-PIZARRA-STD',   // 72042 DK 1200x900x15
  73:  'JH-PIZARRA-STD',   // 71100 2500x900x12.5
  74:  'JH-PIZARRA-STD',   // 71342 1200x900x12.5 DK
  75:  'JH-PIZARRA-STD',   // 70042 1200x900x10.0 DK01
  76:  'JH-PIZARRA-XL',    // 72099 2500x900x15.0 DK01
  77:  'JH-PIZARRA-STD',   // 72342 1200x900x15.0 DK01
  85:  'JH-PIZARRA-STD',   // 71023 DK01
  86:  'JH-PIZARRA-STD',   // 71039 DK01
  88:  'JH-PIZARRA-STD',   // 73042 DK01
  100: 'JH-PIZARRA-XL',    // 71337 ES (grandes planchas)
  104: 'JH-PIZARRA-XL',    // 71133 2750x1250x12.5 DK01
  106: 'JH-PIZARRA-STD',   // 72340 DK01
  107: 'JH-PIZARRA-STD',   // 71200 DK01
  120: 'JH-PIZARRA-STD',   // 71359 2500x900x12.5 DK01
};

function fechaAleatoria(fechaRef) {
  const ref = new Date(fechaRef);
  // Fecha de entrada entre 1 y 90 días antes de la fecha de referencia
  const diasAntes = Math.floor(Math.random() * 90) + 1;
  const d = new Date(ref.getTime() - diasAntes * 86400000);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

(async () => {
  const conn = await mysql.createConnection(config);
  console.log('✅ Conectado a', config.database);

  await conn.beginTransaction();
  try {
    // Limpiar palés y movimientos existentes
    await conn.query('DELETE FROM incidencias');
    await conn.query('DELETE FROM movimientos');
    await conn.query('DELETE FROM pales');
    await conn.query('ALTER TABLE movimientos AUTO_INCREMENT = 1');
    await conn.query('ALTER TABLE pales AUTO_INCREMENT = 1');
    console.log('🗑  Palés y movimientos anteriores eliminados');

    // Cargar mapa sector_codigo → sector_id
    const [sectores] = await conn.query('SELECT id, codigo FROM sectores');
    const sectorMap = {};
    sectores.forEach(s => { sectorMap[s.codigo] = s.id; });

    // Cargar mapa codigo_mercancia → mercancia_id
    const [mercancias] = await conn.query('SELECT id, codigo FROM mercancia');
    const mercMap = {};
    mercancias.forEach(m => { mercMap[m.codigo] = m.id; });

    // ID del usuario admin para los movimientos
    const [[admin]] = await conn.query("SELECT id FROM usuarios WHERE rol='administrador' LIMIT 1");
    const adminId = admin.id;

    let totalPales = 0;

    for (const [codigo, ocupacion, idSku, fechaRef] of OCUPACION) {
      const sectorId = sectorMap[codigo];
      if (!sectorId) {
        console.warn(`  ⚠  Sector ${codigo} no encontrado en wms_almacen, omitido`);
        continue;
      }

      const mercanciaCodigo = SKU_MERCANCIA[idSku] || 'JH-PIZARRA-STD';
      const mercanciaId = mercMap[mercanciaCodigo];
      const esCuarentena = codigo.startsWith('Q');
      const estado = esCuarentena ? 'recepcionado' : 'emplazado';

      for (let n = 1; n <= ocupacion; n++) {
        const seq = String(n).padStart(4, '0');
        const codigoRef = `JH-${codigo}-${seq}`;
        const fechaEntrada = fechaAleatoria(fechaRef);

        const [resPale] = await conn.query(
          `INSERT INTO pales (codigo_ref, mercancia_id, sector_id, estado, fecha_entrada)
           VALUES (?, ?, ?, ?, ?)`,
          [codigoRef, mercanciaId, sectorId, estado, fechaEntrada]
        );

        await conn.query(
          `INSERT INTO movimientos (pale_id, usuario_id, tipo, sector_origen, sector_destino, fecha_hora, notas)
           VALUES (?, ?, 'entrada', NULL, ?, ?, ?)`,
          [resPale.insertId, adminId, sectorId, fechaEntrada,
           `Migración datos reales almacenjh — ${fechaRef}`]
        );

        totalPales++;
      }
      console.log(`  ✅ ${codigo}: ${ocupacion} palés insertados`);
    }

    await conn.commit();
    console.log(`\n🎉 Migración completada: ${totalPales} palés insertados con sus movimientos de entrada.`);
  } catch (err) {
    await conn.rollback();
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
})();
