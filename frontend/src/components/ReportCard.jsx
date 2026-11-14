export default function ReportCard({ title, range, summary }) {
  return (
    <div className="card report-card">
      <h3>{title}</h3>
      <p className="range">
        {range.start} to {range.end}
      </p>
      {summary.count === 0 ? (
        <p className="empty-state">No readings in this range.</p>
      ) : (
        <div className="stats">
          <div>
            <span className="stat-value">{summary.highest}</span>
            <span className="stat-label">Highest</span>
          </div>
          <div>
            <span className="stat-value">{summary.lowest}</span>
            <span className="stat-label">Lowest</span>
          </div>
          <div>
            <span className="stat-value">{summary.average}</span>
            <span className="stat-label">Average</span>
          </div>
          <div>
            <span className="stat-value">{summary.count}</span>
            <span className="stat-label">Readings</span>
          </div>
        </div>
      )}
    </div>
  );
}
