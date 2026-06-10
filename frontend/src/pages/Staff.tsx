import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../api';

const ROLES = ['registrar','judge','clerk','lawyer'];

export default function Staff() {
  const [users, setUsers] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({ role: 'clerk' });
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('cj_user') || '{}');

  function load() { api.get('/api/users').then(r => setUsers(r.data)); }
  useEffect(() => { load(); if (user.role === 'moj_admin') api.get('/api/courts').then(r => setCourts(r.data)); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try { await api.post('/api/users', form); setShowModal(false); setForm({ role: 'clerk' }); load(); }
    catch (err: any) { setError(err.response?.data?.error || 'Failed'); }
  }

  const f = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  function roleBadge(r: string) {
    const map: any = { moj_admin: 'badge-red', registrar: 'badge-green', judge: 'badge-blue', clerk: 'badge-gold', lawyer: 'badge-purple' };
    return <span className={`badge ${map[r] || 'badge-gray'}`}>{r.replace('_', ' ')}</span>;
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Staff Management</h1><p style={{ color: '#64748b', marginTop: 4 }}>{users.length} staff members</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Staff</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Court</th><th>Bar #</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{u.email}</td>
                <td>{roleBadge(u.role)}</td>
                <td style={{ fontSize: '0.85rem' }}>{u.court_name || 'MOJ Admin'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{u.bar_number || '—'}</td>
                <td><span className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <button className={`btn btn-sm ${u.active ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={async () => { await api.put(`/api/users/${u.id}/toggle`); load(); }}>
                    {u.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No staff found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Staff Member</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              {user.role === 'moj_admin' && (
                <div className="form-group"><label>Court</label>
                  <select value={form.court_id || ''} onChange={e => f('court_id', e.target.value)}>
                    <option value="">Select court...</option>
                    {courts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.parish})</option>)}
                  </select>
                </div>
              )}
              <div className="form-group"><label>Full Name *</label><input required value={form.name || ''} onChange={e => f('name', e.target.value)} /></div>
              <div className="form-group"><label>Email *</label><input type="email" required value={form.email || ''} onChange={e => f('email', e.target.value)} /></div>
              <div className="form-group"><label>Password *</label><input type="password" required value={form.password || ''} onChange={e => f('password', e.target.value)} /></div>
              <div className="form-row">
                <div className="form-group"><label>Role *</label>
                  <select value={form.role} onChange={e => f('role', e.target.value)}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Bar Number (lawyers only)</label><input value={form.bar_number || ''} onChange={e => f('bar_number', e.target.value)} placeholder="BAR-2026-001" /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
