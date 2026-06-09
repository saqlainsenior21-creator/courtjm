import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Scale } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('cj_token', data.token);
      localStorage.setItem('cj_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) { setError(err.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1B3A6B 0%, #0f2448 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ background: '#1B3A6B', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={32} color="#FFB81C" />
            </div>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1B3A6B' }}>CourtJM</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.3rem' }}>Ministry of Justice — Court Management System</p>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group"><label>Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@moj.gov.jm" required /></div>
          <div className="form-group"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required /></div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/search" style={{ color: '#1B3A6B', fontSize: '0.85rem', fontWeight: 600 }}>🔍 Public Case Search (no login needed)</Link>
        </div>
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 8, fontSize: '0.82rem', color: '#64748b' }}>
          <strong>MOJ Admin:</strong> admin@moj.gov.jm / Justice#2026@<br />
          <strong>Registrar:</strong> demo@courtjm.com / Demo2026!
        </div>
      </div>
    </div>
  );
}
