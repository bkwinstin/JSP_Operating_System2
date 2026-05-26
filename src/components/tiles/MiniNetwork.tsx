import { Job } from '../../lib/types';

interface MiniNode {
  id: string;
  lb: string[];
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  f: string;
  s: string;
  t: string;
  ghost?: boolean;
  bold?: boolean;
}

interface MiniEdge {
  s: string;
  t: string;
  c: string;
  bold?: boolean;
  dash?: boolean;
}

interface MiniNetData {
  vb: string;
  nodes: MiniNode[];
  edges: MiniEdge[];
}

const MINI_DATA: Record<string, MiniNetData> = {
  'thriving-staff': {
    vb: '0 0 400 162',
    nodes: [
      { id: 'ts',  lb: ['Thriving', 'Staff'],           cx: 185, cy: 78,  rx: 38, ry: 22, f: '#FEF3CC', s: '#C8881A', t: '#7A5500' },
      { id: 'eip', lb: ['EIP'],                         cx: 100, cy: 110, rx: 22, ry: 14, f: '#FEF3CC', s: '#C8881A', t: '#7A5500' },
      { id: 'ns',  lb: ['North Star'],                  cx: 45,  cy: 148, rx: 28, ry: 12, f: '#FEF3CC', s: '#C8881A', t: '#7A5500' },
      { id: 'co',  lb: ['Coaching'],                    cx: 118, cy: 150, rx: 24, ry: 12, f: '#FEF3CC', s: '#C8881A', t: '#7A5500' },
      { id: 'pp',  lb: ['Practice', 'Profiles'],        cx: 44,  cy: 85,  rx: 32, ry: 17, f: '#FEF3CC', s: '#C8881A', t: '#7A5500' },
      { id: 'lt',  lb: ['Learning', 'Teams'],           cx: 44,  cy: 42,  rx: 30, ry: 16, f: '#FEF3CC', s: '#C8881A', t: '#7A5500' },
      { id: 'sk',  lb: ['Skills DB'],                   cx: 185, cy: 148, rx: 28, ry: 12, f: '#FEF3CC', s: '#C8881A', t: '#7A5500' },
      { id: 'ga',  lb: ['Growing Towards', 'Autonomy'], cx: 295, cy: 110, rx: 40, ry: 17, f: '#FEF3CC', s: '#C8881A', t: '#7A5500', bold: true },
      { id: 'ef',  lb: ['Effectuating', 'Work'],        cx: 370, cy: 110, rx: 32, ry: 16, f: '#E1F5EE', s: '#0F6E56', t: '#085041', ghost: true },
      { id: 'iw',  lb: ['Innovative', 'Work'],          cx: 345, cy: 42,  rx: 30, ry: 16, f: '#EEEDFE', s: '#534AB7', t: '#3C3489', ghost: true },
    ],
    edges: [
      { s: 'ns', t: 'eip', c: '#C8881A' }, { s: 'co', t: 'eip', c: '#C8881A' }, { s: 'pp', t: 'eip', c: '#C8881A' },
      { s: 'eip', t: 'ga', c: '#C8881A' }, { s: 'lt', t: 'ts', c: '#C8881A' }, { s: 'sk', t: 'ts', c: '#C8881A' },
      { s: 'ga', t: 'ef', c: '#534AB7', bold: true }, { s: 'ts', t: 'iw', c: '#534AB7', dash: true },
      { s: 'iw', t: 'ts', c: '#534AB7', dash: true },
    ],
  },
  'trusted-partnerships': {
    vb: '0 0 400 162',
    nodes: [
      { id: 'fc', lb: ['Field', 'Catalyst'],        cx: 190, cy: 78,  rx: 40, ry: 22, f: '#1F1D1C', s: '#FABE3D', t: '#FABE3D' },
      { id: 'tp', lb: ['Trusted', 'Partners'],      cx: 82,  cy: 38,  rx: 34, ry: 17, f: '#FAECE7', s: '#993C1D', t: '#712B13' },
      { id: 'bd', lb: ['Business', 'Dev'],          cx: 82,  cy: 120, rx: 30, ry: 16, f: '#FAECE7', s: '#993C1D', t: '#712B13' },
      { id: 'ec', lb: ['External', 'Comms'],        cx: 190, cy: 22,  rx: 32, ry: 14, f: '#FAECE7', s: '#993C1D', t: '#712B13' },
      { id: 'sm', lb: ['Social', 'Media'],          cx: 310, cy: 120, rx: 28, ry: 16, f: '#FAECE7', s: '#993C1D', t: '#712B13' },
      { id: 'pr', lb: ['Presentations'],            cx: 318, cy: 42,  rx: 34, ry: 14, f: '#FAECE7', s: '#993C1D', t: '#712B13' },
      { id: 'cp', lb: ['Communities', 'of Practice'], cx: 190, cy: 142, rx: 38, ry: 16, f: '#FAECE7', s: '#993C1D', t: '#712B13' },
      { id: 'rm', lb: ['Rel. Mgmt'],               cx: 42,  cy: 78,  rx: 28, ry: 13, f: '#FAECE7', s: '#993C1D', t: '#712B13' },
      { id: 'cr', lb: ['CRMC'],                    cx: 360, cy: 78,  rx: 22, ry: 13, f: '#FAECE7', s: '#993C1D', t: '#712B13' },
    ],
    edges: [
      { s: 'fc', t: 'tp', c: '#F3755E' }, { s: 'tp', t: 'fc', c: '#F3755E' },
      { s: 'fc', t: 'bd', c: '#F3755E' }, { s: 'fc', t: 'ec', c: '#F3755E' },
      { s: 'fc', t: 'sm', c: '#F3755E' }, { s: 'fc', t: 'pr', c: '#F3755E' },
      { s: 'fc', t: 'cp', c: '#F3755E' }, { s: 'tp', t: 'rm', c: '#F3755E' },
      { s: 'cr', t: 'cp', c: '#F3755E' },
    ],
  },
  'system-change': {
    vb: '0 0 400 162',
    nodes: [
      { id: 'pl', lb: ['Project', 'Launch'],       cx: 42,  cy: 58,  rx: 28, ry: 16, f: '#E1F5EE', s: '#0F6E56', t: '#085041' },
      { id: 'it', lb: ['Internal', 'Team'],        cx: 108, cy: 38,  rx: 28, ry: 16, f: '#E1F5EE', s: '#0F6E56', t: '#085041' },
      { id: 'ek', lb: ['External', 'Kickoff'],     cx: 175, cy: 28,  rx: 28, ry: 16, f: '#E1F5EE', s: '#0F6E56', t: '#085041' },
      { id: 'ce', lb: ['Calibration', 'Event'],   cx: 242, cy: 38,  rx: 28, ry: 16, f: '#E1F5EE', s: '#0F6E56', t: '#085041' },
      { id: 'ew', lb: ['Effectuating', 'Work'],   cx: 308, cy: 78,  rx: 34, ry: 17, f: '#E1F5EE', s: '#0F6E56', t: '#085041', bold: true },
      { id: 'cl', lb: ['Closeout &', 'Learning'], cx: 355, cy: 130, rx: 34, ry: 20, f: '#E1F5EE', s: '#0F6E56', t: '#085041' },
      { id: 'ga', lb: ['Growing Towards', 'Autonomy'], cx: 42, cy: 130, rx: 40, ry: 16, f: '#FEF3CC', s: '#C8881A', t: '#7A5500', ghost: true },
      { id: 'pd', lb: ['Professional', 'Dev'],    cx: 178, cy: 148, rx: 34, ry: 14, f: '#FEF3CC', s: '#C8881A', t: '#7A5500', ghost: true },
      { id: 'iw', lb: ['Innovative', 'Work'],     cx: 248, cy: 148, rx: 30, ry: 14, f: '#EEEDFE', s: '#534AB7', t: '#3C3489', ghost: true },
    ],
    edges: [
      { s: 'pl', t: 'it', c: '#0F6E56' }, { s: 'it', t: 'ek', c: '#0F6E56' },
      { s: 'ek', t: 'ce', c: '#0F6E56' }, { s: 'ce', t: 'ew', c: '#0F6E56' },
      { s: 'ew', t: 'cl', c: '#0F6E56' },
      { s: 'ga', t: 'ew', c: '#C8881A', bold: true },
      { s: 'cl', t: 'pd', c: '#C8881A', bold: true }, { s: 'cl', t: 'iw', c: '#534AB7', bold: true },
    ],
  },
  'innovative-work': {
    vb: '0 0 400 162',
    nodes: [
      { id: 'iw',  lb: ['Innovative', 'Work'],          cx: 185, cy: 72,  rx: 40, ry: 22, f: '#EEEDFE', s: '#534AB7', t: '#3C3489' },
      { id: 'ce',  lb: ['Cutting Edge', 'Research'],    cx: 68,  cy: 135, rx: 36, ry: 17, f: '#EEEDFE', s: '#534AB7', t: '#3C3489' },
      { id: 'fc2', lb: ['Field Changing', 'Initiatives'], cx: 185, cy: 148, rx: 40, ry: 14, f: '#EEEDFE', s: '#534AB7', t: '#3C3489' },
      { id: 'cs',  lb: ['Challenging', 'Status Quo'],   cx: 315, cy: 135, rx: 36, ry: 17, f: '#EEEDFE', s: '#534AB7', t: '#3C3489' },
      { id: 'lm',  lb: ['Learning in', 'Motion'],       cx: 55,  cy: 38,  rx: 32, ry: 17, f: '#FEF3CC', s: '#C8881A', t: '#7A5500', ghost: true },
      { id: 'ts',  lb: ['Thriving', 'Staff'],           cx: 185, cy: 22,  rx: 32, ry: 14, f: '#FEF3CC', s: '#C8881A', t: '#7A5500', ghost: true },
      { id: 'pl',  lb: ['Project', 'Lifecycle'],        cx: 355, cy: 72,  rx: 32, ry: 17, f: '#E1F5EE', s: '#0F6E56', t: '#085041', ghost: true },
    ],
    edges: [
      { s: 'lm', t: 'iw', c: '#C8881A' }, { s: 'ts', t: 'iw', c: '#C8881A' }, { s: 'iw', t: 'ts', c: '#C8881A' },
      { s: 'iw', t: 'ce', c: '#534AB7' }, { s: 'iw', t: 'fc2', c: '#534AB7' }, { s: 'iw', t: 'cs', c: '#534AB7' },
      { s: 'ce', t: 'pl', c: '#0F6E56', bold: true }, { s: 'fc2', t: 'pl', c: '#0F6E56', bold: true },
      { s: 'cs', t: 'pl', c: '#0F6E56', bold: true },
    ],
  },
};

