import { useEffect, useState } from 'react';
import { SLOTS, todayDateOnly } from '../constants';

const EMPTY = { date: todayDateOnly(), slot: 'morning', value: '' };

export default function ReadingForm({ initial, onSubmit, onCancel, error }) {
  const [form, setForm] = useState(initial || EMPTY);

  useEffect(() => {
    setForm(initial || EMPTY);
  }, [initial]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
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
        <select name="slot" value={form.slot} onChange={handleChange}>
          {SLOTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Value (mg/dl)
        <input
          type="number"
          name="value"
          value={form.value}
          onChange={handleChange}
          min={40}
          max={600}
          step={1}
          required
        />
      </label>
      <div className="form-actions">
        <button type="submit">{initial ? 'Save changes' : 'Add reading'}</button>
        {initial && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
