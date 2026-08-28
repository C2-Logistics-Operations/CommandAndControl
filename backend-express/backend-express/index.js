const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint de Health Check
app.get('/api/v1/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'UP',
      message: 'Conexión exitosa a la Base de Datos C2',
      database_time: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      message: 'Fallo al conectar con la Base de Datos C2',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`[C2 BACKEND-A] Servidor activo en http://localhost:${PORT}`);
});
