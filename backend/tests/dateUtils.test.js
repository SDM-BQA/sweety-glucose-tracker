const { dailyRange, monthToDateRange, previousMonthRange } = require('../src/utils/dateUtils');

describe('dateUtils', () => {
  test('dailyRange returns the same date for start and end', () => {
    expect(dailyRange('2026-10-15')).toEqual({ start: '2026-10-15', end: '2026-10-15' });
  });

  test('monthToDateRange spans the 1st of the month to the selected date', () => {
    expect(monthToDateRange('2026-10-15')).toEqual({ start: '2026-10-01', end: '2026-10-15' });
  });

  test('previousMonthRange spans the whole previous month', () => {
    expect(previousMonthRange('2026-10-15')).toEqual({ start: '2026-09-01', end: '2026-09-30' });
  });

  test('previousMonthRange wraps across a year boundary', () => {
    expect(previousMonthRange('2026-01-15')).toEqual({ start: '2025-12-01', end: '2025-12-31' });
  });
});
