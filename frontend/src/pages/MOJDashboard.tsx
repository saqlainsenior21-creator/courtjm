import { useEffect, useState } from 'react';
import api from '../api';

export default function MOJDashboard() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api.get('/api/courts/overview').then(r => setData(r.data)).catch(() => {}); }, []);
  if (!data) return <div style={{ padding: '2rem', color: '#64748b' }}>Loading MOJ dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>MOJ National Overview</h1><p style={{ color: '#64748b', marginTop: 4 }}>Ministry of Justice — All Courts Jamaica</p></div>
        <div style={{ background: '#EAF1FB', color: '#1B3A6B', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem' }}>🇯🇲 Live Dashboard</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Total Courts</div><div className="stat-value">{data.totalCourts}</div><div className="stat-sub">All 14 parishes</div></div>
        <div className="stat-card gold"><div className="stat-label">Total Cases</div><div className="stat-value">{data.totalCases}</div><div className="stat-sub">Nationwide</div></div>
        <div className="stat-card red"><div className="stat-label">Urgent Cases</div><div className="stat-value">{data.urgentCases}</div><div className="stat-sub">Require immediate attention</div></div>
        <div className="stat-card green"><div className="stat-label">Active Cases</div><div className="stat-value">{data.activeCases}</div><div className="stat-sub">In progress</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>By Parish</h2>
          {data.byParish?.map((p: any) => (
            <div key={p.parish} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.88rem' }}>{p.parish}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="badge badge-blue">{p.courts} courts</span>
                <span className="badge badge-green">{p.cases} cases</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Cases by Type</h2>
          {data.casesByType?.map((t: any) => (
            <div key={t.case_type} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span className="badge badge-purple">{t.case_type}</span>
              <span style={{ fontWeight: 600 }}>{t.count}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Upcoming Hearings</h2>
          {data.upcomingHearings?.map((h: any) => (
            <div key={h.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: '#1B3A6B' }}>{h.case_number}</div>
              <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: 2 }}>{h.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 1 }}>{h.hearing_date} at {h.hearing_time} — {h.court_name}</div>
            </div>
          ))}
          {!data.upcomingHearings?.length && <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No upcoming hearings</p>}
        </div>
      </div>
    </div>
  );
}
