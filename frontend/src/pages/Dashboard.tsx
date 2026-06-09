import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Calendar, FileText, AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const user = JSON.parse(localStorage.getItem('cj_user') || '{}');
  const isAdmin = user.role === 'moj_admin';

  useEffect(() => {
    const endpoint = isAdmin ? '/api/courts/overview' : `/api/courts/${user.court_id}/stats`;
    api.get(endpoint).then(r => setStats(r.data)).catch(() => {});
  }, []);

  function priorityBadge(p: string) {
    const map: any = { urgent: 'badge-red', high: 'badge-gold', normal: 'badge-blue', low: 'badge-gray' };
    return <span className={`badge ${map[p] || 'badge-gray'}`}>{p}</span>;
  }

  function statusBadge(s: string) {
    const map: any = { active: 'badge-green', adjourned: 'badge-gold', closed: 'badge-gray', dismissed: 'badge-red', pending: 'badge-blue', scheduled: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {user.name?.split(' ')[0]} ⚖️</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>{user.court?.name || 'Ministry of Justice — National Overview'}</p>
        </div>
        <Link to="/cases" className="btn btn-primary"><Plus size={16} /> File New Case</Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Cases</div>
          <div className="stat-value">{stats?.totalCases ?? '—'}</div>
          <div className="stat-sub">{isAdmin ? 'Nationwide' : 'This court'}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Active Cases</div>
          <div className="stat-value">{stats?.activeCases ?? '—'}</div>
          <div className="stat-sub">In progress</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">{isAdmin ? 'Urgent Cases' : "Today's Hearings"}</div>
          <div className="stat-value">{isAdmin ? (stats?.urgentCases ?? '—') : (stats?.todayHearings ?? '—')}</div>
          <div className="stat-sub">{isAdmin ? 'Require immediate attention' : 'Scheduled today'}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">{isAdmin ? 'Pending Documents' : 'Courts'}</div>
          <div className="stat-value">{isAdmin ? (stats?.pendingDocs ?? '—') : (stats?.totalCases ?? '—')}</div>
          <div className="stat-sub">{isAdmin ? 'Awaiting review' : 'Total registered'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Upcoming Hearings */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Upcoming Hearings</h2>
            <Link to="/hearings" style={{ fontSize: '0.82rem', color: '#1B3A6B', display: 'flex', alignItems: 'center', gap: 4 }}>View all <ArrowRight size={14} /></Link>
          </div>
          {(stats?.upcomingHearings || []).map((h: any) => (
            <div key={h.id} style={{ padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1B3A6B' }}>{h.case_number}</div>
              <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: 2 }}>{h.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{h.hearing_date} at {h.hearing_time} — {h.type}</div>
            </div>
          ))}
          {!stats?.upcomingHearings?.length && <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No upcoming hearings</p>}
        </div>

        {/* Recent Cases */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Cases</h2>
            <Link to="/cases" style={{ fontSize: '0.82rem', color: '#1B3A6B', display: 'flex', alignItems: 'center', gap: 4 }}>View all <ArrowRight size={14} /></Link>
          </div>
          {(stats?.recentCases || []).map((c: any) => (
            <Link to={`/cases/${c.id}`} key={c.id} style={{ display: 'block', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: '#1B3A6B' }}>{c.case_number}</span>
                {priorityBadge(c.priority)}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: 2 }}>{c.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{c.case_type} — {c.court_name || c.parish}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
