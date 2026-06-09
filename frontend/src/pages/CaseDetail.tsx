import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Scale, Calendar, FileText, AlertTriangle } from 'lucide-react';
import api from '../api';

export default function CaseDetail() {
  const { id } = useParams();
  const [c, setC] = useState<any>(null);

  useEffect(() => { api.get(`/api/cases/${id}`).then(r => setC(r.data)); }, [id]);

  if (!c) return <div style={{ padding: '2rem', color: '#64748b' }}>Loading...</div>;

  function priorityBadge(p: string) {
    const map: any = { urgent: 'badge-red', high: 'badge-gold', normal: 'badge-blue', low: 'badge-gray' };
    return <span className={`badge ${map[p] || 'badge-gray'}`}>{p}</span>;
  }
  function statusBadge(s: string) {
    const map: any = { active: 'badge-green', adjourned: 'badge-gold', closed: 'badge-gray', dismissed: 'badge-red', pending: 'badge-blue', scheduled: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red', accepted: 'badge-green', received: 'badge-gold', rejected: 'badge-red', reviewed: 'badge-blue' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/cases" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1B3A6B', fontWeight: 600, fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Cases
        </Link>
      </div>

      {/* Header */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '6px solid #1B3A6B' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800, color: '#1B3A6B' }}>{c.case_number}</span>
              <span className="badge badge-purple">{c.case_type}</span>
              {statusBadge(c.status)}
              {priorityBadge(c.priority)}
            </div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>{c.title}</h1>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.88rem', color: '#64748b' }}>
              <span><strong>Court:</strong> {c.court_name}</span>
              <span><strong>Parish:</strong> {c.parish}</span>
              <span><strong>Filed:</strong> {c.filed_date}</span>
              {c.next_hearing_date && <span><strong>Next Hearing:</strong> <span style={{ color: '#1B3A6B', fontWeight: 600 }}>{c.next_hearing_date}</span></span>}
            </div>
          </div>
          {c.presiding_judge && <div style={{ textAlign: 'right', fontSize: '0.88rem' }}>
            <div style={{ color: '#64748b' }}>Presiding Judge</div>
            <div style={{ fontWeight: 600 }}>{c.presiding_judge}</div>
          </div>}
        </div>
        {c.description && <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>{c.description}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Plaintiff</h2>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{c.plaintiff}</div>
          {c.plaintiff_lawyer && <div style={{ color: '#64748b', marginTop: 4, fontSize: '0.88rem' }}>Lawyer: {c.plaintiff_lawyer}</div>}
        </div>
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Defendant</h2>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{c.defendant}</div>
          {c.defendant_lawyer && <div style={{ color: '#64748b', marginTop: 4, fontSize: '0.88rem' }}>Lawyer: {c.defendant_lawyer}</div>}
        </div>
      </div>

      {c.verdict && (
        <div className="card" style={{ marginBottom: '1.5rem', background: '#e6f4ee', border: '1px solid #006847' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#006847', marginBottom: '0.5rem' }}>Verdict</h2>
          <div style={{ fontWeight: 600 }}>{c.verdict}</div>
          {c.verdict_date && <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>Date: {c.verdict_date}</div>}
        </div>
      )}

      {/* Hearings */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={18} color="#1B3A6B" /> Hearings ({c.hearings?.length || 0})</h2>
          <Link to="/hearings" className="btn btn-sm btn-primary">+ Schedule Hearing</Link>
        </div>
        <table>
          <thead><tr><th>Date</th><th>Time</th><th>Type</th><th>Courtroom</th><th>Judge</th><th>Status</th><th>Outcome</th></tr></thead>
          <tbody>
            {c.hearings?.map((h: any) => (
              <tr key={h.id}>
                <td style={{ fontWeight: 600 }}>{h.hearing_date}</td>
                <td>{h.hearing_time}</td>
                <td>{h.type}</td>
                <td>{h.courtroom || '—'}</td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{h.judge || '—'}</td>
                <td>{statusBadge(h.status)}</td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{h.outcome || '—'}</td>
              </tr>
            ))}
            {!c.hearings?.length && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8' }}>No hearings scheduled</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Documents */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={18} color="#1B3A6B" /> Documents ({c.documents?.length || 0})</h2>
          <Link to="/documents" className="btn btn-sm btn-primary">+ File Document</Link>
        </div>
        <table>
          <thead><tr><th>Title</th><th>Type</th><th>Filed By</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {c.documents?.map((d: any) => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600 }}>{d.title}</td>
                <td><span className="badge badge-blue">{d.doc_type}</span></td>
                <td style={{ fontSize: '0.85rem' }}>{d.filed_by || '—'}</td>
                <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{d.created_at?.split('T')[0]}</td>
                <td>{statusBadge(d.status)}</td>
              </tr>
            ))}
            {!c.documents?.length && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>No documents filed</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
