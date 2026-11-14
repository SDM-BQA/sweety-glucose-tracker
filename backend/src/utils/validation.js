const { SLOTS } = require('../models/reading');

const SLOT_LABELS = {
  morning: 'Morning',
  after_breakfast: 'After breakfast',
  after_lunch: 'After lunch',
  after_dinner: 'After dinner',
};

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

function isValidDateString(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

// Validates the fields of a reading payload. Returns an array of
// { field, message } errors; an empty array means the payload is valid.
function validateReadingInput({ date, slot, value }) {
  const errors = [];

  if (!isValidDateString(date)) {
    errors.push({ field: 'date', message: 'Please provide a valid date.' });
  } else if (date > todayDateOnly()) {
    errors.push({ field: 'date', message: 'Date cannot be in the future.' });
  }

  if (!SLOTS.includes(slot)) {
    errors.push({ field: 'slot', message: 'Please choose a valid time slot.' });
  }

  if (value === undefined || value === null || value === '') {
    errors.push({ field: 'value', message: 'Please enter a glucose value.' });
  } else {
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric < 40 || numeric > 600) {
      errors.push({ field: 'value', message: 'Value must be between 40 and 600 mg/dl.' });
    }
  }

  return errors;
}

module.exports = { validateReadingInput, isValidDateString, todayDateOnly, SLOT_LABELS };
