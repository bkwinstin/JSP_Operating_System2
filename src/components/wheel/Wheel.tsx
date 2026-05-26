import { Job } from '../../lib/types';

const CX = 135, CY = 135, OR = 128, IR = 50;

function polar(r: number, a: number) {
  const rad = (a - 90) * Math.PI / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function arc(iR: number, oR: number, s: number, e: number, g = 2.5) {
  const os = polar(oR, s + g), oe = polar(oR, e - g);
  const is_p = polar(iR, s + g), ie = polar(iR, e - g);
  const la = (e - s) > 180 ? 1 : 0;
  return `M${os.x.toFixed(2)} ${os.y.toFixed(2)} A${oR} ${oR} 0 ${la} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)} L${ie.x.toFixed(2)} ${ie.y.toFixed(2)} A${iR} ${iR} 0 ${la} 0 ${is_p.x.toFixed(2)} ${is_p.y.toFixed(2)} Z`;
}

function nameSvg(name: string, x: number, y: number, col: string, sz: number) {
  const words = name.split(' ');
  if (words.length === 1) {
    return <text x={x.toFixed(1)} y={y.toFixed(1)} textAnchor="middle" dominantBaseline="central" style={{ fill: col, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', fontWeight: 700, fontSize: sz, pointerEvents: 'none' }}>{name}</text>;
  }
  const mid = Math.ceil(words.length / 2);
  const dy = sz * 0.68;
  return (
    <text textAnchor="middle" style={{ fill: col, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', fontWeight: 700, fontSize: sz, pointerEvents: 'none' }}>
      <tspan x={x.toFixed(1)} y={(y - dy).toFixed(1)}>{words.slice(0, mid).join(' ')}</tspan>
      <tspan x={x.toFixed(1)} dy={(dy * 2).toFixed(1)}>{words.slice(mid).join(' ')}</tspan>
    </text>
  );
}

interface WheelProps {
  jobs: Job[];
  activeJob: Job | null;
  onJobSelect: (job: Job) => void;
  onNetworkClick: () => void;
}

export function Wheel({ jobs, activeJob, onJobSelect, onNetworkClick }: WheelProps) {
  return (
    <div style={{
      background: '#fff',
      borderRight: '1px solid #E4E2D6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
      gap: '10px',
      overflow: 'hidden',
    }}>
      <svg width="270" height="270" viewBox="0 0 270 270">
        {jobs.map(j => {
          const mid = (j.wheel_start + j.wheel_end) / 2;
          const tr = (IR + OR) * 0.52;
          const tp = polar(tr, mid);
          const isActive = activeJob?.id === j.id;
          const opacity = activeJob ? (isActive ? 1 : 0.5) : 0.88;
          const scale = isActive ? 'scale(1.05)' : 'scale(1)';

          return (
            <g key={j.id} onClick={() => onJobSelect(j)} style={{ cursor: 'pointer' }}>
              <path
                d={arc(IR, OR, j.wheel_start, j.wheel_end)}
                fill={j.color}
                opacity={opacity}
                style={{ transition: 'opacity .18s,transform .18s', transformOrigin: `${CX}px ${CY}px`, transform: scale }}
              />
              {nameSvg(j.name, tp.x, tp.y, j.dark, 10.5)}
            </g>
          );
        })}

        <g onClick={onNetworkClick} style={{ cursor: 'pointer' }}>
          <circle cx={CX} cy={CY} r={IR - 4} fill="#1F1D1C" />
          <text x={CX} y={CY - 9} textAnchor="middle" style={{ fill: '#FABE3D', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', fontWeight: 700, fontSize: 12 }}>Field</text>
          <text x={CX} y={CY + 7} textAnchor="middle" style={{ fill: '#FABE3D', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', fontWeight: 700, fontSize: 12 }}>Catalyst</text>
          <text x={CX} y={CY + 21} textAnchor="middle" style={{ fill: 'rgba(255,255,255,.35)', fontFamily: 'Verdana,sans-serif', fontSize: 7.5 }}>JSP identity</text>
        </g>
      </svg>

      {activeJob ? (
        <div style={{
          fontSize: '11px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif',
          padding: '5px 14px', borderRadius: '14px',
          background: activeJob.light, color: activeJob.dark,
          textAlign: 'center', minHeight: '26px',
        }}>
          {activeJob.name}
        </div>
      ) : (
        <div style={{ minHeight: '26px' }} />
      )}

      <div style={{ fontSize: '10px', color: '#9C8878', textAlign: 'center', lineHeight: 1.55, fontStyle: 'italic', maxWidth: '240px' }}>
        {activeJob ? 'Open any tile below to explore' : 'Select a segment to explore'}
      </div>
    </div>
  );
}
