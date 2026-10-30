const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { autenticarJWT } = require('../middleware/auth');
require('dotenv').config();

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, rol } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (username, password_hash, rol) VALUES ($1, $2, $3) RETURNING id, username, rol',
      [username, hashedPassword, rol || 'OPERADOR']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Código 23505 de PostgreSQL: unique_violation (usuario ya existe)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El nombre de usuario ya está registrado' });
    }
    console.error('[Auth Error]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Debe ingresar username y password.' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales Inválidas.' });
    }

    const usuario = result.rows[0];

    // Comparar la clave ingresada contra el hash guardado
    const esPasswordCorrecta = await bcrypt.compare(password, usuario.password_hash);
    if (!esPasswordCorrecta) {
      return res.status(401).json({ error: 'Credenciales Inválidas.' });
    }

    // Firmar el Token JWT
    const payload = { id: usuario.id, username: usuario.username, rol: usuario.rol };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({
      mensaje: 'Autenticación exitosa',
      token,
      usuario: payload
    });
  } catch (error) {
    res.status(500).json({ error: 'Error durante la autenticación', detalle: error.message });
  }
});

// GET /api/v1/auth/perfil (Ruta protegida para pruebas de token)
router.get('/perfil', autenticarJWT, (req, res) => {
  res.status(200).json({
    mensaje: 'Acceso autorizado al perfil táctico',
    usuario: req.usuario
  });
});

module.exports = router;