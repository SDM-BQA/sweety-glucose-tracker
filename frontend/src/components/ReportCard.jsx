export default function ReportCard({ title, range, summary, variant }) {
  const isPrimary = variant === 'primary';

  return (
    <div className={`report-tile ${isPrimary ? 'primary' : ''}`}>
      <div>
        <div className="tile-title">{title}</div>
        <div className="range">
          {range.start} → {range.end}
        </div>
      </div>

      {summary.count === 0 ? (
        <p className="empty-state" style={isPrimary ? { color: 'rgba(242,239,230,0.6)' } : undefined}>
          No readings in this range.
        </p>
      ) : isPrimary ? (
        <div className="tile-main-stat">
          <span className="figure">{summary.average}</span>
          <span className="figure-unit">mg/dl avg · {summary.count} readings</span>
        </div>
      ) : (
        <div className="mini-stats">
          <div className="mini-stat">
            <span className="tile-title">Average</span>
            <span className="figure">{summary.average}</span>
          </div>
          <div className="mini-stat">
            <span className="tile-title">Highest / Lowest</span>
            <span className="figure">
              {summary.highest} / {summary.lowest}
            </span>
          </div>
          <div className="mini-stat">
            <span className="tile-title">Readings</span>
            <span className="figure">{summary.count}</span>
          </div>
        </div>
      )}
    </div>
  );
}
