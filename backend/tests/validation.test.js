const { validateReadingInput, todayDateOnly } = require('../src/utils/validation');

describe('validateReadingInput', () => {
  const validBase = { date: todayDateOnly(), slot: 'morning', value: 100 };

  test('accepts a valid reading', () => {
    expect(validateReadingInput(validBase)).toEqual([]);
  });

  test('requires a value', () => {
    const errors = validateReadingInput({ ...validBase, value: '' });
    expect(errors[0].message).toBe('Please enter a glucose value.');
  });

  test('rejects a value below 40', () => {
    const errors = validateReadingInput({ ...validBase, value: 39 });
    expect(errors[0].message).toBe('Value must be between 40 and 600 mg/dl.');
  });

  test('rejects a value above 600', () => {
    const errors = validateReadingInput({ ...validBase, value: 601 });
    expect(errors[0].message).toBe('Value must be between 40 and 600 mg/dl.');
  });

  test('rejects a non-integer value', () => {
    const errors = validateReadingInput({ ...validBase, value: 100.5 });
    expect(errors[0].message).toBe('Value must be between 40 and 600 mg/dl.');
  });

  test('rejects a future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const errors = validateReadingInput({ ...validBase, date: futureDate.toISOString().slice(0, 10) });
    expect(errors[0].message).toBe('Date cannot be in the future.');
  });

  test('rejects an invalid slot', () => {
    const errors = validateReadingInput({ ...validBase, slot: 'midnight' });
    expect(errors[0].message).toBe('Please choose a valid time slot.');
  });
});
