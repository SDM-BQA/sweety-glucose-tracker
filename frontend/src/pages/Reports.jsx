import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import client from '../api/client';
import ReportCard from '../components/ReportCard';
import { todayDateOnly } from '../constants';

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

  const chartData = monthly
    ? monthly.readings.map((r) => ({ date: r.date, value: r.value }))
    : [];

  return (
    <div className="page">
      <div className="card">
        <label>
          Report date
          <input
            type="date"
            value={date}
            max={todayDateOnly()}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>

      {daily && <ReportCard title="Daily report" range={daily.range} summary={daily.summary} />}
      {monthToDate && (
        <ReportCard title="Month-to-date report" range={monthToDate.range} summary={monthToDate.summary} />
      )}
      {monthly && <ReportCard title="Previous month report" range={monthly.range} summary={monthly.summary} />}

      {daily && daily.readings.length > 0 && (
        <div className="card">
          <h3>Readings on {daily.range.start}</h3>
          <ul className="daily-list">
            {daily.readings.map((r) => (
              <li key={r.id}>
                <span>{slotLabel(r.slot)}</span>
                <span>{r.value} mg/dl</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="card">
          <h3>Previous month trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[40, 600]} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2f6f4f" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function slotLabel(slot) {
  const labels = {
    morning: 'Morning (fasting)',
    after_breakfast: 'After breakfast',
    after_lunch: 'After lunch',
    after_dinner: 'After dinner',
  };
  return labels[slot] || slot;
}
