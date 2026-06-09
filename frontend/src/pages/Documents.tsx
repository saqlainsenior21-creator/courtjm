import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../api';

const DOC_TYPES = ['Pleading','Application','Affidavit','Order','Judgment','Notice','Summons','Warrant','Evidence','Correspondence','Other'];

export default function Documents() {
  const [docs, setDocs] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({ doc_type: 'Pleading' });
  const [error, setError] = useState('');

  function load() { api.get('/api/documents').then(r => setDocs(r.data)); }
  useEffect(() => { load(); api.get('/api/cases').then(r => setCases(r.data)); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try { await api.post('/api/documents', form); setShowModal(false); setForm({ doc_type: 'Pleading' }); load(); }
    catch (err: any) { setError(err.response?.data?.error || 'Failed'); }
  }

  async function updateStatus(id: number, status: string) {
    await api.put(`/api/documents/${id}/status`, { status }); load();
  }

  const f = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  function statusBadge(s: string) {
    const map: any = { received: 'badge-gold', reviewed: 'badge-blue', accepted: 'badge-green', rejected: 'badge-red' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>E-Filing</h1><p style={{ color: '#64748b', marginTop: 4 }}>Electronic document filing system</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> File Document</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Case #</th><th>Document Title</th><th>Type</th><th>Filed By</th><th>Court</th><th>Date Filed</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {docs.map(d => (
              <tr key={d.id}>
                <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1B3A6B', fontSize: '0.82rem' }}>{d.case_number}</span></td>
                <td style={{ fontWeight: 600, fontSize: '0.88rem' }}>{d.title}</td>
                <td><span className="badge badge-blue">{d.doc_type}</span></td>
                <td style={{ fontSize: '0.85rem' }}>{d.filed_by || '—'}</td>
                <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{d.court_name}</td>
                <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{d.created_at?.split('T')[0]}</td>
                <td>{statusBadge(d.status)}</td>
                <td>
                  {d.status === 'received' && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm btn-primary" style={{ background: '#006847' }} onClick={() => updateStatus(d.id, 'accepted')}>Accept</button>
                      <button className="btn btn-sm btn-danger" onClick={() => updateStatus(d.id, 'rejected')}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {docs.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No documents filed</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>File Document</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Case *</label>
                <select required value={form.case_id || ''} onChange={e => f('case_id', e.target.value)}>
                  <option value="">Select case...</option>
                  {cases.map(c => <option key={c.id} value={c.id}>{c.case_number} — {c.title}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Document Title *</label><input required value={form.title || ''} onChange={e => f('title', e.target.value)} placeholder="Claim Form, Affidavit..." /></div>
                <div className="form-group"><label>Document Type *</label>
                  <select required value={form.doc_type} onChange={e => f('doc_type', e.target.value)}>
                    {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Filed By</label><input value={form.filed_by || ''} onChange={e => f('filed_by', e.target.value)} placeholder="Firm or individual name" /></div>
              <div className="form-group"><label>Notes</label><textarea rows={2} value={form.notes || ''} onChange={e => f('notes', e.target.value)} /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">File Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
