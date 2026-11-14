import { useEffect, useState } from 'react';
import { Sunrise, Coffee, UtensilsCrossed, Moon, Plus, Save, X } from 'lucide-react';
import { SLOTS, todayDateOnly } from '../constants';

const ICONS = { Sunrise, Coffee, UtensilsCrossed, Moon };

const EMPTY = { date: todayDateOnly(), slot: 'morning', value: '' };

export default function ReadingForm({ initial, onSubmit, onCancel, error }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(initial || EMPTY);
  }, [initial]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>{initial ? 'Edit reading' : 'Add a reading'}</h3>
      {error && <p className="error">{error}</p>}

      <label>
        Date
        <input
          type="date"
          name="date"
          value={form.date}
          max={todayDateOnly()}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Time slot
        <div className="slot-picker">
          {SLOTS.map((s) => {
            const Icon = ICONS[s.icon];
            return (
              <button
                type="button"
                key={s.value}
                className={`slot-option ${form.slot === s.value ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, slot: s.value })}
              >
                <Icon strokeWidth={2} />
                {s.short}
              </button>
            );
          })}
        </div>
      </label>

      <label>
        Value
        <div className="value-input-wrap">
          <input
            type="number"
            name="value"
            value={form.value}
            onChange={handleChange}
            min={40}
            max={600}
            step={1}
            placeholder="e.g. 110"
            required
          />
          <span className="value-unit">mg/dl</span>
        </div>
      </label>

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {initial ? <Save size={16} /> : <Plus size={16} />}
          {initial ? 'Save changes' : 'Add reading'}
        </button>
        {initial && (
          <button type="button" className="secondary" onClick={onCancel}>
            <X size={16} />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
