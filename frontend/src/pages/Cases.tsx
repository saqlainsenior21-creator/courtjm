import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import api from '../api';

const PARISHES = ['Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine'];
const CASE_TYPES = ['Civil','Criminal','Commercial','Family','Land','Traffic','Probate','Constitutional','Labour','Other'];
const PRIORITIES = ['urgent','high','normal','low'];

export default function Cases() {
  const [cases, setCases] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [filter, setFilter] = useState({ status: '', case_type: '', priority: '' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({ case_type: 'Civil', priority: 'normal' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('cj_user') || '{}');

  function load() {
    const q = new URLSearchParams(filter as any).toString();
    api.get(`/api/cases?${q}`).then(r => setCases(r.data));
  }

  useEffect(() => { load(); api.get('/api/courts').then(r => setCourts(r.data)); }, [filter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try { await api.post('/api/cases', form); setShowModal(false); setForm({ case_type: 'Civil', priority: 'normal' }); load(); }
    catch (err: any) { setError(err.response?.data?.error || 'Failed'); }
  }

  const f = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  function priorityBadge(p: string) {
    const map: any = { urgent: 'badge-red', high: 'badge-gold', normal: 'badge-blue', low: 'badge-gray' };
    return <span className={`badge ${map[p]}`}>{p}</span>;
  }
  function statusBadge(s: string) {
    const map: any = { active: 'badge-green', adjourned: 'badge-gold', closed: 'badge-gray', dismissed: 'badge-red', pending: 'badge-blue' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Cases</h1><p style={{ color: '#64748b', marginTop: 4 }}>{cases.length} cases</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> File New Case</button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['', 'active', 'adjourned', 'pending', 'closed', 'dismissed'].map(s => (
          <button key={s} className={`btn btn-sm ${filter.status === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(p => ({ ...p, status: s }))}>{s || 'All'}</button>
        ))}
        <select style={{ padding: '0.4rem 0.8rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.85rem' }} value={filter.case_type} onChange={e => setFilter(p => ({ ...p, case_type: e.target.value }))}>
          <option value="">All Types</option>{CASE_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select style={{ padding: '0.4rem 0.8rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.85rem' }} value={filter.priority} onChange={e => setFilter(p => ({ ...p, priority: e.target.value }))}>
          <option value="">All Priorities</option>{PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Case #</th><th>Title</th><th>Type</th><th>Plaintiff</th><th>Defendant</th><th>Judge</th><th>Next Hearing</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>
            {cases.map(c => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/cases/${c.id}`)}>
                <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1B3A6B', fontSize: '0.85rem' }}>{c.case_number}</span></td>
                <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.88rem' }}>{c.title}</td>
                <td><span className="badge badge-purple">{c.case_type}</span></td>
                <td style={{ fontSize: '0.85rem' }}>{c.plaintiff}</td>
                <td style={{ fontSize: '0.85rem' }}>{c.defendant}</td>
                <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{c.presiding_judge || '—'}</td>
                <td style={{ fontSize: '0.82rem' }}>{c.next_hearing_date ? <span className="badge badge-gold">{c.next_hearing_date}</span> : '—'}</td>
                <td>{priorityBadge(c.priority)}</td>
                <td>{statusBadge(c.status)}</td>
              </tr>
            ))}
            {cases.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No cases found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>File New Case</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              {user.role === 'moj_admin' && (
                <div className="form-group"><label>Court *</label>
                  <select required value={form.court_id || ''} onChange={e => f('court_id', e.target.value)}>
                    <option value="">Select court...</option>
                    {courts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.parish})</option>)}
                  </select>
                </div>
              )}
              <div className="form-row">
                <div className="form-group"><label>Case Number *</label><input required value={form.case_number || ''} onChange={e => f('case_number', e.target.value)} placeholder="CL-2026-001" /></div>
                <div className="form-group"><label>Case Type *</label>
                  <select required value={form.case_type} onChange={e => f('case_type', e.target.value)}>
                    {CASE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Case Title *</label><input required value={form.title || ''} onChange={e => f('title', e.target.value)} placeholder="Brown v. Caribbean Holdings Ltd" /></div>
              <div className="form-row">
                <div className="form-group"><label>Plaintiff *</label><input required value={form.plaintiff || ''} onChange={e => f('plaintiff', e.target.value)} /></div>
                <div className="form-group"><label>Plaintiff's Lawyer</label><input value={form.plaintiff_lawyer || ''} onChange={e => f('plaintiff_lawyer', e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Defendant *</label><input required value={form.defendant || ''} onChange={e => f('defendant', e.target.value)} /></div>
                <div className="form-group"><label>Defendant's Lawyer</label><input value={form.defendant_lawyer || ''} onChange={e => f('defendant_lawyer', e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Presiding Judge</label><input value={form.presiding_judge || ''} onChange={e => f('presiding_judge', e.target.value)} placeholder="Hon. Justice..." /></div>
                <div className="form-group"><label>Priority</label>
                  <select value={form.priority} onChange={e => f('priority', e.target.value)}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Filed Date</label><input type="date" value={form.filed_date || ''} onChange={e => f('filed_date', e.target.value)} /></div>
                <div className="form-group"><label>Next Hearing Date</label><input type="date" value={form.next_hearing_date || ''} onChange={e => f('next_hearing_date', e.target.value)} /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea rows={2} value={form.description || ''} onChange={e => f('description', e.target.value)} /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">File Case</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
