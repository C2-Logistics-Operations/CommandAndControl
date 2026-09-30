const express = require('express');
const router = express.Router();
const pool = require('../db');
const { autenticarJWT, verificarRol } = require('../middleware/auth');

// GET /api/v1/escuadrones
router.get('/', autenticarJWT, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM escuadrones ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener escuadrones', detalle: error.message });
  }
});

// POST /api/v1/escuadrones - Crear escuadrón
router.post('/', autenticarJWT, verificarRol('COMANDANTE'), async (req, res) => {
  const { nombre_codigo, especialidad, mision_id } = req.body;

  if (!nombre_codigo || !especialidad) {
    return res.status(400).json({ error: 'Nombre código y especialidad requeridos.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO escuadrones (nombre_codigo, especialidad, mision_id) VALUES ($1, $2, $3) RETURNING *',
      [nombre_codigo, especialidad, mision_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar escuadrón', detalle: error.message });
  }
});

module.exports = router;