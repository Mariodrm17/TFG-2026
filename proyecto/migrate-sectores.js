// Script de migración de sectores reales — ejecutar una sola vez
// Actualiza wms_almacen.sectores con los sectores reales de almacenjh
// node migrate-sectores.js
// ADVERTENCIA: elimina pales y movimientos de demo (sector IDs cambiarán)

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

const SECTORES = [
  // Fila A
  ['A01','Sector A01',100, 46],['A02','Sector A02',100,100],['A03','Sector A03',100,100],
  ['A04','Sector A04',100, 14],['A05','Sector A05',100,  7],['A06','Sector A06',100, 25],
  ['A07','Sector A07',100,  0],['A08','Sector A08',100,  0],['A09','Sector A09',100,  0],
  ['A10','Sector A10',100,  0],['A11','Sector A11',100,  0],
  // Fila B
  ['B01','Sector B01',100,100],['B02','Sector B02',100,100],['B03','Sector B03',100,100],
  ['B04','Sector B04',100,100],['B05','Sector B05',100,100],['B06','Sector B06',100,  0],
  ['B07','Sector B07',100,  0],['B08','Sector B08',100,  0],['B09','Sector B09',100,  0],
  // Fila C
  ['C01','Sector C01', 48, 48],['C02','Sector C02', 48, 48],['C03','Sector C03', 48, 34],
  ['C04','Sector C04', 48,  0],['C05','Sector C05',100,  0],['C06','Sector C06',100,  0],
  ['C07','Sector C07',100,  0],['C08','Sector C08',100,  0],['C09','Sector C09',100,  0],
  // Fila D
  ['D01','Sector D01', 48,  0],['D02','Sector D02', 48,  2],['D03','Sector D03', 48, 37],
  ['D04','Sector D04', 84, 51],['D05','Sector D05', 48,  0],['D06','Sector D06', 48,  0],
  ['D07','Sector D07', 48,  0],['D08','Sector D08',100,  0],['D09','Sector D09', 48,  0],
  // Fila E (solo E08-E10)
  ['E08','Sector E08', 48,  0],['E09','Sector E09', 48,  0],['E10','Sector E10', 48,  0],
  // Fila F
  ['F01','Sector F01', 76, 39],['F02','Sector F02',100, 73],['F03','Sector F03',100,100],
  ['F04','Sector F04',100,  0],['F05','Sector F05',100, 24],['F06','Sector F06',100,  0],
  ['F07','Sector F07', 56, 13],['F08','Sector F08',100,  0],['F09','Sector F09',100, 29],
  ['F10','Sector F10', 56, 56],['F11','Sector F11',100,  0],['F12','Sector F12',100,  0],
  ['F13','Sector F13',100,  0],
  // Fila G
  ['G01','Sector G01',100,  0],['G02','Sector G02',100,  0],['G03','Sector G03', 76, 76],
  ['G04','Sector G04',100,  0],['G05','Sector G05',100,  0],['G06','Sector G06',100, 59],
  ['G07','Sector G07',100,100],['G08','Sector G08',100,100],['G09','Sector G09',100,100],
  ['G10','Sector G10',100,100],['G11','Sector G11',100,100],
  // Fila H
  ['H01','Sector H01',100,  0],['H02','Sector H02',100,  0],['H03','Sector H03',100,  0],
  ['H04','Sector H04',100,  0],['H05','Sector H05',100,  0],['H06','Sector H06', 90,  4],
  ['H07','Sector H07', 76, 20],['H08','Sector H08',100,  0],['H09','Sector H09',100,  0],
  ['H10','Sector H10',100,  0],['H11','Sector H11',100, 21],
  // Fila J
  ['J01','Sector J01',100,  1],['J02','Sector J02',100,  0],['J03','Sector J03', 48, 32],
  ['J04','Sector J04', 60, 60],['J05','Sector J05',100,  0],['J06','Sector J06',100, 46],
  ['J07','Sector J07', 48, 10],['J08','Sector J08',100,  0],['J09','Sector J09',100,  0],
  ['J10','Sector J10',100, 48],['J11','Sector J11', 48,  0],
  // Fila K
  ['K01','Sector K01', 60, 51],['K02','Sector K02',100,  0],['K03','Sector K03',100,  0],
  ['K04','Sector K04',100,  9],['K05','Sector K05',100,  0],['K06','Sector K06',100,  0],
  ['K07','Sector K07',100,  0],['K08','Sector K08',100,  0],['K09','Sector K09', 50,  9],
  ['K10','Sector K10', 76, 76],['K11','Sector K11',100,  0],
  // CrossDocking
  ['W01','CrossDocking W01',100,0],['W02','CrossDocking W02',100,0],['W03','CrossDocking W03',100,0],
  // Cuarentena
  ['Q01','Cuarentena Q01', 10, 3],['Q02','Cuarentena Q02',100, 1],['Q03','Cuarentena Q03',100, 7],
  ['Q04','Cuarentena Q04',100, 7],['Q05','Cuarentena Q05',100, 4],['Q06','Cuarentena Q06',100, 5],
  ['Q07','Cuarentena Q07',100, 3],['Q08','Cuarentena Q08',100,27],['Q09','Cuarentena Q09',100,13],
  ['Q10','Cuarentena Q10',100, 2],['Q11','Cuarentena Q11',100, 1],['Q12','Cuarentena Q12',100, 3],
  ['Q13','Cuarentena Q13',100, 0],['Q14','Cuarentena Q14',100, 0],['Q15','Cuarentena Q15',100, 0],
  // Buffer
  ['ZF01','Buffer ZF01',48,0],['ZF02','Buffer ZF02',48,0],
];

(async () => {
  const conn = await mysql.createConnection(config);
  console.log('✅ Conectado a', config.database);

  await conn.beginTransaction();
  try {
    // Limpiar datos demo (movimientos → pales → sectores, en ese orden por FKs)
    await conn.query('DELETE FROM incidencias');
    await conn.query('DELETE FROM movimientos');
    await conn.query('DELETE FROM pales');
    await conn.query('DELETE FROM sectores');
    await conn.query('ALTER TABLE sectores AUTO_INCREMENT = 1');
    console.log('🗑  Datos demo eliminados');

    // Insertar sectores reales
    for (const [codigo, nombre, cap, occ] of SECTORES) {
      await conn.query(
        'INSERT INTO sectores (codigo, nombre, capacidad_max, ocupacion_actual) VALUES (?,?,?,?)',
        [codigo, nombre, cap, occ]
      );
    }
    console.log(`✅ ${SECTORES.length} sectores insertados`);

    await conn.commit();
    console.log('🎉 Migración de sectores completada.');
  } catch (err) {
    await conn.rollback();
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
})();
