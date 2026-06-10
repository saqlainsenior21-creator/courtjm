import { useEffect, useState } from 'react';
import { Download, BarChart3 } from 'lucide-react';
import api from '../api';

export default function Reports() {
  const [summary, setSummary] = useState<any>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => { api.get('/api/reports/summary').then(r => setSummary(r.data)).catch(() => {}); }, []);

  async function downloadCSV(type: string) {
    const params = new URLSearchParams({ format: 'csv', ...(from && { from }), ...(to && { to }) });
    const res = await api.get(`/api/reports/${type}?${params}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url; a.download = `courtjm-${type}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function statusColor(s: string) {
    const map: any = { active: '#006847', adjourned: '#b45309', closed: '#64748b', dismissed: '#c0392b', pending: '#1d4ed8' };
    return map[s] || '#64748b';
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Reports & Export</h1><p style={{ color: '#64748b', marginTop: 4 }}>Analytics and CSV downloads</p></div>
      </div>

      {/* Date filter */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Date Range (for hearing exports)</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>From</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>To</label><input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Export cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <BarChart3 size={28} color="#1B3A6B" />
          <h3 style={{ fontWeight: 700 }}>All Cases</h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', flex: 1 }}>Export all cases with case number, type, parties, judge, status and priority.</p>
          <button className="btn btn-primary btn-sm" onClick={() => downloadCSV('cases')}><Download size={14} /> Export Cases CSV</button>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <BarChart3 size={28} color="#1B3A6B" />
          <h3 style={{ fontWeight: 700 }}>Hearings Schedule</h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', flex: 1 }}>Export hearing schedule with dates, times, courtrooms, judges and outcomes.</p>
          <button className="btn btn-primary btn-sm" onClick={() => downloadCSV('hearings')}><Download size={14} /> Export Hearings CSV</button>
        </div>
      </div>

      {/* Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Cases by Status</h2>
          {summary?.byStatus?.map((s: any) => (
            <div key={s.status} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: statusColor(s.status) }}>{s.status}</span>
              <span className="badge badge-blue">{s.count}</span>
            </div>
          ))}
          {!summary?.byStatus?.length && <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No data yet</p>}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Cases by Type</h2>
          {summary?.byType?.map((t: any) => (
            <div key={t.case_type} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span className="badge badge-purple">{t.case_type}</span>
              <span style={{ fontWeight: 600 }}>{t.count}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Cases by Priority</h2>
          {summary?.byPriority?.map((p: any) => {
            const map: any = { urgent: 'badge-red', high: 'badge-gold', normal: 'badge-blue', low: 'badge-gray' };
            return (
              <div key={p.priority} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span className={`badge ${map[p.priority]}`}>{p.priority}</span>
                <span style={{ fontWeight: 600 }}>{p.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly filings */}
      {summary?.monthlyFilings?.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Monthly Case Filings</h2>
          <table>
            <thead><tr><th>Month</th><th>Cases Filed</th></tr></thead>
            <tbody>
              {summary.monthlyFilings.map((m: any) => (
                <tr key={m.month}>
                  <td>{m.month}</td>
                  <td><span className="badge badge-blue">{m.count}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
