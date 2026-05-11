-- ============================================================
-- WMS Almacén Santander - Sistema Gestión James Hardie
-- Schema MySQL - Motor InnoDB (ACID + Row-Level Locking)
-- TFG: Mario Del Río Merino - Ingeniería Informática
-- ============================================================

CREATE DATABASE IF NOT EXISTS wms_almacen
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wms_almacen;

-- ------------------------------------------------------------
-- Tabla: usuarios
-- Gestiona los roles: operario y administrador
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  rol         ENUM('visualizador','operario','gerente','administrador') NOT NULL DEFAULT 'operario',
  activo      TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: sectores
-- Los 38 segmentos físicos del almacén a nivel de suelo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sectores (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  codigo          VARCHAR(10) NOT NULL UNIQUE,  -- Ej: A1, B3, C12...
  nombre          VARCHAR(50) NOT NULL,
  capacidad_max   INT NOT NULL DEFAULT 50,      -- Palés máximos por sector
  ocupacion_actual INT NOT NULL DEFAULT 0,
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  notas           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_ocupacion CHECK (ocupacion_actual >= 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: mercancia (tipos de producto de James Hardie)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mercancia (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  codigo      VARCHAR(50) NOT NULL UNIQUE,     -- Código referencia producto
  descripcion VARCHAR(200) NOT NULL,
  tipo        ENUM('bolsas','fardos','ladrillos','pizarras','otros') NOT NULL DEFAULT 'otros',
  peso_kg     DECIMAL(8,2),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: pales
-- Unidad atómica de manipulación en el almacén
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pales (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  codigo_ref      VARCHAR(50) NOT NULL UNIQUE,   -- Código único del palé: JH-XXXX-X
  mercancia_id    INT,
  sector_id       INT,                            -- NULL si expedido
  estado          ENUM('recepcionado','emplazado','en_reubicacion','en_preparacion','expedido') NOT NULL DEFAULT 'recepcionado',
  fecha_entrada   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_salida    TIMESTAMP NULL,
  notas           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mercancia_id) REFERENCES mercancia(id) ON DELETE SET NULL,
  FOREIGN KEY (sector_id)    REFERENCES sectores(id)  ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: movimientos
-- Registro histórico COMPLETO de todas las operaciones
-- Equivalente al histórico de MS Access migrado
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movimientos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  pale_id         INT NOT NULL,
  usuario_id      INT NOT NULL,
  tipo            ENUM('entrada','salida','reubicacion','ajuste') NOT NULL,
  sector_origen   INT NULL,   -- FK a sectores (NULL en primera entrada)
  sector_destino  INT NULL,   -- FK a sectores (NULL en salida)
  fecha_hora      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notas           TEXT,
  FOREIGN KEY (pale_id)       REFERENCES pales(id)    ON DELETE CASCADE,
  FOREIGN KEY (usuario_id)    REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (sector_origen) REFERENCES sectores(id) ON DELETE SET NULL,
  FOREIGN KEY (sector_destino)REFERENCES sectores(id) ON DELETE SET NULL,
  INDEX idx_movimientos_fecha (fecha_hora),
  INDEX idx_movimientos_tipo  (tipo),
  INDEX idx_movimientos_pale  (pale_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: incidencias (UC-08)
-- Registro de incidencias operativas sobre palés
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidencias (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  pale_id           INT NOT NULL,
  usuario_id        INT NOT NULL,
  descripcion       TEXT NOT NULL,
  tipo              ENUM('daño','perdida','error_registro','otro') NOT NULL DEFAULT 'otro',
  estado            ENUM('abierta','resuelta') NOT NULL DEFAULT 'abierta',
  resuelto_por      INT NULL,
  fecha_creacion    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_resolucion  TIMESTAMP NULL,
  notas_resolucion  TEXT,
  FOREIGN KEY (pale_id)      REFERENCES pales(id)    ON DELETE CASCADE,
  FOREIGN KEY (usuario_id)   REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (resuelto_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_incidencias_pale   (pale_id),
  INDEX idx_incidencias_estado (estado)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: migracion_access (para el proceso ETL desde MS Access)
-- Almacena los datos brutos importados antes de normalizar
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS migracion_access (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  datos_raw       JSON,                          -- Fila original del Access
  procesado       TINYINT(1) DEFAULT 0,
  error           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- PROCEDIMIENTOS ALMACENADOS - Lógica de negocio transaccional
-- ============================================================

DELIMITER $$

-- Registrar entrada de palé con control de concurrencia
CREATE PROCEDURE sp_entrada_pale(
  IN p_codigo_ref    VARCHAR(50),
  IN p_sector_id     INT,
  IN p_mercancia_id  INT,
  IN p_usuario_id    INT,
  IN p_notas         TEXT,
  OUT p_resultado    VARCHAR(100)
)
BEGIN
  DECLARE v_ocupacion  INT;
  DECLARE v_capacidad  INT;
  DECLARE v_pale_id    INT;

  -- Bloqueo a nivel de fila para control de concurrencia
  SELECT ocupacion_actual, capacidad_max
    INTO v_ocupacion, v_capacidad
    FROM sectores
   WHERE id = p_sector_id
     AND activo = 1
   FOR UPDATE;

  IF v_ocupacion >= v_capacidad THEN
    SET p_resultado = 'ERROR: Capacidad máxima del sector superada';
    ROLLBACK;
  ELSE
    INSERT INTO pales (codigo_ref, mercancia_id, sector_id, estado)
    VALUES (p_codigo_ref, p_mercancia_id, p_sector_id, 'emplazado');

    SET v_pale_id = LAST_INSERT_ID();

    UPDATE sectores
       SET ocupacion_actual = ocupacion_actual + 1
     WHERE id = p_sector_id;

    INSERT INTO movimientos (pale_id, usuario_id, tipo, sector_destino, notas)
    VALUES (v_pale_id, p_usuario_id, 'entrada', p_sector_id, p_notas);

    SET p_resultado = 'OK';
    COMMIT;
  END IF;
END$$

-- Registrar salida de palé
CREATE PROCEDURE sp_salida_pale(
  IN p_pale_id    INT,
  IN p_usuario_id INT,
  IN p_notas      TEXT,
  OUT p_resultado VARCHAR(100)
)
BEGIN
  DECLARE v_sector_id INT;

  SELECT sector_id INTO v_sector_id
    FROM pales
   WHERE id = p_pale_id
     AND estado != 'expedido'
   FOR UPDATE;

  IF v_sector_id IS NULL THEN
    SET p_resultado = 'ERROR: Palé no encontrado o ya expedido';
  ELSE
    UPDATE pales
       SET estado = 'expedido', sector_id = NULL, fecha_salida = NOW()
     WHERE id = p_pale_id;

    UPDATE sectores
       SET ocupacion_actual = GREATEST(0, ocupacion_actual - 1)
     WHERE id = v_sector_id;

    INSERT INTO movimientos (pale_id, usuario_id, tipo, sector_origen, notas)
    VALUES (p_pale_id, p_usuario_id, 'salida', v_sector_id, p_notas);

    SET p_resultado = 'OK';
    COMMIT;
  END IF;
END$$

DELIMITER ;
