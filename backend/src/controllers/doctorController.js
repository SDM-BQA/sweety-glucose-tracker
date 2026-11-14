const { User } = require('../models');
const { parseSelectedDate } = require('./reportController');
const { buildReport, dailyRange, monthToDateRange, previousMonthRange } = require('../services/reportService');

function publicDoctor(doctor) {
  return { id: doctor.id, name: doctor.name, email: doctor.email };
}

async function getMyDoctor(req, res) {
  const me = await User.findByPk(req.user.id, { include: { association: 'doctor' } });
  res.json({ doctor: me.doctor ? publicDoctor(me.doctor) : null });
}

async function assignMyDoctor(req, res) {
  const { doctorEmail } = req.body;
  if (!doctorEmail || !String(doctorEmail).trim()) {
    return res.status(400).json({ message: "Please enter your doctor's email." });
  }

  const doctor = await User.findOne({
    where: { email: String(doctorEmail).toLowerCase(), role: 'doctor' },
  });
  if (!doctor) {
    return res.status(404).json({ message: 'No doctor account was found with that email.' });
  }
  if (doctor.id === req.user.id) {
    return res.status(400).json({ message: 'You cannot assign yourself as your own doctor.' });
  }

  await User.update({ doctorId: doctor.id }, { where: { id: req.user.id } });
  res.json({ doctor: publicDoctor(doctor) });
}

async function unassignMyDoctor(req, res) {
  await User.update({ doctorId: null }, { where: { id: req.user.id } });
  res.status(204).send();
}

async function listPatients(req, res) {
  const patients = await User.findAll({
    where: { doctorId: req.user.id },
    attributes: ['id', 'name', 'email'],
    order: [['name', 'ASC']],
  });
  res.json({ data: patients });
}

async function findOwnPatient(req, res) {
  const patient = await User.findOne({
    where: { id: req.params.patientId, doctorId: req.user.id },
  });
  if (!patient) {
    res.status(404).json({ message: 'Patient not found.' });
    return null;
  }
  return patient;
}

async function patientDaily(req, res) {
  const patient = await findOwnPatient(req, res);
  if (!patient) return;
  const date = parseSelectedDate(req, res);
  if (!date) return;
  res.json(await buildReport(patient.id, dailyRange(date)));
}

async function patientMonthToDate(req, res) {
  const patient = await findOwnPatient(req, res);
  if (!patient) return;
  const date = parseSelectedDate(req, res);
  if (!date) return;
  res.json(await buildReport(patient.id, monthToDateRange(date)));
}

async function patientMonthly(req, res) {
  const patient = await findOwnPatient(req, res);
  if (!patient) return;
  const date = parseSelectedDate(req, res);
  if (!date) return;
  res.json(await buildReport(patient.id, previousMonthRange(date)));
}

module.exports = {
  getMyDoctor,
  assignMyDoctor,
  unassignMyDoctor,
  listPatients,
  patientDaily,
  patientMonthToDate,
  patientMonthly,
};