function getEllipseEdgePoint(n: MiniNode, tx: number, ty: number) {
  const dx = tx - n.cx, dy = ty - n.cy;
  const angle = Math.atan2(dy / n.ry, dx / n.rx);
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return [n.cx + n.rx * Math.cos(angle) + dx / len * 2, n.cy + n.ry * Math.sin(angle) + dy / len * 2];
}

interface MiniNetworkProps {
  job: Job;
  onOpenFullMap: () => void;
}

export function MiniNetwork({ job, onOpenFullMap }: MiniNetworkProps) {
  const data = MINI_DATA[job.id];
  if (!data) return null;

  const nodeMap: Record<string, MiniNode> = {};
  data.nodes.forEach(n => { nodeMap[n.id] = n; });

  return (
    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #E4E2D6' }}>
      <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9C8878', marginBottom: '8px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>
        How this connects — dashed nodes show cross-cluster bridges
      </div>
      <div style={{ background: '#F2F1E9', borderRadius: '8px', padding: '4px', overflowX: 'auto' }}>
        <svg width="100%" viewBox={data.vb} style={{ minWidth: '280px', display: 'block' }}>
          <defs>
            <marker id="mna" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          {data.edges.map((e, i) => {
            const n1 = nodeMap[e.s], n2 = nodeMap[e.t];
            if (!n1 || !n2) return null;
            const [x1, y1] = getEllipseEdgePoint(n1, n2.cx, n2.cy);
            const [x2, y2] = getEllipseEdgePoint(n2, n1.cx, n1.cy);
            return (
              <line key={i} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)}
                stroke={e.c} strokeWidth={e.bold ? 2 : 1.2} opacity={e.bold ? 0.9 : 0.5}
                strokeDasharray={e.dash ? '5 3' : 'none'} markerEnd="url(#mna)" strokeLinecap="round"
              />
            );
          })}
          {data.nodes.map(n => (
            <g key={n.id} style={{ opacity: n.ghost ? 0.6 : 1 }}>
              <ellipse cx={n.cx} cy={n.cy} rx={n.rx} ry={n.ry}
                fill={n.f} stroke={n.s} strokeWidth={n.bold ? 2 : 0.8}
                strokeDasharray={n.ghost ? '3 3' : 'none'}
              />
              {n.lb.length === 1 ? (
                <text x={n.cx} y={n.cy} textAnchor="middle" dominantBaseline="central" style={{ fill: n.t, fontSize: 11, pointerEvents: 'none' }}>
                  {n.lb[0]}
                </text>
              ) : (
                <text textAnchor="middle" style={{ fill: n.t, fontSize: 11, pointerEvents: 'none' }}>
                  <tspan x={n.cx} y={n.cy - 6}>{n.lb[0]}</tspan>
                  <tspan x={n.cx} dy="14">{n.lb[1]}</tspan>
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <button
        onClick={onOpenFullMap}
        style={{ fontSize: '10px', color: '#9C8878', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '6px', padding: 0, fontFamily: 'Verdana,sans-serif' }}
      >
        View in full network map →
      </button>
    </div>
  );
}
