const { Op } = require('sequelize');
const { Reading } = require('../models');
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

async function fetchReadingsInRange(userId, start, end) {
  return Reading.findAll({
    where: { userId, date: { [Op.gte]: start, [Op.lte]: end } },
    order: [['date', 'ASC'], ['slot', 'ASC']],
  });
}

async function buildReport(userId, { start, end }) {
  const readings = await fetchReadingsInRange(userId, start, end);
  return { range: { start, end }, summary: summarize(readings), readings };
}

module.exports = {
  summarize,
  fetchReadingsInRange,
  buildReport,
  dailyRange,
  monthToDateRange,
  previousMonthRange,
};
