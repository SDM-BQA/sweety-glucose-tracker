import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users } from 'lucide-react';
import client from '../api/client';
import Spinner from '../components/Spinner';

export default function DoctorPatients() {
  const [patients, setPatients] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/doctor/patients')
      .then((res) => setPatients(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your patients.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Your patients</h1>
        <p>Patients who've shared their readings with you.</p>
      </div>

      {loading && <Spinner label="Loading patients…" />}

      {error && <p className="error">{error}</p>}

      {!loading && patients && patients.length === 0 && (
        <div className="card">
          <p className="empty-state">
            <Users size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            No patients yet. A patient can share their readings with you from their dashboard
            using your account email.
          </p>
        </div>
      )}

      {patients && patients.length > 0 && (
        <div className="card">
          {patients.map((p) => (
            <div className="reading-row" key={p.id}>
              <span className="reading-icon">
                <Users size={18} strokeWidth={2} />
              </span>
              <div className="reading-info">
                <div className="reading-slot">{p.name}</div>
                <div className="reading-date">{p.email}</div>
              </div>
              <Link
                to={`/patients/${p.id}/reports`}
                state={{ patientName: p.name }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  textDecoration: 'none',
                  fontWeight: 600,
                  color: 'var(--ink)',
                }}
              >
                <TrendingUp size={16} />
                View reports
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
