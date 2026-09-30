const express = require('express');
const router = express.Router();
const pool = require('../db');
const { autenticarJWT, verificarRol } = require('../middleware/auth');

// GET /api/v1/suministros - Listar inventario (Operador y Comandante)
router.get('/', autenticarJWT, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suministros ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener inventario', detalle: error.message });
  }
});

// POST /api/v1/suministros - Crear suministro (Solo Comandante)
router.post('/', autenticarJWT, verificarRol('COMANDANTE'), async (req, res) => {
  const { item, categoria, stock_disponible } = req.body;

  if (!item || !categoria || stock_disponible === undefined || stock_disponible < 0) {
    return res.status(400).json({ error: 'Campos inválidos o stock menor a 0.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO suministros (item, categoria, stock_disponible) VALUES ($1, $2, $3) RETURNING *',
      [item, categoria, stock_disponible]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar suministro', detalle: error.message });
  }
});

// PUT /api/v1/suministros/:id - Actualizar stock/item (Solo Comandante)
router.put('/:id', autenticarJWT, verificarRol('COMANDANTE'), async (req, res) => {
  const { id } = req.params;
  const { item, categoria, stock_disponible } = req.body;

  try {
    const result = await pool.query(
      'UPDATE suministros SET item = $1, categoria = $2, stock_disponible = $3 WHERE id = $4 RETURNING *',
      [item, categoria, stock_disponible, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Suministro no encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar suministro', detalle: error.message });
  }
});

module.exports = router;