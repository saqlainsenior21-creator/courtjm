import { Link } from 'react-router-dom';
import { Scale, CheckCircle, Mail, Phone, Globe, ArrowLeft } from 'lucide-react';

export default function Partner() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#1B3A6B', color: 'white', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Scale size={24} color="#FFB81C" />
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>CourtJM</span>
        <span style={{ opacity: 0.6, margin: '0 0.5rem' }}>|</span>
        <span style={{ opacity: 0.85 }}>Ministry of Justice Partnership</span>
      </div>

      <div style={{ maxWidth: 860, margin: '3rem auto', padding: '0 1.5rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1B3A6B', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back
        </Link>

        <div style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0f2448 100%)', color: 'white', borderRadius: 16, padding: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,184,28,0.2)', border: '1px solid rgba(255,184,28,0.4)', borderRadius: 999, padding: '0.4rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#FFB81C', fontWeight: 600 }}>
            🇯🇲 Partnership Proposal — Ministry of Justice Jamaica
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Partner with CourtJM</h1>
          <p style={{ opacity: 0.9, fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            CourtJM is a fully operational, cloud-based court management system built for Jamaica. We are seeking the Ministry of Justice's endorsement for a national pilot programme across all courts.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1B3A6B', marginBottom: '1.25rem' }}>What CourtJM Offers</h2>
          {[
            ['Public Case Search', 'Citizens can search case status, parties, hearing dates and court information — no login required. Brings transparency to Jamaica\'s justice system.'],
            ['Digital Case Management', 'File, track and update cases digitally. Supports civil, criminal, commercial, family, land, traffic and all case types.'],
            ['Hearing Scheduling', 'Schedule hearings with courtroom assignments, judge allocation, and automatic case record updates.'],
            ['E-Filing System', 'Lawyers file pleadings, affidavits, applications and other documents electronically. Registrars review and approve online.'],
            ['MOJ National Dashboard', 'Ministry of Justice gets a real-time national view — cases by court, parish, type and priority across all 19+ courts.'],
            ['19 Courts Pre-Loaded', 'Supreme Court, Court of Appeal, Parish Courts and Resident Magistrate Courts across all 14 parishes already loaded.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <CheckCircle size={20} color="#1B3A6B" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{title}</div>
                <div style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#EAF1FB', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem', border: '1px solid #1B3A6B' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1B3A6B', marginBottom: '1rem' }}>Try the Live Demo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>MOJ Admin</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>admin@moj.gov.jm</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>Justice#2026@</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Registrar Demo</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>demo@courtjm.com</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>Demo2026!</div>
            </div>
          </div>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1B3A6B', color: 'white', padding: '0.6rem 1.5rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' }}>Access Live Demo</Link>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1B3A6B', marginBottom: '0.5rem' }}>Get in Touch</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Available for a meeting, presentation, or live demo at any time.</p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:saqlain@schooltrackjm.com" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1B3A6B', fontWeight: 600 }}><Mail size={18} /> saqlain@schooltrackjm.com</a>
            <a href="tel:+18768751969" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1B3A6B', fontWeight: 600 }}><Phone size={18} /> +1 (876) 875-1969</a>
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 8, fontSize: '0.82rem', color: '#94a3b8' }}>
            Saqlain Senior | Founder, CourtJM | Black River, St. Elizabeth, Jamaica 🇯🇲
          </div>
        </div>
      </div>
    </div>
  );
}
