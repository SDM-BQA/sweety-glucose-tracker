import { useEffect, useState } from 'react';
import client from '../api/client';
import ReadingForm from '../components/ReadingForm';
import ReadingList from '../components/ReadingList';

const LIMIT = 10;

export default function Dashboard() {
  const [readings, setReadings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  async function load(p = page) {
    const res = await client.get(`/readings?page=${p}&limit=${LIMIT}`);
    setReadings(res.data.data);
    setPagination(res.data.pagination);
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

  return (
    <div className="page">
      <ReadingForm
        key={editing ? editing.id : 'new'}
        initial={editing ? { date: editing.date, slot: editing.slot, value: editing.value } : null}
        onSubmit={handleSubmit}
        onCancel={() => setEditing(null)}
        error={error}
      />

      <div className="card">
        <h3>Your readings</h3>
        <ReadingList
          readings={readings}
          onEdit={(r) => setEditing(r)}
          onDelete={handleDelete}
        />
        {pagination.totalPages > 1 && (
          <div className="pager">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
