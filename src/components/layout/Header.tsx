import { useAuth } from '../../contexts/AuthContext';
import { ROLE_META } from '../../lib/types';
import { MessageCircle } from 'lucide-react';

interface HeaderProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onAdminClick: () => void;
  onChatClick: () => void;
}

export function Header({ activeView, onViewChange, onAdminClick, onChatClick }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const roleMeta = profile ? ROLE_META[profile.role] : null;

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '56px',
      background: '#1F1D1C', zIndex: 200,
      display: 'flex', alignItems: 'center', padding: '0 22px', gap: '14px'
    }}>
      <img
        src="/Lockup-Color.png"
        alt="Justice System Partners"
        style={{ height: '32px', width: 'auto', flexShrink: 0 }}
      />

      <span style={{ fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', fontSize: '10px', fontWeight: 700, color: '#FABE3D', letterSpacing: '.09em', textTransform: 'uppercase' }}>
        JSP Operating System
      </span>

      <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,.15)' }} />

      <nav style={{ display: 'flex', gap: '4px' }}>
        {[
          { id: 'home', label: 'Home' },
          { id: 'documents', label: 'Documents' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            style={{
              fontSize: '10px', padding: '4px 10px', borderRadius: '4px',
              background: activeView === id ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.08)',
              color: activeView === id ? '#fff' : 'rgba(255,255,255,.6)',
              border: 'none', cursor: 'pointer', fontFamily: 'Verdana,sans-serif',
              transition: 'all .14s',
            }}
          >
            {label}
          </button>
        ))}
        {profile?.role === 'admin' && (
          <button
            onClick={onAdminClick}
            style={{
              fontSize: '10px', padding: '4px 10px', borderRadius: '4px',
              background: 'rgba(255,255,255,.08)', color: '#FABE3D',
              border: 'none', cursor: 'pointer', fontFamily: 'Verdana,sans-serif',
            }}
          >
            Admin
          </button>
        )}
      </nav>

      <div style={{ flex: 1 }} />

      <button
        onClick={onChatClick}
        title="AI Assistant"
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          fontSize: '10px', padding: '4px 10px', borderRadius: '4px',
          background: 'rgba(144,34,108,.25)', color: '#E8B4D6',
          border: '1px solid rgba(144,34,108,.4)', cursor: 'pointer', fontFamily: 'Verdana,sans-serif',
        }}
      >
        <MessageCircle size={12} />
        AI Assistant
      </button>

      <a href="https://app.hubspot.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '4px', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)', border: 'none', cursor: 'pointer', fontFamily: 'Verdana,sans-serif', textDecoration: 'none' }}>
        HubSpot ↗
      </a>
      <a href="https://app.asana.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '4px', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)', border: 'none', cursor: 'pointer', fontFamily: 'Verdana,sans-serif', textDecoration: 'none' }}>
        Asana ↗
      </a>

      {roleMeta && (
        <button
          onClick={signOut}
          title="Sign out"
          style={{
            fontSize: '9px', fontWeight: 700, padding: '4px 11px', borderRadius: '10px',
            background: roleMeta.bg, color: roleMeta.tc,
            border: 'none', cursor: 'pointer', fontFamily: 'Verdana,sans-serif',
            textTransform: 'uppercase', letterSpacing: '.06em',
          }}
        >
          {roleMeta.label}
        </button>
      )}
    </header>
  );
}
