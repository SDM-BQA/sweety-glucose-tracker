import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import client from '../api/client';
import ReadingForm from '../components/ReadingForm';
import ReadingList from '../components/ReadingList';
import ShareWithDoctor from '../components/ShareWithDoctor';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

const LIMIT = 10;

export default function Dashboard() {
  const { user } = useAuth();
  const [readings, setReadings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(p = page) {
    setLoading(true);
    try {
      const res = await client.get(`/readings?page=${p}&limit=${LIMIT}`);
      setReadings(res.data.data);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleSubmit(form) {
    setError('');
    try {
      if (editing) {
        await client.put(`/readings/${editing.id}`, form);
        setEditing(null);
      } else {
        await client.post('/readings', form);
      }
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  }

  async function handleDelete(reading) {
    if (!window.confirm(`Delete the ${reading.date} reading?`)) return;
    await client.delete(`/readings/${reading.id}`);
    await load();
  }

  const firstName = user.name.split(' ')[0];

  return (
    <div>
      <div className="page-header">
        <h1>Hi, {firstName}</h1>
        <p>Log a reading or review what you've tracked so far.</p>
      </div>

      <ReadingForm
        key={editing ? editing.id : 'new'}
        initial={editing ? { date: editing.date, slot: editing.slot, value: editing.value } : null}
        onSubmit={handleSubmit}
        onCancel={() => setEditing(null)}
        error={error}
      />

      <div className="card">
        <h3>Your readings</h3>
        {loading ? (
          <Spinner label="Loading readings…" />
        ) : (
          <ReadingList
            readings={readings}
            onEdit={(r) => setEditing(r)}
            onDelete={handleDelete}
          />
        )}
        {!loading && pagination.totalPages > 1 && (
          <div className="pager">
            <button className="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={16} />
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="secondary"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <ShareWithDoctor />
    </div>
  );
}
