-- ============================================================
-- DATOS INICIALES - WMS Almacén Santander
-- Sectores reales importados de almacenjh.ubicaciones (26/05/2026)
-- ============================================================

USE wms_almacen;

-- ------------------------------------------------------------
-- Sectores reales del almacén (almacenjh → wms_almacen)
-- Filas A-K (sin I) + CrossDocking W + Cuarentena Q + Buffer ZF
-- ------------------------------------------------------------
INSERT INTO sectores (codigo, nombre, capacidad_max, ocupacion_actual) VALUES
  -- ── FILA A (11 sectores) ──────────────────────────────────
  ('A01','Sector A01',100, 46),
  ('A02','Sector A02',100,100),
  ('A03','Sector A03',100,100),
  ('A04','Sector A04',100, 14),
  ('A05','Sector A05',100,  7),
  ('A06','Sector A06',100, 25),
  ('A07','Sector A07',100,  0),
  ('A08','Sector A08',100,  0),
  ('A09','Sector A09',100,  0),
  ('A10','Sector A10',100,  0),
  ('A11','Sector A11',100,  0),
  -- ── FILA B (9 sectores activos, B10 anulado) ─────────────
  ('B01','Sector B01',100,100),
  ('B02','Sector B02',100,100),
  ('B03','Sector B03',100,100),
  ('B04','Sector B04',100,100),
  ('B05','Sector B05',100,100),
  ('B06','Sector B06',100,  0),
  ('B07','Sector B07',100,  0),
  ('B08','Sector B08',100,  0),
  ('B09','Sector B09',100,  0),
  -- ── FILA C (9 sectores activos, C10 anulado) ─────────────
  ('C01','Sector C01', 48, 48),
  ('C02','Sector C02', 48, 48),
  ('C03','Sector C03', 48, 34),
  ('C04','Sector C04', 48,  0),
  ('C05','Sector C05',100,  0),
  ('C06','Sector C06',100,  0),
  ('C07','Sector C07',100,  0),
  ('C08','Sector C08',100,  0),
  ('C09','Sector C09',100,  0),
  -- ── FILA D (9 sectores activos, D10 anulado) ─────────────
  ('D01','Sector D01', 48,  0),
  ('D02','Sector D02', 48,  2),
  ('D03','Sector D03', 48, 37),
  ('D04','Sector D04', 84, 51),
  ('D05','Sector D05', 48,  0),
  ('D06','Sector D06', 48,  0),
  ('D07','Sector D07', 48,  0),
  ('D08','Sector D08',100,  0),
  ('D09','Sector D09', 48,  0),
  -- ── FILA E (solo E08-E10 activos, E01-E07 anulados) ──────
  ('E08','Sector E08', 48,  0),
  ('E09','Sector E09', 48,  0),
  ('E10','Sector E10', 48,  0),
  -- ── FILA F (13 sectores) ─────────────────────────────────
  ('F01','Sector F01', 76, 39),
  ('F02','Sector F02',100, 73),
  ('F03','Sector F03',100,100),
  ('F04','Sector F04',100,  0),
  ('F05','Sector F05',100, 24),
  ('F06','Sector F06',100,  0),
  ('F07','Sector F07', 56, 13),
  ('F08','Sector F08',100,  0),
  ('F09','Sector F09',100, 29),
  ('F10','Sector F10', 56, 56),
  ('F11','Sector F11',100,  0),
  ('F12','Sector F12',100,  0),
  ('F13','Sector F13',100,  0),
  -- ── FILA G (11 sectores) ─────────────────────────────────
  ('G01','Sector G01',100,  0),
  ('G02','Sector G02',100,  0),
  ('G03','Sector G03', 76, 76),
  ('G04','Sector G04',100,  0),
  ('G05','Sector G05',100,  0),
  ('G06','Sector G06',100, 59),
  ('G07','Sector G07',100,100),
  ('G08','Sector G08',100,100),
  ('G09','Sector G09',100,100),
  ('G10','Sector G10',100,100),
  ('G11','Sector G11',100,100),
  -- ── FILA H (11 sectores) ─────────────────────────────────
  ('H01','Sector H01',100,  0),
  ('H02','Sector H02',100,  0),
  ('H03','Sector H03',100,  0),
  ('H04','Sector H04',100,  0),
  ('H05','Sector H05',100,  0),
  ('H06','Sector H06', 90,  4),
  ('H07','Sector H07', 76, 20),
  ('H08','Sector H08',100,  0),
  ('H09','Sector H09',100,  0),
  ('H10','Sector H10',100,  0),
  ('H11','Sector H11',100, 21),
  -- ── FILA J (11 sectores) ─────────────────────────────────
  ('J01','Sector J01',100,  1),
  ('J02','Sector J02',100,  0),
  ('J03','Sector J03', 48, 32),
  ('J04','Sector J04', 60, 60),
  ('J05','Sector J05',100,  0),
  ('J06','Sector J06',100, 46),
  ('J07','Sector J07', 48, 10),
  ('J08','Sector J08',100,  0),
  ('J09','Sector J09',100,  0),
  ('J10','Sector J10',100, 48),
  ('J11','Sector J11', 48,  0),
  -- ── FILA K (11 sectores) ─────────────────────────────────
  ('K01','Sector K01', 60, 51),
  ('K02','Sector K02',100,  0),
  ('K03','Sector K03',100,  0),
  ('K04','Sector K04',100,  9),
  ('K05','Sector K05',100,  0),
  ('K06','Sector K06',100,  0),
  ('K07','Sector K07',100,  0),
  ('K08','Sector K08',100,  0),
  ('K09','Sector K09', 50,  9),
  ('K10','Sector K10', 76, 76),
  ('K11','Sector K11',100,  0),
  -- ── CROSSDOCKING (W01-W03) ───────────────────────────────
  ('W01','CrossDocking W01',100,  0),
  ('W02','CrossDocking W02',100,  0),
  ('W03','CrossDocking W03',100,  0),
  -- ── CUARENTENA (Q01-Q15) ─────────────────────────────────
  ('Q01','Cuarentena Q01', 10,  3),
  ('Q02','Cuarentena Q02',100,  1),
  ('Q03','Cuarentena Q03',100,  7),
  ('Q04','Cuarentena Q04',100,  7),
  ('Q05','Cuarentena Q05',100,  4),
  ('Q06','Cuarentena Q06',100,  5),
  ('Q07','Cuarentena Q07',100,  3),
  ('Q08','Cuarentena Q08',100, 27),
  ('Q09','Cuarentena Q09',100, 13),
  ('Q10','Cuarentena Q10',100,  2),
  ('Q11','Cuarentena Q11',100,  1),
  ('Q12','Cuarentena Q12',100,  3),
  ('Q13','Cuarentena Q13',100,  0),
  ('Q14','Cuarentena Q14',100,  0),
  ('Q15','Cuarentena Q15',100,  0),
  -- ── BUFFER (ZF01-ZF02) ───────────────────────────────────
  ('ZF01','Buffer ZF01', 48,  0),
  ('ZF02','Buffer ZF02', 48,  0);

