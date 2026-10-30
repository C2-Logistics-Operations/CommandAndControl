const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'c2_db'
});

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(20) DEFAULT 'OPERADOR',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    if (process.env.NODE_ENV !== 'test') {
      console.log('[C2 DB] Esquema verificado / creado correctamente');
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[C2 DB Error] Fallo al verificar esquema:', err.message);
    }
  }
};

initDb();

module.exports = pool;