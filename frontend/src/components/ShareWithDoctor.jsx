import { useEffect, useState } from 'react';
import { Stethoscope, X } from 'lucide-react';
import client from '../api/client';

export default function ShareWithDoctor() {
  const [doctor, setDoctor] = useState(undefined); // undefined = loading, null = none
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    client.get('/patients/me/doctor').then((res) => setDoctor(res.data.doctor));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await client.put('/patients/me/doctor', { doctorEmail: email });
      setDoctor(res.data.doctor);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    await client.delete('/patients/me/doctor');
    setDoctor(null);
  }

  if (doctor === undefined) return null;

  return (
    <div className="card">
      <h3>
        <Stethoscope size={17} style={{ verticalAlign: -3, marginRight: 8 }} />
        Share with your doctor
      </h3>

      {doctor ? (
        <div className="reading-row" style={{ padding: 0, border: 'none' }}>
          <div className="reading-info">
            <div className="reading-slot">{doctor.name}</div>
            <div className="reading-date">{doctor.email}</div>
          </div>
          <button type="button" className="secondary" onClick={handleRemove}>
            <X size={15} />
            Stop sharing
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}
          <label>
            Doctor's email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@example.com"
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Sharing…' : 'Share my readings'}
          </button>
        </form>
      )}
    </div>
  );
}
