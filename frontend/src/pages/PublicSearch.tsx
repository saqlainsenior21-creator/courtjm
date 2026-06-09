import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Scale, ArrowRight } from 'lucide-react';
import api from '../api';

const PARISHES = ['Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine'];
const CASE_TYPES = ['Civil','Criminal','Commercial','Family','Land','Traffic','Probate','Constitutional','Labour','Other'];

export default function PublicSearch() {
  const [query, setQuery] = useState('');
  const [parish, setParish] = useState('');
  const [caseType, setCaseType] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.get(`/api/cases/search?q=${query}&parish=${parish}&case_type=${caseType}`);
      setResults(data); setSearched(true);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }

  function statusBadge(s: string) {
    const map: any = { active: 'badge-green', adjourned: 'badge-gold', closed: 'badge-gray', dismissed: 'badge-red', pending: 'badge-blue' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: '#1B3A6B', color: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Scale size={28} color="#FFB81C" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>CourtJM</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.75 }}>Ministry of Justice — Public Case Search</div>
          </div>
        </div>
        <Link to="/login" style={{ background: '#FFB81C', color: '#1a202c', padding: '0.5rem 1.25rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' }}>Staff Login</Link>
      </div>

      <div style={{ maxWidth: 900, margin: '3rem auto', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1B3A6B', marginBottom: '0.5rem' }}>Jamaica Court Case Search</h1>
          <p style={{ color: '#64748b' }}>Search by case number, party name, or case title</p>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0.75rem', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Search</label>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Case number, party name, or title..." />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Parish</label>
                <select value={parish} onChange={e => setParish(e.target.value)}>
                  <option value="">All</option>{PARISHES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Type</label>
                <select value={caseType} onChange={e => setCaseType(e.target.value)}>
                  <option value="">All</option>{CASE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}><Search size={16} />{loading ? 'Searching...' : 'Search'}</button>
            </div>
          </form>
        </div>

        {searched && (
          <div className="card">
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>{results.length} result{results.length !== 1 ? 's' : ''}</h2>
            </div>
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <Scale size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>No cases found. Try a different search term.</p>
              </div>
            ) : (
              <table>
                <thead><tr><th>Case #</th><th>Title</th><th>Type</th><th>Plaintiff</th><th>Defendant</th><th>Court</th><th>Next Hearing</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {results.map(c => (
                    <tr key={c.id}>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1B3A6B', fontSize: '0.82rem' }}>{c.case_number}</span></td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                      <td><span className="badge badge-purple">{c.case_type}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{c.plaintiff}</td>
                      <td style={{ fontSize: '0.85rem' }}>{c.defendant}</td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{c.court_name}</td>
                      <td style={{ fontSize: '0.82rem' }}>{c.next_hearing_date || '—'}</td>
                      <td>{statusBadge(c.status)}</td>
                      <td><Link to={`/cases/${c.id}`} className="btn btn-sm btn-secondary"><ArrowRight size={14} /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '3rem', color: '#94a3b8', fontSize: '0.82rem' }}>
          🇯🇲 CourtJM — Ministry of Justice Jamaica | courtjm.com | saqlain@schooltrackjm.com
        </div>
      </div>
    </div>
  );
}
