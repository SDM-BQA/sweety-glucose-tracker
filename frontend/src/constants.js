export const SLOTS = [
  { value: 'morning', label: 'Morning (fasting)' },
  { value: 'after_breakfast', label: 'After breakfast' },
  { value: 'after_lunch', label: 'After lunch' },
  { value: 'after_dinner', label: 'After dinner' },
];

export const SLOT_LABELS = SLOTS.reduce((acc, s) => {
  acc[s.value] = s.label;
  return acc;
}, {});

export function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}
