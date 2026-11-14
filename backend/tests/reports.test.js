const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

let token;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Meera Joshi', email: 'meera@example.com', password: 'secret123' });
  token = res.body.token;

  const seed = [
    { date: '2026-10-15', slot: 'morning', value: 90 },
    { date: '2026-10-15', slot: 'after_breakfast', value: 110 },
    { date: '2026-10-01', slot: 'morning', value: 100 },
    { date: '2026-09-10', slot: 'morning', value: 80 },
    { date: '2026-09-20', slot: 'after_lunch', value: 160 },
  ];
  for (const r of seed) {
    await request(app).post('/api/readings').set('Authorization', `Bearer ${token}`).send(r);
  }
});

afterAll(async () => {
  await sequelize.close();
});

describe('reports', () => {
  test('daily report summarizes only the selected date', async () => {
    const res = await request(app)
      .get('/api/reports/daily?date=2026-10-15')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.range).toEqual({ start: '2026-10-15', end: '2026-10-15' });
    expect(res.body.summary).toEqual({ count: 2, highest: 110, lowest: 90, average: 100 });
    expect(res.body.readings).toHaveLength(2);
  });

  test('month-to-date report spans 1st of month through selected date', async () => {
    const res = await request(app)
      .get('/api/reports/month-to-date?date=2026-10-15')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.range).toEqual({ start: '2026-10-01', end: '2026-10-15' });
    expect(res.body.summary.count).toBe(3);
  });

  test('monthly report covers the whole previous calendar month', async () => {
    const res = await request(app)
      .get('/api/reports/monthly?date=2026-10-15')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.range).toEqual({ start: '2026-09-01', end: '2026-09-30' });
    expect(res.body.summary.count).toBe(2);
    expect(res.body.summary.average).toBe(120);
  });

  test('returns a friendly empty state when there are no readings', async () => {
    const res = await request(app)
      .get('/api/reports/daily?date=2020-01-01')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.summary).toEqual({ count: 0, highest: null, lowest: null, average: null });
  });
});
