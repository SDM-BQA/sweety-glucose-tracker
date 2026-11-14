const { Op } = require('sequelize');
const { Reading } = require('../models');
const { isValidDateString, todayDateOnly } = require('../utils/validation');
const { dailyRange, monthToDateRange, previousMonthRange } = require('../utils/dateUtils');

function summarize(readings) {
  if (readings.length === 0) {
    return { count: 0, highest: null, lowest: null, average: null };
  }
  const values = readings.map((r) => r.value);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const average = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  return { count: values.length, highest, lowest, average };
}

function parseSelectedDate(req, res) {
  const date = req.query.date || todayDateOnly();
  if (!isValidDateString(date)) {
    res.status(400).json({ message: 'Please provide a valid date.' });
    return null;
  }
  return date;
}

async function fetchReadingsInRange(userId, start, end) {
  return Reading.findAll({
    where: { userId, date: { [Op.gte]: start, [Op.lte]: end } },
    order: [['date', 'ASC'], ['slot', 'ASC']],
  });
}

async function daily(req, res) {
  const date = parseSelectedDate(req, res);
  if (!date) return;
  const { start, end } = dailyRange(date);
  const readings = await fetchReadingsInRange(req.user.id, start, end);
  res.json({ range: { start, end }, summary: summarize(readings), readings });
}

async function monthToDate(req, res) {
  const date = parseSelectedDate(req, res);
  if (!date) return;
  const { start, end } = monthToDateRange(date);
  const readings = await fetchReadingsInRange(req.user.id, start, end);
  res.json({ range: { start, end }, summary: summarize(readings), readings });
}

async function monthly(req, res) {
  const date = parseSelectedDate(req, res);
  if (!date) return;
  const { start, end } = previousMonthRange(date);
  const readings = await fetchReadingsInRange(req.user.id, start, end);
  res.json({ range: { start, end }, summary: summarize(readings), readings });
}

module.exports = { daily, monthToDate, monthly };
