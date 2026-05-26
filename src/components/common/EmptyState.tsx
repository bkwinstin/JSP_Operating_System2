import { Job } from '../../lib/types';

interface EmptyStateProps {
  jobs: Job[];
  onJobSelect: (job: Job) => void;
  onNetworkClick: () => void;
}

export function EmptyState({ jobs, onJobSelect, onNetworkClick }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '70vh', textAlign: 'center', color: '#9C8878', padding: '40px 20px',
    }}>
      <div style={{ marginBottom: '10px' }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="18" stroke="#C8B8AF" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
          <circle cx="22" cy="22" r="7" fill="#1F1D1C" />
          <text x="22" y="20" textAnchor="middle" style={{ fill: '#FABE3D', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', fontWeight: 700, fontSize: '6px' }}>Field</text>
          <text x="22" y="27" textAnchor="middle" style={{ fill: '#FABE3D', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', fontWeight: 700, fontSize: '6px' }}>Catalyst</text>
        </svg>
      </div>

      <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#1F1D1C', marginBottom: '6px' }}>
        What would you like to explore?
      </div>
      <div style={{ fontSize: '12px', lineHeight: 1.7, maxWidth: '360px', marginBottom: '28px' }}>
        Select a job to see expandable tiles — Why it matters, How it works, and What we do. Or explore the Field Catalyst system map.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%', maxWidth: '600px' }}>
        {jobs.map(j => (
          <button
            key={j.id}
            onClick={() => onJobSelect(j)}
            style={{
              padding: '14px 16px', borderRadius: '10px',
              border: `1px solid ${j.color}35`,
              background: j.light, cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
              fontFamily: 'Verdana,sans-serif',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(31,29,28,.10)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: j.dark, marginBottom: '3px' }}>
              {j.name}
            </div>
            <div style={{ fontSize: '10px', color: j.dark, opacity: 0.55, lineHeight: 1.4 }}>
              Why · How · What
            </div>
          </button>
        ))}

        <button
          onClick={onNetworkClick}
          style={{
            padding: '14px 16px', borderRadius: '10px',
            border: '1px solid rgba(31,29,28,.15)',
            background: '#1F1D1C', cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
            fontFamily: 'Verdana,sans-serif',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(31,29,28,.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#FABE3D', marginBottom: '3px' }}>
            Field Catalyst
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.45)', lineHeight: 1.4 }}>
            System map
          </div>
        </button>
      </div>
    </div>
  );
}
