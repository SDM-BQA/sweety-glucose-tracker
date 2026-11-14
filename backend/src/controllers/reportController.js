const { isValidDateString, todayDateOnly } = require('../utils/validation');
const { buildReport, dailyRange, monthToDateRange, previousMonthRange } = require('../services/reportService');

function parseSelectedDate(req, res) {
  const date = req.query.date || todayDateOnly();
  if (!isValidDateString(date)) {
    res.status(400).json({ message: 'Please provide a valid date.' });
    return null;
  }
  return date;
}

async function daily(req, res) {
  const date = parseSelectedDate(req, res);
  if (!date) return;
  res.json(await buildReport(req.user.id, dailyRange(date)));
}

async function monthToDate(req, res) {
  const date = parseSelectedDate(req, res);
  if (!date) return;
  res.json(await buildReport(req.user.id, monthToDateRange(date)));
}

async function monthly(req, res) {
  const date = parseSelectedDate(req, res);
  if (!date) return;
  res.json(await buildReport(req.user.id, previousMonthRange(date)));
}

module.exports = { daily, monthToDate, monthly, parseSelectedDate };
