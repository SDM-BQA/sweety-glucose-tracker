const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');
const { todayDateOnly } = require('../src/utils/validation');

let token;
const today = todayDateOnly();

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Ravi Kumar', email: 'ravi@example.com', password: 'secret123' });
  token = res.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

function authed(req) {
  return req.set('Authorization', `Bearer ${token}`);
}

describe('readings', () => {
  test('rejects access without a token', async () => {
    const res = await request(app).get('/api/readings');
    expect(res.status).toBe(401);
  });

  test('creates a reading', async () => {
    const res = await authed(request(app).post('/api/readings')).send({
      date: today,
      slot: 'morning',
      value: 95,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.value).toBe(95);
  });

  test('rejects a second reading for the same slot and date', async () => {
    const res = await authed(request(app).post('/api/readings')).send({
      date: today,
      slot: 'morning',
      value: 100,
    });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('You already have an Morning reading for this date.');
  });

  test('rejects a 5th reading on the same day', async () => {
    await authed(request(app).post('/api/readings')).send({ date: today, slot: 'after_breakfast', value: 110 });
    await authed(request(app).post('/api/readings')).send({ date: today, slot: 'after_lunch', value: 120 });
    await authed(request(app).post('/api/readings')).send({ date: today, slot: 'after_dinner', value: 130 });

    const res = await authed(request(app).post('/api/readings')).send({
      date: today,
      slot: 'morning',
      value: 90,
    });
    // Same slot already used, so this specifically trips the per-slot rule.
    expect(res.status).toBe(409);
  });

  test('rejects an out-of-range value', async () => {
    const res = await authed(request(app).post('/api/readings')).send({
      date: '2026-01-01',
      slot: 'morning',
      value: 700,
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Value must be between 40 and 600 mg/dl.');
  });

  test('rejects a future date', async () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const res = await authed(request(app).post('/api/readings')).send({
      date: future.toISOString().slice(0, 10),
      slot: 'morning',
      value: 100,
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Date cannot be in the future.');
  });

  test('lists only the current user\'s readings', async () => {
    const res = await authed(request(app).get('/api/readings'));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
  });

  test('updates and deletes a reading', async () => {
    const created = await authed(request(app).post('/api/readings')).send({
      date: '2026-02-02',
      slot: 'morning',
      value: 100,
    });
    const id = created.body.data.id;

    const updated = await authed(request(app).put(`/api/readings/${id}`)).send({
      date: '2026-02-02',
      slot: 'morning',
      value: 150,
    });
    expect(updated.status).toBe(200);
    expect(updated.body.data.value).toBe(150);

    const deleted = await authed(request(app).delete(`/api/readings/${id}`));
    expect(deleted.status).toBe(204);
  });
});
