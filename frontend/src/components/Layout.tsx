import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Calendar, FileText, Users, Scale, LogOut, Globe, Handshake, BarChart3 } from 'lucide-react';

const nav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/cases', label: 'Cases', icon: FolderOpen },
  { path: '/hearings', label: 'Hearings', icon: Calendar },
  { path: '/documents', label: 'E-Filing', icon: FileText },
  { path: '/reports', label: 'Reports & Export', icon: BarChart3 },
  { path: '/staff', label: 'Staff', icon: Users },
  { path: '/moj', label: 'MOJ Overview', icon: Globe },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('cj_user') || '{}');

  function logout() { localStorage.removeItem('cj_token'); localStorage.removeItem('cj_user'); navigate('/login'); }

  function roleBadgeColor(role: string) {
    const map: any = { moj_admin: '#c0392b', registrar: '#006847', judge: '#1B3A6B', clerk: '#b45309', lawyer: '#7c3aed' };
    return map[role] || '#64748b';
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, background: '#1B3A6B', color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/icon.svg" alt="" width={32} height={32} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', letterSpacing: 0.3 }}>CourtJM</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.7, letterSpacing: 1.2, textTransform: 'uppercase' }}>Ministry of Justice</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.6rem 0.9rem' }}>
            <div style={{ fontSize: '0.72rem', background: roleBadgeColor(user.role), color: 'white', borderRadius: 4, padding: '1px 6px', display: 'inline-block', marginBottom: 4 }}>{user.role?.replace('_', ' ').toUpperCase()}</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: 1 }}>{user.court?.name || 'MOJ Admin'}</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '0.75rem' }}>
          {nav.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.9rem', borderRadius: 8, marginBottom: 2, fontWeight: active ? 700 : 500, fontSize: '0.9rem', background: active ? 'rgba(255,255,255,0.2)' : 'transparent', color: 'white' }}>
                <Icon size={18} />{label}
              </Link>
            );
          })}
          <Link to="/search" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.9rem', borderRadius: 8, marginBottom: 2, fontSize: '0.9rem', color: '#FFB81C', background: 'rgba(255,184,28,0.1)', fontWeight: 500 }}>
            <FolderOpen size={18} /> Public Case Search
          </Link>
        </nav>
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <Link to="/partner" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.9rem', borderRadius: 8, marginBottom: 4, fontSize: '0.82rem', color: '#FFB81C', fontWeight: 600, background: 'rgba(255,184,28,0.1)' }}>
            <Handshake size={16} /> MOJ Partnership
          </Link>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.9rem', borderRadius: 8, width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>
      <main style={{ marginLeft: 240, flex: 1, padding: '2rem', minHeight: '100vh' }}>{children}</main>
    </div>
  );
}
