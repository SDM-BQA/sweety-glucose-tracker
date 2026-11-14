// Seeds a demo patient (with a mix of readings over the last ~6 weeks) and
// a demo doctor already assigned to that patient, so a reviewer can log in
// and see populated dashboards/reports without entering any data by hand.
//
// Usage: npm run seed   (reads the same backend/.env as the server)
require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, User, Reading, SLOTS } = require('../src/models');

const SALT_ROUNDS = 10;
const DEMO_PASSWORD = 'demo1234';

function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// A plausible mix: mostly in-range, with a handful of lows/highs so the
// reading list's color-coded chips actually show some variety.
function randomValue() {
  const roll = Math.random();
  if (roll < 0.1) return 50 + Math.floor(Math.random() * 15); // low
  if (roll < 0.75) return 85 + Math.floor(Math.random() * 55); // normal
  if (roll < 0.9) return 145 + Math.floor(Math.random() * 50); // elevated
  return 210 + Math.floor(Math.random() * 90); // high
}

function buildReadings(userId) {
  const rows = [];
  for (let daysAgo = 0; daysAgo <= 45; daysAgo++) {
    if (Math.random() < 0.3) continue; // skip some days, like a real patient would
    const date = isoDaysAgo(daysAgo);
    const slotCount = 1 + Math.floor(Math.random() * 4);
    const slots = [...SLOTS].sort(() => Math.random() - 0.5).slice(0, slotCount);
    for (const slot of slots) {
      rows.push({ userId, date, slot, value: randomValue() });
    }
  }
  return rows;
}

async function upsertUser({ name, email, role }) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
  const [user] = await User.findOrCreate({
    where: { email },
    defaults: { name, email, passwordHash, role },
  });
  return user;
}

async function seed() {
  await sequelize.sync({ alter: true });

  const doctor = await upsertUser({ name: 'Dr. Dana Reyes', email: 'doctor@sweety.app', role: 'doctor' });
  const patient = await upsertUser({ name: 'Jordan Patient', email: 'demo@sweety.app', role: 'patient' });

  if (patient.doctorId !== doctor.id) {
    await patient.update({ doctorId: doctor.id });
  }

  await Reading.destroy({ where: { userId: patient.id } });
  await Reading.bulkCreate(buildReadings(patient.id));

  const total = await Reading.count({ where: { userId: patient.id } });

  console.log('Seed complete.');
  console.log('----------------------------------------');
  console.log(`Patient login:  ${patient.email} / ${DEMO_PASSWORD}  (${total} readings)`);
  console.log(`Doctor login:   ${doctor.email} / ${DEMO_PASSWORD}  (sees "${patient.name}" as a patient)`);
  console.log('----------------------------------------');

  await sequelize.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