-- ------------------------------------------------------------
-- Mercancías de James Hardie
-- ------------------------------------------------------------
INSERT INTO mercancia (codigo, descripcion, tipo, peso_kg) VALUES
  ('JH-PIZARRA-STD',   'Pizarras Ensacadas Estándar',       'pizarras', 25.0),
  ('JH-PIZARRA-XL',    'Pizarras Grandes Formato XL',       'pizarras', 35.0),
  ('JH-LADRILLO-A',    'Ladrillos Clase A - Construcción',  'ladrillos', 20.0),
  ('JH-LADRILLO-B',    'Ladrillos Clase B - Revestimiento', 'ladrillos', 18.5),
  ('JH-BOLSA-ARENA',   'Bolsas de Arena Fina',              'bolsas',    30.0),
  ('JH-BOLSA-CEMENTO', 'Bolsas de Cemento Portland',        'bolsas',    25.0),
  ('JH-FARDO-LANA',    'Fardos Lana Mineral Aislante',      'fardos',    15.0),
  ('JH-FARDO-FIBRA',   'Fardos Fibra de Vidrio Comprimida', 'fardos',    12.0),
  ('JH-MISC-01',       'Materiales Varios Ferretería',      'otros',     10.0);

-- ------------------------------------------------------------
-- Usuarios demo - 4 roles (Password: Admin2026!)
-- ------------------------------------------------------------
INSERT INTO usuarios (nombre, email, password, rol) VALUES
  ('Administrador ISS',  'admin@almacen.com',
   '$2a$10$D40I16CdkglsXL7U1pfq0uEqc0xybN1zivUY13Z4OaKsqPZ3lEaci',
   'administrador'),
  ('Operario Almacén',   'operario@almacen.com',
   '$2a$10$D40I16CdkglsXL7U1pfq0uEqc0xybN1zivUY13Z4OaKsqPZ3lEaci',
   'operario'),
  ('Gerente Logística',  'gerente@almacen.com',
   '$2a$10$D40I16CdkglsXL7U1pfq0uEqc0xybN1zivUY13Z4OaKsqPZ3lEaci',
   'gerente'),
  ('Visualizador Demo',  'viewer@almacen.com',
   '$2a$10$D40I16CdkglsXL7U1pfq0uEqc0xybN1zivUY13Z4OaKsqPZ3lEaci',
   'visualizador');
