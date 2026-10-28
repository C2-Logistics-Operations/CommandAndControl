const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'c2user',
  password: process.env.DB_PASSWORD || 'c2pass',
  database: process.env.DB_NAME || 'c2db'
});

// Auto-inicialización del esquema de base de datos
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(20) NOT NULL CHECK (rol IN ('COMANDANTE', 'OPERADOR')),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[C2 DB] Esquema verificado / creado correctamente');
  } catch (err) {
    console.error('[C2 DB Error] Fallo al verificar esquema:', err.message);
  }
};

initDb();

module.exports = pool;