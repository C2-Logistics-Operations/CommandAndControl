jest.mock('../db', () => ({
  query: jest.fn()
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../index');
const pool = require('../db');

const SECRET = process.env.JWT_SECRET || 'fallback_secret';

describe('Cobertura Completa: Auth, Middleware JWT y Suministros (Express)', () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  test('POST /api/v1/auth/register crea usuario (201), maneja duplicado (409) y error DB (500)', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, username: 'cmd_norte', rol: 'COMANDANTE' }]
    });

    const resOk = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'cmd_norte', password: 'Password123!', rol: 'COMANDANTE' });
    expect(resOk.statusCode).toBe(201);
    expect(resOk.body.username).toBe('cmd_norte');

    const dupErr = new Error('duplicate key');
    dupErr.code = '23505';
    pool.query.mockRejectedValueOnce(dupErr);

    const resDup = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'cmd_norte', password: 'Password123!' });
    expect(resDup.statusCode).toBe(409);

    pool.query.mockRejectedValueOnce(new Error('DB caída'));
    const resErr = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'nuevo', password: 'Password123!' });
    expect(resErr.statusCode).toBe(500);
  });

  test('POST /api/v1/auth/login valida campos (400), usuario inexistente (401), clave errónea (401), éxito (200) y fallo DB (500)', async () => {
    const res400 = await request(app).post('/api/v1/auth/login').send({ username: '', password: '' });
    expect(res400.statusCode).toBe(400);

    pool.query.mockResolvedValueOnce({ rows: [] });
    const resNoUser = await request(app).post('/api/v1/auth/login').send({ username: 'fantasma', password: '123' });
    expect(resNoUser.statusCode).toBe(401);

    const hash = await bcrypt.hash('ClaveReal123', 4);
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 2, username: 'op1', password_hash: hash, rol: 'OPERADOR' }]
    });
    const resBadPass = await request(app).post('/api/v1/auth/login').send({ username: 'op1', password: 'Incorrecta' });
    expect(resBadPass.statusCode).toBe(401);

    pool.query.mockResolvedValueOnce({
      rows: [{ id: 2, username: 'op1', password_hash: hash, rol: 'OPERADOR' }]
    });
    const resOk = await request(app).post('/api/v1/auth/login').send({ username: 'op1', password: 'ClaveReal123' });
    expect(resOk.statusCode).toBe(200);
    expect(resOk.body.token).toBeDefined();

    pool.query.mockRejectedValueOnce(new Error('Timeout PG'));
    const res500 = await request(app).post('/api/v1/auth/login').send({ username: 'op1', password: 'ClaveReal123' });
    expect(res500.statusCode).toBe(500);
  });

  test('GET /api/v1/auth/perfil rechaza token inválido (403) y permite token válido (200)', async () => {
    const resInvalid = await request(app)
      .get('/api/v1/auth/perfil')
      .set('Authorization', 'Bearer token.falso.invalido');
    expect([401, 403]).toContain(resInvalid.statusCode);

    const tokenValido = jwt.sign({ id: 1, username: 'cmd_norte', rol: 'COMANDANTE' }, SECRET, { expiresIn: '1h' });
    const resValid = await request(app)
      .get('/api/v1/auth/perfil')
      .set('Authorization', `Bearer ${tokenValido}`);
    expect(resValid.statusCode).toBe(200);
    expect(resValid.body.usuario.username).toBe('cmd_norte');
  });

  test('CRUD /api/v1/suministros cubre listado, control de rol (403), creación (201/400) y actualización (200/404)', async () => {
    const tokenCmd = jwt.sign({ id: 1, username: 'cmd', rol: 'COMANDANTE' }, SECRET);
    const tokenOp = jwt.sign({ id: 2, username: 'op', rol: 'OPERADOR' }, SECRET);

    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, item: 'Botiquín', categoria: 'MEDICA', stock_disponible: 10 }]
    });
    const resGet = await request(app)
      .get('/api/v1/suministros')
      .set('Authorization', `Bearer ${tokenOp}`);
    expect(resGet.statusCode).toBe(200);
    expect(resGet.body).toHaveLength(1);

    pool.query.mockRejectedValueOnce(new Error('Error lectura'));
    const resGetErr = await request(app)
      .get('/api/v1/suministros')
      .set('Authorization', `Bearer ${tokenOp}`);
    expect(resGetErr.statusCode).toBe(500);

    const res403 = await request(app)
      .post('/api/v1/suministros')
      .set('Authorization', `Bearer ${tokenOp}`)
      .send({ item: 'Radio', categoria: 'COMS', stock_disponible: 5 });
    expect(res403.statusCode).toBe(403);

    const res400 = await request(app)
      .post('/api/v1/suministros')
      .set('Authorization', `Bearer ${tokenCmd}`)
      .send({ item: '', stock_disponible: -1 });
    expect(res400.statusCode).toBe(400);

    pool.query.mockResolvedValueOnce({
      rows: [{ id: 2, item: 'Radio VHF', categoria: 'COMS', stock_disponible: 5 }]
    });
    const resPostOk = await request(app)
      .post('/api/v1/suministros')
      .set('Authorization', `Bearer ${tokenCmd}`)
      .send({ item: 'Radio VHF', categoria: 'COMS', stock_disponible: 5 });
    expect(resPostOk.statusCode).toBe(201);

    pool.query.mockRejectedValueOnce(new Error('Error insert'));
    const resPostErr = await request(app)
      .post('/api/v1/suministros')
      .set('Authorization', `Bearer ${tokenCmd}`)
      .send({ item: 'Radio VHF', categoria: 'COMS', stock_disponible: 5 });
    expect(resPostErr.statusCode).toBe(500);

    pool.query.mockResolvedValueOnce({
      rows: [{ id: 2, item: 'Radio VHF', categoria: 'COMS', stock_disponible: 12 }]
    });
    const resPutOk = await request(app)
      .put('/api/v1/suministros/2')
      .set('Authorization', `Bearer ${tokenCmd}`)
      .send({ item: 'Radio VHF', categoria: 'COMS', stock_disponible: 12 });
    expect(resPutOk.statusCode).toBe(200);

    pool.query.mockResolvedValueOnce({ rows: [] });
    const resPut404 = await request(app)
      .put('/api/v1/suministros/999')
      .set('Authorization', `Bearer ${tokenCmd}`)
      .send({ item: 'X', categoria: 'Y', stock_disponible: 1 });
    expect(resPut404.statusCode).toBe(404);

    pool.query.mockRejectedValueOnce(new Error('Error update'));
    const resPut500 = await request(app)
      .put('/api/v1/suministros/2')
      .set('Authorization', `Bearer ${tokenCmd}`)
      .send({ item: 'X', categoria: 'Y', stock_disponible: 1 });
    expect(resPut500.statusCode).toBe(500);
  });
});
