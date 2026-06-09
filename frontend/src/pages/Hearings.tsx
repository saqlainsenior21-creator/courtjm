import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../api';

const HEARING_TYPES = ['Mention','Plea','Trial','Sentencing','Appeal','Interlocutory','Case Management','Judgment','Other'];

export default function Hearings() {
  const [hearings, setHearings] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({ type: 'Mention', hearing_date: new Date().toISOString().split('T')[0], hearing_time: '09:00' });
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  function load() {
    const q = filter !== 'all' ? `?status=${filter}` : '';
    api.get(`/api/hearings${q}`).then(r => setHearings(r.data));
  }
  useEffect(() => { load(); api.get('/api/cases?status=active').then(r => setCases(r.data)); }, [filter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try { await api.post('/api/hearings', form); setShowModal(false); setForm({ type: 'Mention', hearing_date: new Date().toISOString().split('T')[0], hearing_time: '09:00' }); load(); }
    catch (err: any) { setError(err.response?.data?.error || 'Failed'); }
  }

  async function updateStatus(id: number, status: string) {
    await api.put(`/api/hearings/${id}`, { status }); load();
  }

  const f = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  function statusBadge(s: string) {
    const map: any = { scheduled: 'badge-blue', completed: 'badge-green', adjourned: 'badge-gold', cancelled: 'badge-red' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Hearings</h1><p style={{ color: '#64748b', marginTop: 4 }}>Court hearing schedule</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Schedule Hearing</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['all','scheduled','completed','adjourned','cancelled'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Case #</th><th>Case Title</th><th>Type</th><th>Date</th><th>Time</th><th>Courtroom</th><th>Judge</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {hearings.map(h => (
              <tr key={h.id}>
                <td><Link to={`/cases/${h.case_id}`} style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1B3A6B', fontSize: '0.85rem' }}>{h.case_number}</Link></td>
                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{h.title}</td>
                <td><span className="badge badge-purple">{h.type}</span></td>
                <td style={{ fontWeight: 600 }}>{h.hearing_date}</td>
                <td>{h.hearing_time}</td>
                <td style={{ fontSize: '0.85rem' }}>{h.courtroom || '—'}</td>
                <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{h.judge || '—'}</td>
                <td>{statusBadge(h.status)}</td>
                <td>
                  {h.status === 'scheduled' && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm btn-primary" style={{ background: '#006847' }} onClick={() => updateStatus(h.id, 'completed')}>Complete</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => updateStatus(h.id, 'adjourned')}>Adjourn</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {hearings.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No hearings found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Schedule Hearing</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Case *</label>
                <select required value={form.case_id || ''} onChange={e => f('case_id', e.target.value)}>
                  <option value="">Select case...</option>
                  {cases.map(c => <option key={c.id} value={c.id}>{c.case_number} — {c.title}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Date *</label><input type="date" required value={form.hearing_date} onChange={e => f('hearing_date', e.target.value)} /></div>
                <div className="form-group"><label>Time *</label><input type="time" required value={form.hearing_time} onChange={e => f('hearing_time', e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Type</label>
                  <select value={form.type} onChange={e => f('type', e.target.value)}>
                    {HEARING_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Courtroom</label><input value={form.courtroom || ''} onChange={e => f('courtroom', e.target.value)} placeholder="Courtroom 3" /></div>
              </div>
              <div className="form-group"><label>Judge</label><input value={form.judge || ''} onChange={e => f('judge', e.target.value)} placeholder="Hon. Justice..." /></div>
              <div className="form-group"><label>Notes</label><textarea rows={2} value={form.notes || ''} onChange={e => f('notes', e.target.value)} /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
