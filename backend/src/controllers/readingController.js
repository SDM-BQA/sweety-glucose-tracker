const { Op } = require('sequelize');
const { Reading } = require('../models');
const { validateReadingInput, SLOT_LABELS } = require('../utils/validation');

const MAX_READINGS_PER_DAY = 4;

async function list(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const { count, rows } = await Reading.findAndCountAll({
    where: { userId: req.user.id },
    order: [['date', 'DESC'], ['slot', 'ASC']],
    limit,
    offset: (page - 1) * limit,
  });

  res.json({
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) || 1 },
  });
}

async function create(req, res) {
  const { date, slot } = req.body;
  const errors = validateReadingInput(req.body);
  if (errors.length) {
    return res.status(400).json({ message: errors[0].message, errors });
  }

  const sameDay = await Reading.findAll({ where: { userId: req.user.id, date } });

  if (sameDay.some((r) => r.slot === slot)) {
    return res.status(409).json({
      message: `You already have an ${SLOT_LABELS[slot]} reading for this date.`,
    });
  }

  if (sameDay.length >= MAX_READINGS_PER_DAY) {
    return res.status(409).json({ message: 'You can add only 4 readings per day.' });
  }

  const reading = await Reading.create({
    userId: req.user.id,
    date,
    slot,
    value: Number(req.body.value),
  });

  res.status(201).json({ data: reading });
}

async function update(req, res) {
  const reading = await Reading.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!reading) {
    return res.status(404).json({ message: 'Reading not found.' });
  }

  const { date, slot } = req.body;
  const errors = validateReadingInput(req.body);
  if (errors.length) {
    return res.status(400).json({ message: errors[0].message, errors });
  }

  const conflict = await Reading.findOne({
    where: { userId: req.user.id, date, slot, id: { [Op.ne]: reading.id } },
  });
  if (conflict) {
    return res.status(409).json({
      message: `You already have an ${SLOT_LABELS[slot]} reading for this date.`,
    });
  }

  reading.date = date;
  reading.slot = slot;
  reading.value = Number(req.body.value);
  await reading.save();

  res.json({ data: reading });
}

async function remove(req, res) {
  const reading = await Reading.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!reading) {
    return res.status(404).json({ message: 'Reading not found.' });
  }
  await reading.destroy();
  res.status(204).send();
}

module.exports = { list, create, update, remove };
