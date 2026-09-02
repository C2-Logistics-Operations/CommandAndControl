const express = require('express');
const router = express.Router();
const pool = require('../db');
const { autenticarJWT, verificarRol } = require('../middleware/auth');

// Función auxiliar de negocio: Evalúa y actualiza estado de la misión segun el stock
const evaluarEstadoMision = async (misionId) => {
  // Consulta los requerimientos del manifiesto cruzados con el stock real disponible
  const query = `
    SELECT mm.cantidad_requerida, s.stock_disponible 
    FROM manifiesto_mision mm
    JOIN suministros s ON mm.suministro_id = s.id
    WHERE mm.mision_id = $1
  `;
  const result = await pool.query(query, [misionId]);
  const requerimientos = result.rows;

  if (requerimientos.length === 0) {
    // Sin suministros asignados permanece en PLANIFICACION
    await pool.query("UPDATE misiones SET estado = 'PLANIFICACION' WHERE id = $1", [misionId]);
    return 'PLANIFICACION';
  }

  // Verifica si algún ítem no tiene stock suficiente
  const faltante = requerimientos.some(req => req.stock_disponible < req.cantidad_requerida);
  const nuevoEstado = faltante ? 'HOLD' : 'READY';

  await pool.query('UPDATE misiones SET estado = $1 WHERE id = $2', [nuevoEstado, misionId]);
  return nuevoEstado;
};

// GET /api/v1/misiones - Listar todas las misiones
router.get('/', autenticarJWT, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM misiones ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener misiones', detalle: error.message });
  }
});

// POST /api/v1/misiones - Crear misión (Solo Comandante)
router.post('/', autenticarJWT, verificarRol('COMANDANTE'), async (req, res) => {
  const { nombre, rango_peligro } = req.body;

  if (!nombre || !['BAJO', 'MEDIO', 'CRITICO'].includes(rango_peligro)) {
    return res.status(400).json({ error: 'Nombre o rango de peligro inválido.' });
  }

  try {
    const result = await pool.query(
      "INSERT INTO misiones (nombre, rango_peligro, estado) VALUES ($1, $2, 'PLANIFICACION') RETURNING *",
      [nombre, rango_peligro]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear misión', detalle: error.message });
  }
});

// POST /api/v1/misiones/:id/manifiesto - Asignar/Actualizar suministro a la misión
router.post('/:id/manifiesto', autenticarJWT, verificarRol('COMANDANTE'), async (req, res) => {
  const { id } = req.params;
  const { suministro_id, cantidad_requerida } = req.body;

  if (!suministro_id || !cantidad_requerida || cantidad_requerida <= 0) {
    return res.status(400).json({ error: 'Suministro o cantidad requerida no válida.' });
  }

  try {
    // Insertar o actualizar la cantidad requerida en el manifiesto
    await pool.query(
      `INSERT INTO manifiesto_mision (mision_id, suministro_id, cantidad_requerida)
       VALUES ($1, $2, $3)
       ON CONFLICT (mision_id, suministro_id) 
       DO UPDATE SET cantidad_requerida = EXCLUDED.cantidad_requerida`,
      [id, suministro_id, cantidad_requerida]
    );

    // Disparar la regla de negocio
    const estadoCalculado = await evaluarEstadoMision(id);

    res.status(200).json({
      mensaje: 'Manifiesto actualizado correctamente',
      mision_id: id,
      nuevo_estado: estadoCalculado
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar manifiesto', detalle: error.message });
  }
});

module.exports = router;