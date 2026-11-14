import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sunrise, Coffee, UtensilsCrossed, Moon } from 'lucide-react';
import client from '../api/client';
import ReportCard from '../components/ReportCard';
import { todayDateOnly, SLOT_META } from '../constants';

const ICONS = { Sunrise, Coffee, UtensilsCrossed, Moon };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#163832',
        color: '#f2efe6',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 13,
        fontFamily: 'IBM Plex Mono, monospace',
      }}
    >
      <div style={{ opacity: 0.7, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{payload[0].value} mg/dl</div>
    </div>
  );
}

export default function Reports() {
  const [date, setDate] = useState(todayDateOnly());
  const [daily, setDaily] = useState(null);
  const [monthToDate, setMonthToDate] = useState(null);
  const [monthly, setMonthly] = useState(null);

  async function load() {
    const [d, mtd, m] = await Promise.all([
      client.get(`/reports/daily?date=${date}`),
      client.get(`/reports/month-to-date?date=${date}`),
      client.get(`/reports/monthly?date=${date}`),
    ]);
    setDaily(d.data);
    setMonthToDate(mtd.data);
    setMonthly(m.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const chartData = monthly ? monthly.readings.map((r) => ({ date: r.date, value: r.value })) : [];

  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
        <p>Trends and summaries built from your logged readings.</p>
      </div>

      <div className="card report-filter">
        <label>
          Report date
          <input type="date" value={date} max={todayDateOnly()} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      {daily && monthToDate && monthly && (
        <div className="bento">
          <ReportCard title="Today's summary" range={daily.range} summary={daily.summary} variant="primary" />
          <ReportCard title="Month-to-date" range={monthToDate.range} summary={monthToDate.summary} />
          <ReportCard title="Previous month" range={monthly.range} summary={monthly.summary} />
        </div>
      )}

      {daily && daily.readings.length > 0 && (
        <div className="card">
          <h3>Readings on {daily.range.start}</h3>
          <ul className="daily-list">
            {daily.readings.map((r) => {
              const meta = SLOT_META[r.slot];
              const Icon = ICONS[meta.icon];
              return (
                <li key={r.id}>
                  <Icon size={16} strokeWidth={2} />
                  <span className="slot-name">{meta.short}</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>
                    {r.value} mg/dl
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="card chart-card">
          <h3>Previous month trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4dcc9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9a9180" />
              <YAxis domain={[40, 600]} tick={{ fontSize: 11 }} stroke="#9a9180" />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#c1562c" strokeWidth={2.5} dot={{ r: 3, fill: '#c1562c' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
