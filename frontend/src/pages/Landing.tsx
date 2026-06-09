import { Link } from 'react-router-dom';
import { Scale, Search, FolderOpen, Calendar, FileText, Shield, BarChart3, CheckCircle } from 'lucide-react';

export default function Landing() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1a202c' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Scale size={28} color="#1B3A6B" />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1B3A6B' }}>CourtJM</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/partner" style={{ color: '#1B3A6B', fontWeight: 600 }}>⚖️ MOJ Partnership</Link>
          <Link to="/search" style={{ color: '#64748b', fontWeight: 500 }}>Public Search</Link>
          <Link to="/login" style={{ background: '#1B3A6B', color: 'white', padding: '0.5rem 1.25rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' }}>Staff Login</Link>
        </div>
      </nav>

      <section style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0f2448 100%)', color: 'white', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,184,28,0.2)', border: '1px solid rgba(255,184,28,0.4)', borderRadius: 999, padding: '0.4rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#FFB81C', fontWeight: 600 }}>
            🇯🇲 Built for Jamaica's Ministry of Justice
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>Jamaica's Digital<br />Court Management System</h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.85, marginBottom: '2rem', lineHeight: 1.7 }}>
            CourtJM digitises case filing, hearing scheduling, and e-filing for all of Jamaica's courts — giving the Ministry of Justice and the public real-time access to court information across all 14 parishes.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/search" style={{ background: '#FFB81C', color: '#1a202c', padding: '0.85rem 2rem', borderRadius: 10, fontWeight: 700, fontSize: '1rem' }}>Search Court Cases</Link>
            <Link to="/partner" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '0.85rem 2rem', borderRadius: 10, fontWeight: 600, fontSize: '1rem', border: '1px solid rgba(255,255,255,0.3)' }}>MOJ Partnership</Link>
          </div>
        </div>
      </section>

      <section style={{ background: '#FFB81C', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
          {[['19+', 'Courts Loaded'], ['14', 'Parishes'], ['Free', 'Public Case Search'], ['J$50K', '/Month per Court']].map(([val, label]) => (
            <div key={label}><div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1a202c' }}>{val}</div><div style={{ fontSize: '0.85rem', color: '#4a3200', fontWeight: 500 }}>{label}</div></div>
          ))}
        </div>
      </section>

      <section style={{ padding: '5rem 2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>Everything Jamaica's courts need</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { icon: <Search size={28} color="#1B3A6B" />, title: 'Public Case Search', desc: 'Citizens search case status, parties, and hearing dates with no login required.' },
              { icon: <FolderOpen size={28} color="#1B3A6B" />, title: 'Case Management', desc: 'File, track, and update cases with full history — civil, criminal, commercial, family and more.' },
              { icon: <Calendar size={28} color="#1B3A6B" />, title: 'Hearing Scheduling', desc: 'Schedule and manage court hearings with courtroom assignments and judge allocation.' },
              { icon: <FileText size={28} color="#1B3A6B" />, title: 'E-Filing', desc: 'Lawyers and registrars file documents electronically. Registrar reviews and accepts or rejects.' },
              { icon: <BarChart3 size={28} color="#1B3A6B" />, title: 'MOJ Dashboard', desc: 'Ministry of Justice gets a national view — cases by parish, type, priority and upcoming hearings.' },
              { icon: <Shield size={28} color="#1B3A6B" />, title: 'Secure & Audited', desc: 'Role-based access for MOJ admin, registrars, judges, clerks and lawyers. Full audit trail.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'white', borderRadius: 12, padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ marginBottom: '0.85rem' }}>{icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 2rem', background: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem' }}>Simple Pricing</h2>
          <div style={{ background: '#1B3A6B', color: 'white', borderRadius: 16, padding: '2.5rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: -32, right: -32, background: '#FFB81C', color: '#1a202c', padding: '0.4rem 1.25rem', borderRadius: 12, fontWeight: 700, fontSize: '0.85rem' }}>🇯🇲 Jamaica</div>
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.25rem' }}>J$50,000</div>
            <div style={{ opacity: 0.8, marginBottom: '1.5rem' }}>per court / per month</div>
            {['Free public case search','All case types supported','Hearing scheduling & management','E-filing portal for lawyers','MOJ national dashboard','Role-based access control','Free 30-day trial'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.6rem', justifyContent: 'center' }}>
                <CheckCircle size={18} color="#FFB81C" /><span>{f}</span>
              </div>
            ))}
            <Link to="/login" style={{ display: 'inline-block', background: '#FFB81C', color: '#1a202c', padding: '0.85rem 2.5rem', borderRadius: 10, fontWeight: 700, fontSize: '1rem', marginTop: '1.5rem' }}>Start Free Trial</Link>
          </div>
        </div>
      </section>

      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '0.75rem' }}>
          <Scale size={20} color="#1B3A6B" /><span style={{ fontWeight: 700, color: 'white' }}>CourtJM</span>
        </div>
        <p style={{ fontSize: '0.85rem' }}>© 2026 CourtJM — saqlain@schooltrackjm.com — +1 (876) 875-1969</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.4rem', opacity: 0.6 }}>Proudly built in Jamaica 🇯🇲</p>
      </footer>
    </div>
  );
}
