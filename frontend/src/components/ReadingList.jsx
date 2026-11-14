import { Sunrise, Coffee, UtensilsCrossed, Moon, Pencil, Trash2 } from 'lucide-react';
import { SLOT_META, glucoseStatus, formatDisplayDate } from '../constants';

const ICONS = { Sunrise, Coffee, UtensilsCrossed, Moon };

export default function ReadingList({ readings, onEdit, onDelete }) {
  if (readings.length === 0) {
    return <p className="empty-state">No readings yet. Add your first one above.</p>;
  }

  return (
    <div>
      {readings.map((r) => {
        const meta = SLOT_META[r.slot];
        const Icon = ICONS[meta.icon];
        const status = glucoseStatus(r.value);
        return (
          <div className="reading-row" key={r.id}>
            <span className="reading-icon">
              <Icon strokeWidth={2} />
            </span>
            <div className="reading-info">
              <div className="reading-slot">{meta.short}</div>
              <div className="reading-date">{formatDisplayDate(r.date)}</div>
            </div>
            <span className={`value-chip status-${status}`}>
              {r.value}
              <span className="unit">mg/dl</span>
            </span>
            <div className="row-actions">
              <button className="link" onClick={() => onEdit(r)} title="Edit">
                <Pencil />
              </button>
              <button className="link danger" onClick={() => onDelete(r)} title="Delete">
                <Trash2 />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
