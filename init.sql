-- =============================================================================
-- ESQUEMA BASE DE DATOS: C2 LOGISTICS & OPS
-- =============================================================================

-- 1. TABLA: usuarios (Autenticación y Roles)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('COMANDANTE', 'OPERADOR')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: misiones (Datos de la operación)
CREATE TABLE IF NOT EXISTS misiones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    rango_peligro VARCHAR(20) NOT NULL CHECK (rango_peligro IN ('BAJO', 'MEDIO', 'CRITICO')),
    estado VARCHAR(20) NOT NULL DEFAULT 'PLANIFICACION' 
        CHECK (estado IN ('PLANIFICACION', 'HOLD', 'READY', 'EN_CURSO', 'CONCLUIDA')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: escuadrones (Relación 1:N con Misiones)
CREATE TABLE IF NOT EXISTS escuadrones (
    id SERIAL PRIMARY KEY,
    nombre_codigo VARCHAR(50) NOT NULL,
    especialidad VARCHAR(50) NOT NULL,
    mision_id INT NULL,
    CONSTRAINT fk_escuadron_mision 
        FOREIGN KEY (mision_id) 
        REFERENCES misiones(id) 
        ON DELETE SET NULL
);

-- 4. TABLA: suministros (Arsenal e Inventario General)
CREATE TABLE IF NOT EXISTS suministros (
    id SERIAL PRIMARY KEY,
    item VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('ARMAMENTO', 'ALIMENTO', 'EQUIPAMIENTO')),
    stock_disponible INT NOT NULL CHECK (stock_disponible >= 0)
);

-- 5. TABLA INTERMEDIA: manifiesto_mision (Relación N:M Misiones <-> Suministros)
CREATE TABLE IF NOT EXISTS manifiesto_mision (
    mision_id INT NOT NULL,
    suministro_id INT NOT NULL,
    cantidad_requerida INT NOT NULL CHECK (cantidad_requerida > 0),
    PRIMARY KEY (mision_id, suministro_id),
    CONSTRAINT fk_manifiesto_mision 
        FOREIGN KEY (mision_id) 
        REFERENCES misiones(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_manifiesto_suministro 
        FOREIGN KEY (suministro_id) 
        REFERENCES suministros(id) 
        ON DELETE RESTRICT
);

-- =============================================================================
-- DATOS SEMILLA (SEED DATA) PARA PRUEBAS DE DEFENSA
-- =============================================================================

INSERT INTO suministros (item, categoria, stock_disponible) VALUES
('Fusil M4A1', 'ARMAMENTO', 50),
('Ración MRE', 'ALIMENTO', 200),
('Visor Nocturno NVG', 'EQUIPAMIENTO', 15);

INSERT INTO misiones (nombre, rango_peligro, estado) VALUES
('Operación Tormenta de Arena', 'CRITICO', 'PLANIFICACION');

INSERT INTO escuadrones (nombre_codigo, especialidad, mision_id) VALUES
('Alfa-6', 'Asalto', 1);