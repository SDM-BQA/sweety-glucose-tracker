// All helpers work with plain 'YYYY-MM-DD' strings to avoid timezone
// surprises, since Reading.date is stored as DATEONLY.

function pad(n) {
  return String(n).padStart(2, '0');
}

function toDateString(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function parseDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

// Daily report: just the selected date, for both start and end.
function dailyRange(dateStr) {
  return { start: dateStr, end: dateStr };
}

// Month-to-date: 1st of the selected date's month through the selected date.
function monthToDateRange(dateStr) {
  const { year, month } = parseDateString(dateStr);
  return { start: toDateString(year, month, 1), end: dateStr };
}

// Monthly: the whole calendar month before the selected date's month.
function previousMonthRange(dateStr) {
  const { year, month } = parseDateString(dateStr);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return {
    start: toDateString(prevYear, prevMonth, 1),
    end: toDateString(prevYear, prevMonth, daysInMonth(prevYear, prevMonth)),
  };
}

module.exports = { dailyRange, monthToDateRange, previousMonthRange };
