-- ============================================================
-- DATOS INICIALES - WMS Almacén Santander
-- 38 sectores físicos + usuarios demo (4 roles)
-- ============================================================

USE wms_almacen;

-- ------------------------------------------------------------
-- Los 38 sectores del almacén de Santander
-- ------------------------------------------------------------
INSERT INTO sectores (codigo, nombre, capacidad_max) VALUES
  ('A1',  'Sector A1 - Muelle Norte',    60),
  ('A2',  'Sector A2 - Muelle Norte',    60),
  ('A3',  'Sector A3 - Muelle Norte',    60),
  ('A4',  'Sector A4 - Muelle Norte',    60),
  ('A5',  'Sector A5 - Muelle Norte',    60),
  ('A6',  'Sector A6 - Muelle Norte',    60),
  ('B1',  'Sector B1',                   50),
  ('B2',  'Sector B2',                   50),
  ('B3',  'Sector B3',                   50),
  ('B4',  'Sector B4',                   50),
  ('B5',  'Sector B5',                   50),
  ('B6',  'Sector B6',                   50),
  ('C1',  'Sector C1',                   50),
  ('C2',  'Sector C2',                   50),
  ('C3',  'Sector C3',                   50),
  ('C4',  'Sector C4',                   50),
  ('C5',  'Sector C5',                   50),
  ('C6',  'Sector C6',                   50),
  ('D1',  'Sector D1',                   45),
  ('D2',  'Sector D2',                   45),
  ('D3',  'Sector D3',                   45),
  ('D4',  'Sector D4',                   45),
  ('D5',  'Sector D5',                   45),
  ('D6',  'Sector D6',                   45),
  ('E1',  'Sector E1',                   45),
  ('E2',  'Sector E2',                   45),
  ('E3',  'Sector E3',                   45),
  ('E4',  'Sector E4',                   45),
  ('E5',  'Sector E5',                   45),
  ('E6',  'Sector E6',                   45),
  ('F1',  'Sector F1 - Fondo Sur',       40),
  ('F2',  'Sector F2 - Fondo Sur',       40),
  ('F3',  'Sector F3 - Fondo Sur',       40),
  ('F4',  'Sector F4 - Fondo Sur',       40),
  ('F5',  'Sector F5 - Fondo Sur',       40),
  ('F6',  'Sector F6 - Fondo Sur',       40),
  ('ESP1', 'Zona Cuarentena',            20),
  ('ESP2', 'Zona Devoluciones',          20);

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
-- Hash bcrypt generado con bcrypt.hash('Admin2026!', 10)
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
