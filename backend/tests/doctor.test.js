const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

let doctorToken;
let otherDoctorToken;
let patientToken;
let doctorEmail = 'doc@example.com';

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const doctorRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Dr. House', email: doctorEmail, password: 'secret123', role: 'doctor' });
  doctorToken = doctorRes.body.token;

  const otherDoctorRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Dr. Wilson', email: 'wilson@example.com', password: 'secret123', role: 'doctor' });
  otherDoctorToken = otherDoctorRes.body.token;

  const patientRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Pat Patient', email: 'pat@example.com', password: 'secret123' });
  patientToken = patientRes.body.token;

  await request(app)
    .post('/api/readings')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({ date: '2026-10-05', slot: 'morning', value: 110 });
});

afterAll(async () => {
  await sequelize.close();
});

function authed(req, token) {
  return req.set('Authorization', `Bearer ${token}`);
}

describe('doctor role', () => {
  test('patient registers as a regular patient by default', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Default Role', email: 'default@example.com', password: 'secret123' });
    expect(res.body.user.role).toBe('patient');
  });

  test('rejects an invalid role at registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bad Role', email: 'badrole@example.com', password: 'secret123', role: 'admin' });
    expect(res.status).toBe(400);
  });

  test('patient has no assigned doctor initially', async () => {
    const res = await authed(request(app).get('/api/patients/me/doctor'), patientToken);
    expect(res.status).toBe(200);
    expect(res.body.doctor).toBeNull();
  });

  test('rejects assigning a doctor that does not exist', async () => {
    const res = await authed(request(app).put('/api/patients/me/doctor'), patientToken).send({
      doctorEmail: 'nobody@example.com',
    });
    expect(res.status).toBe(404);
  });

  test('patient assigns a real doctor', async () => {
    const res = await authed(request(app).put('/api/patients/me/doctor'), patientToken).send({
      doctorEmail,
    });
    expect(res.status).toBe(200);
    expect(res.body.doctor.email).toBe(doctorEmail);
  });

  test('doctor sees the patient in their list', async () => {
    const res = await authed(request(app).get('/api/doctor/patients'), doctorToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].email).toBe('pat@example.com');
  });

  test('a different doctor does not see that patient', async () => {
    const res = await authed(request(app).get('/api/doctor/patients'), otherDoctorToken);
    expect(res.body.data).toHaveLength(0);
  });

  test('assigned doctor can view the patient daily report', async () => {
    const patientId = (await authed(request(app).get('/api/doctor/patients'), doctorToken)).body.data[0].id;
    const res = await authed(
      request(app).get(`/api/doctor/patients/${patientId}/reports/daily?date=2026-10-05`),
      doctorToken
    );
    expect(res.status).toBe(200);
    expect(res.body.summary.count).toBe(1);
  });

  test("a non-assigned doctor cannot view the patient's report", async () => {
    const patientId = (await authed(request(app).get('/api/doctor/patients'), doctorToken)).body.data[0].id;
    const res = await authed(
      request(app).get(`/api/doctor/patients/${patientId}/reports/daily`),
      otherDoctorToken
    );
    expect(res.status).toBe(404);
  });

  test('a patient account cannot access doctor-only routes', async () => {
    const res = await authed(request(app).get('/api/doctor/patients'), patientToken);
    expect(res.status).toBe(403);
  });

  test('patient unassigns their doctor', async () => {
    const del = await authed(request(app).delete('/api/patients/me/doctor'), patientToken);
    expect(del.status).toBe(204);

    const check = await authed(request(app).get('/api/patients/me/doctor'), patientToken);
    expect(check.body.doctor).toBeNull();
  });
});
