const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

describe('Suite de Pruebas: Autenticación Express (Backend A)', () => {
  it('Debe rechazar el registro con datos incompletos (HTTP 400)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'tactico_test' }); // Falta clave y rol

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('Debe rechazar el registro con un rol no permitido (HTTP 400)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'tactico_test', password: 'password123', rol: 'INFILTRADO' });

    expect(res.statusCode).toEqual(400);
  });

  it('Debe denegar el acceso a /perfil sin token Authorization (HTTP 401)', async () => {
    const res = await request(app).get('/api/v1/auth/perfil');
    expect(res.statusCode).toEqual(401);
  });
});