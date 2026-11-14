export const SLOTS = [
  { value: 'morning', label: 'Morning (fasting)', short: 'Morning', icon: 'Sunrise' },
  { value: 'after_breakfast', label: 'After breakfast', short: 'Breakfast', icon: 'Coffee' },
  { value: 'after_lunch', label: 'After lunch', short: 'Lunch', icon: 'UtensilsCrossed' },
  { value: 'after_dinner', label: 'After dinner', short: 'Dinner', icon: 'Moon' },
];

export const SLOT_LABELS = SLOTS.reduce((acc, s) => {
  acc[s.value] = s.label;
  return acc;
}, {});

export const SLOT_META = SLOTS.reduce((acc, s) => {
  acc[s.value] = s;
  return acc;
}, {});

export function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDisplayDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Simple display-only banding so readings are easy to scan at a glance.
// Not medical guidance — thresholds are a coarse general approximation,
// since the app doesn't distinguish fasting vs. post-meal targets.
export function glucoseStatus(value) {
  if (value < 70) return 'low';
  if (value <= 139) return 'normal';
  if (value <= 199) return 'elevated';
  return 'high';
}

export const STATUS_LABELS = {
  low: 'Low',
  normal: 'Normal',
  elevated: 'Elevated',
  high: 'High',
};
