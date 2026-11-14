import { SLOT_LABELS } from '../constants';

export default function ReadingList({ readings, onEdit, onDelete }) {
  if (readings.length === 0) {
    return <p className="empty-state">No readings yet. Add your first one above.</p>;
  }

  return (
    <table className="reading-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Slot</th>
          <th>Value (mg/dl)</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {readings.map((r) => (
          <tr key={r.id}>
            <td>{r.date}</td>
            <td>{SLOT_LABELS[r.slot]}</td>
            <td>{r.value}</td>
            <td className="row-actions">
              <button className="link" onClick={() => onEdit(r)}>
                Edit
              </button>
              <button className="link danger" onClick={() => onDelete(r)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
