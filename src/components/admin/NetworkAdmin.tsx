import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2, Save, X, Link, Layers, Pencil, AlignCenter } from 'lucide-react';

type ColorKey = 'emp' | 'proj' | 'ic' | 'ec' | 'bub' | 'infra' | 'exec';
const COLOR_OPTIONS: { key: ColorKey; label: string; color: string }[] = [
  { key: 'emp',   label: 'Employees (gold)',         color: '#BA7517' },
  { key: 'proj',  label: 'Projects (green)',          color: '#0F6E56' },
  { key: 'ic',    label: 'Internal Catalyst (blue)',  color: '#534AB7' },
  { key: 'ec',    label: 'External Catalyst (red)',   color: '#993C1D' },
  { key: 'bub',   label: 'Bubble / highlight',        color: '#C8881A' },
  { key: 'infra', label: 'Infrastructure (teal)',      color: '#1A7895' },
  { key: 'exec',  label: 'Executive (amber)',          color: '#B8860B' },
];

interface Swimlane {
  id: string; label: string; badge: string; color_key: ColorKey;
  x: number; y: number; w: number; h: number;
  sort_order: number; min_role: string;
  why_title: string; why_content: string;
  how_title: string; how_content: string;
  parent_node_key: string | null;
  is_collapsible: boolean;
}

interface Node {
  id: string; swimlane_id: string; node_key: string;
  node_component: string | null;
  label: string; description: string;
  x: number; y: number; w: number; h: number;
  color_key: ColorKey; is_bubble: boolean; sort_order: number;
  has_sub_nodes: boolean;
  json_data: object | null;
  primary_person_responsible: string | null;
  additional_persons_responsible: string[] | null;
  why: string | null;
}

interface Edge {
  id: string; from_node_key: string; to_node_key: string;
  is_cross: boolean; is_feedback: boolean; is_upward: boolean;
  v_midpoint: number | null; custom_path: string | null;
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9C8878', marginBottom: '4px', fontFamily: 'Verdana,sans-serif' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputSt: React.CSSProperties = { width: '100%', padding: '7px 10px', border: '1px solid #E4E2D6', borderRadius: '6px', fontSize: '12px', fontFamily: 'Verdana,sans-serif', color: '#1F1D1C', boxSizing: 'border-box', background: '#FAFAF7' };

function Input({ value, onChange, placeholder }: { value: string | number; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputSt} />;
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputSt, resize: 'vertical', lineHeight: 1.55 }} />;
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputSt, background: '#fff' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function ModalShell({ title, onClose, children, maxWidth = 560 }: { title: string; onClose: () => void; children: React.ReactNode; maxWidth?: number }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(31,29,28,.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', padding: '24px', width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(31,29,28,.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#1F1D1C' }}>{title}</div>
          <button onClick={onClose} style={{ padding: '4px', border: 'none', background: 'none', cursor: 'pointer', color: '#9C8878' }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SaveBar({ onCancel, onSave, saving, disabled }: { onCancel: () => void; onSave: () => void; saving: boolean; disabled?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
      <button onClick={onCancel} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
      <button onClick={onSave} disabled={saving || disabled} style={{ padding: '8px 16px', borderRadius: '7px', border: 'none', background: '#1F1D1C', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: (saving || disabled) ? 0.5 : 1 }}>
        <Save size={12} />{saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

// ── Node auto-sizing ──────────────────────────────────────────────────────────

const NODE_FONT_SIZE = 10.5;
const NODE_LINE_H    = 13;
const NODE_PAD_X     = 14; // horizontal padding inside the node rect (each side)
const NODE_PAD_Y     = 10; // vertical padding inside the node rect (each side)
const NODE_MIN_W     = 60;
const NODE_MIN_H     = 28;

// Measure pixel width of a single text line using an offscreen canvas.
let _ctx: CanvasRenderingContext2D | null = null;
function measureText(text: string): number {
  if (typeof document === 'undefined') return text.length * 6.3;
  if (!_ctx) {
    const c = document.createElement('canvas');
    _ctx = c.getContext('2d');
  }
  if (!_ctx) return text.length * 6.3;
  _ctx.font = `700 ${NODE_FONT_SIZE}px "Century Gothic","Trebuchet MS",sans-serif`;
  return _ctx.measureText(text).width;
}

// Given a raw label string (with literal \n or actual newlines), return the
// optimal { w, h } that fits the text with padding.
function autoSizeDims(rawLabel: string): { w: number; h: number } {
  const label = rawLabel.replace(/\\n/gi, '\n');
  const lines = label.split('\n').filter(Boolean);
  if (lines.length === 0) return { w: NODE_MIN_W, h: NODE_MIN_H };
  const maxLineW = Math.max(...lines.map(l => measureText(l)));
  const w = Math.max(NODE_MIN_W, Math.ceil(maxLineW + NODE_PAD_X * 2));
  const h = Math.max(NODE_MIN_H, Math.ceil(lines.length * NODE_LINE_H + NODE_PAD_Y * 2));
  return { w, h };
}

// ── Node form (shared by Add + Edit) ─────────────────────────────────────────

type NodeForm = Omit<Node, 'id'> & { json_text: string };

function NodeFormFields({ form, set, lanes, lockKey, orgRoles }: { form: NodeForm; set: (k: string, v: unknown) => void; lanes: Swimlane[]; lockKey?: boolean; orgRoles: { value: string; label: string; color: string }[] }) {
  function handleLabelChange(v: string) {
    const dims = autoSizeDims(v);
    set('label', v);
    set('w', dims.w);
    set('h', dims.h);
  }

  return (
    <>
      <FieldRow label="Swimlane">
        <Select value={form.swimlane_id} onChange={v => set('swimlane_id', v)} options={lanes.map(l => ({ value: l.id, label: l.label }))} />
      </FieldRow>
      <FieldRow label={lockKey ? 'Node Key (read-only)' : 'Node Key (unique ID, no spaces)'}>
        <input
          value={form.node_key}
          onChange={e => !lockKey && set('node_key', e.target.value)}
          placeholder="e.g. infra9"
          readOnly={lockKey}
          style={{ ...inputSt, background: lockKey ? '#F2F1E9' : '#FAFAF7', cursor: lockKey ? 'not-allowed' : 'text', color: lockKey ? '#9C8878' : '#1F1D1C' }}
        />
        {lockKey && <div style={{ fontSize: '9px', color: '#9C8878', marginTop: '3px' }}>Node key cannot be changed — it is referenced by edges and documents.</div>}
      </FieldRow>
      <FieldRow label="Label (use \n for line breaks) — size auto-adjusts">
        <Input value={form.label} onChange={handleLabelChange} placeholder="e.g. Learning\nTeams" />
      </FieldRow>
      <FieldRow label="Description">
        <Input value={form.description} onChange={v => set('description', v)} placeholder="Short description shown on click" />
      </FieldRow>
      <FieldRow label="Color">
        <Select value={form.color_key} onChange={v => set('color_key', v as ColorKey)} options={COLOR_OPTIONS.map(c => ({ value: c.key, label: c.label }))} />
      </FieldRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        {(['x','y','w','h','sort_order'] as const).map(k => (
          <FieldRow key={k} label={k === 'sort_order' ? 'Order' : k.toUpperCase()}>
            <Input value={form[k]} onChange={v => set(k, parseInt(v) || 0)} />
          </FieldRow>
        ))}
      </div>
      <div style={{ fontSize: '9px', color: '#9C8878', marginTop: '-6px', marginBottom: '10px', fontFamily: 'Verdana,sans-serif' }}>
        W and H are auto-calculated from the label. You can override them manually.
      </div>
      <FieldRow label="Node Mode">
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { value: false, label: 'Direct documents', hint: 'Clicking opens attached documents in the side panel' },
            { value: true,  label: 'Sub-node drill-down', hint: 'Clicking expands a child swimlane with sub-nodes (each sub-node carries documents)' },
          ].map(opt => (
            <label key={String(opt.value)} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 12px', borderRadius: '8px', border: `2px solid ${form.has_sub_nodes === opt.value ? '#1A7895' : '#E4E2D6'}`, background: form.has_sub_nodes === opt.value ? '#EDF6F9' : '#FAFAF7', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <input type="radio" checked={form.has_sub_nodes === opt.value} onChange={() => set('has_sub_nodes', opt.value)} style={{ cursor: 'pointer' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1F1D1C' }}>{opt.label}</span>
              </div>
              <span style={{ fontSize: '9px', color: '#9C8878', lineHeight: 1.4 }}>{opt.hint}</span>
            </label>
          ))}
        </div>
      </FieldRow>
      {!form.has_sub_nodes && orgRoles.length > 0 && (
        <>
          <FieldRow label="Primary Person Responsible">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {orgRoles.map(role => {
                const checked = form.primary_person_responsible === role.value;
                return (
                  <label key={role.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '7px', border: `2px solid ${checked ? role.color : '#E4E2D6'}`, background: checked ? `${role.color}18` : '#FAFAF7', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: checked ? role.color : '#6A453A', transition: 'all .15s' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => set('primary_person_responsible', checked ? null : role.value)}
                      style={{ display: 'none' }}
                    />
                    {role.label}
                  </label>
                );
              })}
            </div>
          </FieldRow>
          <FieldRow label="Additional Person(s) Responsible">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {orgRoles.map(role => {
                const checked = (form.additional_persons_responsible || []).includes(role.value);
                return (
                  <label key={role.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '7px', border: `2px solid ${checked ? role.color : '#E4E2D6'}`, background: checked ? `${role.color}18` : '#FAFAF7', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: checked ? role.color : '#6A453A', transition: 'all .15s' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const current = form.additional_persons_responsible || [];
                        const next = checked ? current.filter(v => v !== role.value) : [...current, role.value];
                        set('additional_persons_responsible', next.length ? next : null);
                      }}
                      style={{ display: 'none' }}
                    />
                    {role.label}
                  </label>
                );
              })}
            </div>
          </FieldRow>
        </>
      )}
      {!form.has_sub_nodes && (
        <FieldRow label="Why">
          <Textarea
            value={form.why || ''}
            onChange={v => set('why', v || null)}
            placeholder="Explain why this node matters — shown in the side panel when a user clicks it."
            rows={4}
          />
        </FieldRow>
      )}
      <FieldRow label="Style">
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1F1D1C', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.is_bubble} onChange={e => set('is_bubble', e.target.checked)} />
          Bubble style (dashed border)
        </label>
      </FieldRow>
      <FieldRow label="JSON Data">
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1F1D1C', cursor: 'pointer', marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={form.json_data !== null || form.json_text !== ''}
            onChange={e => {
              if (e.target.checked) {
                set('json_text', '{\n  \n}');
              } else {
                set('json_text', '');
                set('json_data', null);
              }
            }}
          />
          Attach inline JSON document to this node
        </label>
        {(form.json_data !== null || form.json_text !== '') && (() => {
          let parseError = '';
          if (form.json_text) {
            try { JSON.parse(form.json_text); } catch (e) { parseError = (e as Error).message; }
          }
          return (
            <>
              <Textarea
                value={form.json_text}
                onChange={v => set('json_text', v)}
                placeholder={'{\n  "key": "value"\n}'}
                rows={8}
              />
              {parseError && (
                <div style={{ fontSize: '9px', color: '#CC3B2B', marginTop: '4px', fontFamily: 'Verdana,sans-serif' }}>
                  Invalid JSON: {parseError}
                </div>
              )}
              {!parseError && form.json_text && (
                <div style={{ fontSize: '9px', color: '#0F6E56', marginTop: '4px', fontFamily: 'Verdana,sans-serif' }}>
                  Valid JSON — will be saved with this node.
                </div>
              )}
            </>
          );
        })()}
      </FieldRow>
    </>
  );
}

// Compute a default position for a new node inside a given swimlane,
// placed after all existing nodes in that lane.
function defaultNodePos(lane: Swimlane, existingNodes: Node[]): { x: number; y: number; h: number } {
  const laneNodes = existingNodes.filter(n => n.swimlane_id === lane.id);
  const PAD = 8; // gap between nodes
  const nodeH = 42; // default height for new nodes
  // vertically center within the lane
  const y = lane.y + Math.round((lane.h - nodeH) / 2);
  if (laneNodes.length === 0) {
    return { x: lane.x + 8, y, h: nodeH };
  }
  const rightmost = laneNodes.reduce((best, n) => (n.x + n.w > best.x + best.w ? n : best));
  return { x: rightmost.x + rightmost.w + PAD, y, h: nodeH };
}

function AddNodeModal({ lanes, nodes, onSave, onClose, orgRoles }: { lanes: Swimlane[]; nodes: Node[]; onSave: (n: NodeForm) => Promise<void>; onClose: () => void; orgRoles: { value: string; label: string; color: string }[] }) {
  const firstLane = lanes[0];
  const initPos = firstLane ? defaultNodePos(firstLane, nodes) : { x: 100, y: 60, h: 42 };
  const initDims = autoSizeDims('');
  const [form, setForm] = useState<NodeForm>({ swimlane_id: firstLane?.id || '', node_key: '', label: '', description: '', x: initPos.x, y: initPos.y, w: initDims.w, h: initPos.h, color_key: 'emp', is_bubble: false, has_sub_nodes: false, sort_order: 99, json_data: null, json_text: '', primary_person_responsible: null, additional_persons_responsible: null, why: null });
  const [saving, setSaving] = useState(false);

  function set(k: string, v: unknown) {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === 'swimlane_id') {
        const lane = lanes.find(l => l.id === v);
        if (lane) {
          const pos = defaultNodePos(lane, nodes);
          next.x = pos.x;
          next.y = pos.y;
          next.h = pos.h;
        }
      }
      return next;
    });
  }

  async function handleSave() {
    if (!form.node_key || !form.label) return;
    setSaving(true);
    let json_data: object | null = form.json_data;
    if (form.json_text) {
      try { json_data = JSON.parse(form.json_text); } catch { json_data = null; }
    } else {
      json_data = null;
    }
    await onSave({ ...form, label: form.label.replace(/\\n/gi, '\n'), json_data, json_text: '' });
    setSaving(false);
  }
  return (
    <ModalShell title="Add Node" onClose={onClose}>
      <NodeFormFields form={form} set={set} lanes={lanes} orgRoles={orgRoles} />
      <SaveBar onCancel={onClose} onSave={handleSave} saving={saving} disabled={!form.node_key || !form.label} />
    </ModalShell>
  );
}

function EditNodeModal({ node, lanes, nodes, onSave, onClose, orgRoles }: { node: Node; lanes: Swimlane[]; nodes: Node[]; onSave: (id: string, f: NodeForm) => Promise<void>; onClose: () => void; orgRoles: { value: string; label: string; color: string }[] }) {
  const initDims = autoSizeDims(node.label);
  const initJsonText = node.json_data ? JSON.stringify(node.json_data, null, 2) : '';
  const [form, setForm] = useState<NodeForm>({ swimlane_id: node.swimlane_id, node_key: node.node_key, label: node.label, description: node.description, x: node.x, y: node.y, w: initDims.w, h: initDims.h, color_key: node.color_key, is_bubble: node.is_bubble, has_sub_nodes: node.has_sub_nodes, sort_order: node.sort_order, json_data: node.json_data, json_text: initJsonText, primary_person_responsible: node.primary_person_responsible ?? null, additional_persons_responsible: node.additional_persons_responsible ?? null, why: node.why ?? null });
  const [saving, setSaving] = useState(false);

  function set(k: string, v: unknown) {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === 'swimlane_id') {
        const lane = lanes.find(l => l.id === v);
        if (lane) {
          const pos = defaultNodePos(lane, nodes.filter(n => n.id !== node.id));
          next.x = pos.x;
          next.y = pos.y;
          next.h = pos.h;
          next.sort_order = 99;
        }
      }
      return next;
    });
  }

  async function handleSave() {
    if (!form.label) return;
    setSaving(true);
    let json_data: object | null = form.json_data;
    if (form.json_text) {
      try { json_data = JSON.parse(form.json_text); } catch { json_data = null; }
    } else {
      json_data = null;
    }
    await onSave(node.id, { ...form, label: form.label.replace(/\\n/gi, '\n'), json_data, json_text: '' });
    setSaving(false);
  }
  return (
    <ModalShell title={`Edit Node — ${node.node_key}`} onClose={onClose}>
      <NodeFormFields form={form} set={set} lanes={lanes} lockKey orgRoles={orgRoles} />
      <SaveBar onCancel={onClose} onSave={handleSave} saving={saving} disabled={!form.label} />
    </ModalShell>
  );
}

// ── Edge form ─────────────────────────────────────────────────────────────────

type EdgeForm = Omit<Edge, 'id'>;

const FIELD_CATALYST_OPTION = { value: 'field_catalyst', label: 'Field Catalyst — field_catalyst' };

function EdgeFormFields({ form, set, nodes }: { form: EdgeForm; set: (k: string, v: unknown) => void; nodes: Node[] }) {
  const nodeOptions = [
    FIELD_CATALYST_OPTION,
    ...[...nodes]
      .sort((a, b) => a.label.replace(/\n/g, ' ').localeCompare(b.label.replace(/\n/g, ' ')))
      .map(n => ({ value: n.node_key, label: `${n.label.replace(/\n/g, ' ')} — ${n.node_key}` })),
  ];
  return (
    <>
      <FieldRow label="From Node">
        <Select value={form.from_node_key} onChange={v => set('from_node_key', v)} options={nodeOptions} />
      </FieldRow>
      <FieldRow label="To Node">
        <Select value={form.to_node_key} onChange={v => set('to_node_key', v)} options={nodeOptions} />
      </FieldRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        {[{ key: 'is_cross', label: 'Cross-lane (dashed)' }, { key: 'is_feedback', label: 'Feedback (gold)' }, { key: 'is_upward', label: 'Upward arrow' }].map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1F1D1C', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!(form as Record<string, unknown>)[key]} onChange={e => set(key, e.target.checked)} />
            {label}
          </label>
        ))}
      </div>
      <FieldRow label="Vertical midpoint (for cross-lane curves, e.g. 133)">
        <Input value={form.v_midpoint ?? ''} onChange={v => set('v_midpoint', v ? parseInt(v) : null)} placeholder="leave blank for auto" />
      </FieldRow>
      <FieldRow label="Custom SVG path (optional — overrides all other settings)">
        <Input value={form.custom_path ?? ''} onChange={v => set('custom_path', v)} placeholder="M100 200 C..." />
      </FieldRow>
    </>
  );
}

function AddEdgeModal({ nodes, onSave, onClose }: { nodes: Node[]; onSave: (e: EdgeForm) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<EdgeForm>({ from_node_key: nodes[0]?.node_key || '', to_node_key: nodes[1]?.node_key || '', is_cross: false, is_feedback: false, is_upward: false, v_midpoint: null, custom_path: null });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  async function handleSave() { setSaving(true); await onSave({ ...form, custom_path: form.custom_path || null }); setSaving(false); }
  return (
    <ModalShell title="Add Connection" onClose={onClose} maxWidth={520}>
      <EdgeFormFields form={form} set={set} nodes={nodes} />
      <SaveBar onCancel={onClose} onSave={handleSave} saving={saving} />
    </ModalShell>
  );
}

function EditEdgeModal({ edge, nodes, onSave, onClose }: { edge: Edge; nodes: Node[]; onSave: (id: string, f: EdgeForm) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<EdgeForm>({ from_node_key: edge.from_node_key, to_node_key: edge.to_node_key, is_cross: edge.is_cross, is_feedback: edge.is_feedback, is_upward: edge.is_upward, v_midpoint: edge.v_midpoint, custom_path: edge.custom_path });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  async function handleSave() { setSaving(true); await onSave(edge.id, { ...form, custom_path: form.custom_path || null }); setSaving(false); }
  const fLabel = nodes.find(n => n.node_key === edge.from_node_key)?.label.replace(/\n/g,' ') || edge.from_node_key;
  const tLabel = nodes.find(n => n.node_key === edge.to_node_key)?.label.replace(/\n/g,' ') || edge.to_node_key;
  return (
    <ModalShell title={`Edit Connection — ${fLabel} → ${tLabel}`} onClose={onClose} maxWidth={520}>
      <EdgeFormFields form={form} set={set} nodes={nodes} />
      <SaveBar onCancel={onClose} onSave={handleSave} saving={saving} />
    </ModalShell>
  );
}

// ── Swimlane form ─────────────────────────────────────────────────────────────

type LaneForm = Omit<Swimlane, 'id'> & { is_collapsible: boolean };

function LaneFormFields({ form, set, nodes }: { form: LaneForm; set: (k: string, v: unknown) => void; nodes?: Node[] }) {
  const parentNodeOptions = nodes
    ? [{ value: '', label: '— None (top-level swimlane)' }, ...nodes.filter(n => n.has_sub_nodes).map(n => ({ value: n.node_key, label: `${n.node_key} — ${n.label.replace(/\n/g, ' ')}` }))]
    : [{ value: '', label: '— None (top-level swimlane)' }];

  return (
    <>
      <FieldRow label="Label">
        <Input value={form.label} onChange={v => set('label', v)} placeholder="e.g. Executive Team" />
      </FieldRow>
      <FieldRow label="Badge (owner/role shown in lane)">
        <Input value={form.badge} onChange={v => set('badge', v)} placeholder="e.g. President + EVP" />
      </FieldRow>
      <FieldRow label="Color">
        <Select value={form.color_key} onChange={v => set('color_key', v as ColorKey)} options={COLOR_OPTIONS.map(c => ({ value: c.key, label: c.label }))} />
      </FieldRow>
      <FieldRow label="Visibility">
        <Select value={form.min_role} onChange={v => set('min_role', v)} options={[{ value: 'all', label: 'All staff' }, { value: 'jsp_admin', label: 'JSP Administration + Executive + Admin' }, { value: 'executive', label: 'Executive + Admin only' }]} />
      </FieldRow>
      <FieldRow label="Parent Node (makes this a child / drill-down swimlane)">
        <Select value={form.parent_node_key || ''} onChange={v => set('parent_node_key', v || null)} options={parentNodeOptions} />
        {form.parent_node_key && (
          <div style={{ fontSize: '9px', color: '#1A7895', marginTop: '4px', fontFamily: 'Verdana,sans-serif' }}>
            This swimlane will render indented below the parent node and expand when that node is clicked.
          </div>
        )}
      </FieldRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '8px' }}>
        {(['x','y','w','h','sort_order'] as const).map(k => (
          <FieldRow key={k} label={k === 'sort_order' ? 'Order' : k.toUpperCase()}>
            <Input value={form[k]} onChange={v => set(k, parseInt(v) || 0)} />
          </FieldRow>
        ))}
      </div>
      <FieldRow label="Options">
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1F1D1C', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.is_collapsible} onChange={e => set('is_collapsible', e.target.checked)} />
          Collapsible (users can collapse this lane to save space)
        </label>
      </FieldRow>

      <div style={{ marginTop: '4px', paddingTop: '14px', borderTop: '1px solid #E4E2D6' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9C8878', marginBottom: '12px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>
          Why &amp; How Content (shown when lane title is clicked)
        </div>
        <FieldRow label="Why — Heading">
          <Input value={form.why_title} onChange={v => set('why_title', v)} placeholder={`Why ${form.label || 'this lane'}`} />
        </FieldRow>
        <FieldRow label="Why — Body text">
          <Textarea value={form.why_content} onChange={v => set('why_content', v)} placeholder="Explain the purpose and importance of this lane..." rows={4} />
        </FieldRow>
        <FieldRow label="How — Heading">
          <Input value={form.how_title} onChange={v => set('how_title', v)} placeholder={`How ${form.label || 'this lane'} Works`} />
        </FieldRow>
        <FieldRow label="How — Body text">
          <Textarea value={form.how_content} onChange={v => set('how_content', v)} placeholder="Describe how this lane operates..." rows={4} />
        </FieldRow>
      </div>
    </>
  );
}

function AddLaneModal({ onSave, onClose, currentMaxY, nodes }: { onSave: (l: LaneForm) => Promise<void>; onClose: () => void; currentMaxY: number; nodes: Node[] }) {
  const [form, setForm] = useState<LaneForm>({ label: '', badge: '', color_key: 'infra', x: 68, y: currentMaxY + 10, w: 1326, h: 90, sort_order: 99, min_role: 'all', why_title: '', why_content: '', how_title: '', how_content: '', parent_node_key: null, is_collapsible: false });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  async function handleSave() { if (!form.label) return; setSaving(true); await onSave(form); setSaving(false); }
  return (
    <ModalShell title="Add Swimlane" onClose={onClose} maxWidth={520}>
      <LaneFormFields form={form} set={set} nodes={nodes} />
      <SaveBar onCancel={onClose} onSave={handleSave} saving={saving} disabled={!form.label} />
    </ModalShell>
  );
}

function EditLaneModal({ lane, onSave, onClose, nodes }: { lane: Swimlane; onSave: (id: string, f: LaneForm) => Promise<void>; onClose: () => void; nodes: Node[] }) {
  const [form, setForm] = useState<LaneForm>({ label: lane.label, badge: lane.badge, color_key: lane.color_key, x: lane.x, y: lane.y, w: lane.w, h: lane.h, sort_order: lane.sort_order, min_role: lane.min_role, why_title: lane.why_title || '', why_content: lane.why_content || '', how_title: lane.how_title || '', how_content: lane.how_content || '', parent_node_key: lane.parent_node_key, is_collapsible: lane.is_collapsible ?? false });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  async function handleSave() { if (!form.label) return; setSaving(true); await onSave(lane.id, form); setSaving(false); }
  return (
    <ModalShell title={`Edit Swimlane — ${lane.label}`} onClose={onClose} maxWidth={520}>
      <LaneFormFields form={form} set={set} nodes={nodes} />
      <SaveBar onCancel={onClose} onSave={handleSave} saving={saving} disabled={!form.label} />
    </ModalShell>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────

function DeleteConfirm({ label, onConfirm, onClose }: { label: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(31,29,28,.5)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', padding: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 8px 40px rgba(31,29,28,.25)' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#1F1D1C', marginBottom: '8px' }}>Confirm Delete</div>
        <div style={{ fontSize: '12px', color: '#6A453A', lineHeight: 1.5, marginBottom: '20px' }}>
          Delete <strong>{label}</strong>? This cannot be undone.
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 16px', borderRadius: '7px', border: 'none', background: '#CC3B2B', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main NetworkAdmin ─────────────────────────────────────────────────────────

type ModalState =
  | { type: 'add-node' }
  | { type: 'edit-node'; node: Node }
  | { type: 'add-edge' }
  | { type: 'edit-edge'; edge: Edge }
  | { type: 'add-lane' }
  | { type: 'edit-lane'; lane: Swimlane }
  | { type: 'delete-node'; node: Node }
  | { type: 'delete-edge'; edge: Edge }
  | { type: 'delete-lane'; lane: Swimlane }
  | null;

export function NetworkAdmin() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [lanes, setLanes] = useState<Swimlane[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [activeSection, setActiveSection] = useState<'nodes' | 'edges' | 'lanes'>('nodes');
  const [orgRoles, setOrgRoles] = useState<{ value: string; label: string; color: string }[]>([]);

  // Edge filter state
  const [edgeSearch, setEdgeSearch] = useState('');
  const [edgeNodeFilter, setEdgeNodeFilter] = useState('');
  const [edgeTypeFilter, setEdgeTypeFilter] = useState<Set<'cross' | 'feedback' | 'upward'>>(new Set());

  // suppress unused warning — user is used by RLS implicitly
  void user;

  async function load() {
    const [{ data: lData }, { data: nData }, { data: eData }] = await Promise.all([
      supabase.from('network_swimlanes').select('*').order('sort_order'),
      supabase.from('network_nodes').select('*').order('sort_order'),
      supabase.from('network_edges').select('*').order('sort_order'),
    ]);
    setLanes((lData || []) as Swimlane[]);
    setNodes((nData || []) as Node[]);
    setEdges((eData || []) as Edge[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    supabase.from('org_chart_data').select('roles').maybeSingle().then(({ data }) => {
      if (!data?.roles) return;
      const roles = data.roles as Record<string, { label: string; color: string; isCenterZone?: boolean }>;
      const list = Object.entries(roles)
        .filter(([, r]) => !r.isCenterZone)
        .map(([, r]) => ({ value: r.label, label: r.label, color: r.color }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setOrgRoles(list);
    });
  }, []);

  // ── Node CRUD ──────────────────────────────────────────────────────────────

  // After any add/delete, evenly space all nodes in the affected lane horizontally,
  // keeping each node's width unchanged and vertically centering it in the lane.
  async function reLayoutLane(laneId: string, currentNodes: Node[]) {
    const lane = lanes.find(l => l.id === laneId);
    if (!lane) return;
    const laneNodes = currentNodes
      .filter(n => n.swimlane_id === laneId)
      .sort((a, b) => a.sort_order - b.sort_order || a.x - b.x);
    if (laneNodes.length === 0) return;

    const OWNER_W = 26; // vertical label strip rendered in NetworkMap
    const LANE_PAD = 10;
    const MIN_GAP = 4;
    const contentX = lane.x + OWNER_W + LANE_PAD;
    const contentW = lane.w - OWNER_W - LANE_PAD * 2;
    const totalNodeW = laneNodes.reduce((s, n) => s + n.w, 0);
    const totalGap = Math.max(MIN_GAP, (contentW - totalNodeW) / (laneNodes.length + 1));
    let cursor = contentX + totalGap;

    const updates = laneNodes.map(n => {
      const nx = Math.round(cursor);
      const ny = lane.y + Math.round((lane.h - n.h) / 2);
      cursor += n.w + totalGap;
      return supabase.from('network_nodes').update({ x: nx, y: ny }).eq('id', n.id);
    });

    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);
    if (failed?.error) showToast('Layout update failed: ' + failed.error.message, 'error');

    // Clear stale custom_path on any edges touching repositioned nodes
    const keys = laneNodes.map(n => n.node_key);
    if (keys.length > 0) {
      await supabase.from('network_edges')
        .update({ custom_path: null })
        .or(keys.map(k => `from_node_key.eq.${k},to_node_key.eq.${k}`).join(','));
    }
  }

  async function addNode(form: NodeForm) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { json_text: _jt, ...dbForm } = form;
    const { error } = await supabase.from('network_nodes').insert([dbForm]);
    if (error) { showToast('Failed to add node: ' + error.message, 'error'); return; }
    const { data } = await supabase.from('network_nodes').select('*').eq('swimlane_id', form.swimlane_id);
    await reLayoutLane(form.swimlane_id, (data as Node[]) || []);
    showToast('Node added'); setModal(null); await load();
  }

  async function updateNode(id: string, form: NodeForm) {
    const prevNode = nodes.find(n => n.id === id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { json_text: _jt, ...dbForm } = form;
    const { error } = await supabase.from('network_nodes').update(dbForm).eq('id', id);
    if (error) { showToast('Failed to update node: ' + error.message, 'error'); return; }
    const { data: allNodes } = await supabase.from('network_nodes').select('*');
    const all = (allNodes as Node[]) || [];
    if (prevNode && prevNode.swimlane_id !== form.swimlane_id) {
      await reLayoutLane(prevNode.swimlane_id, all.filter(n => n.id !== id));
    }
    await reLayoutLane(form.swimlane_id, all);
    showToast('Node updated'); setModal(null); await load();
  }

  async function reorderNode(node: Node, direction: 'up' | 'down') {
    const laneNodes = nodes
      .filter(n => n.swimlane_id === node.swimlane_id)
      .sort((a, b) => a.sort_order - b.sort_order || a.x - b.x);
    const idx = laneNodes.findIndex(n => n.id === node.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= laneNodes.length) return;

    // Normalize sort_order to 0,1,2,... so swapping always produces distinct values
    const normalizeUpdates = laneNodes.map((n, i) =>
      supabase.from('network_nodes').update({ sort_order: i }).eq('id', n.id)
    );
    const normalizeResults = await Promise.all(normalizeUpdates);
    const normFailed = normalizeResults.find(r => r.error);
    if (normFailed?.error) { showToast('Reorder failed: ' + normFailed.error.message, 'error'); return; }

    // Now swap the two adjacent normalized values
    const updates = await Promise.all([
      supabase.from('network_nodes').update({ sort_order: swapIdx }).eq('id', laneNodes[idx].id),
      supabase.from('network_nodes').update({ sort_order: idx }).eq('id', laneNodes[swapIdx].id),
    ]);
    const failed = updates.find(r => r.error);
    if (failed?.error) { showToast('Reorder failed: ' + failed.error.message, 'error'); return; }

    const { data } = await supabase.from('network_nodes').select('*').eq('swimlane_id', node.swimlane_id);
    await reLayoutLane(node.swimlane_id, (data as Node[]) || []);
    await load();
  }

  async function deleteNode(node: Node) {
    // Explicitly remove any edges referencing this node before deleting it
    await supabase.from('network_edges')
      .delete()
      .or(`from_node_key.eq.${node.node_key},to_node_key.eq.${node.node_key}`);
    const { error } = await supabase.from('network_nodes').delete().eq('id', node.id);
    if (error) { showToast('Failed to delete: ' + error.message, 'error'); return; }
    const { data } = await supabase.from('network_nodes').select('*').eq('swimlane_id', node.swimlane_id);
    await reLayoutLane(node.swimlane_id, (data as Node[]) || []);
    showToast('Node deleted'); setModal(null); await load();
  }

  // ── Edge CRUD ──────────────────────────────────────────────────────────────

  async function addEdge(form: EdgeForm) {
    const { error } = await supabase.from('network_edges').insert([form]);
    if (error) { showToast('Failed to add connection: ' + error.message, 'error'); return; }
    showToast('Connection added'); setModal(null); await load();
  }

  async function updateEdge(id: string, form: EdgeForm) {
    const { error } = await supabase.from('network_edges').update(form).eq('id', id);
    if (error) { showToast('Failed to update connection: ' + error.message, 'error'); return; }
    showToast('Connection updated'); setModal(null); await load();
  }

  async function deleteEdge(edge: Edge) {
    const { error } = await supabase.from('network_edges').delete().eq('id', edge.id);
    if (error) { showToast('Failed to delete: ' + error.message, 'error'); return; }
    showToast('Connection deleted'); setModal(null); await load();
  }

  // ── Lane CRUD ──────────────────────────────────────────────────────────────

  // Restack all swimlane y-positions from scratch based on their sort_order,
  // then shift every node inside each lane to match the new y offset.
  async function reStackLanes(orderedLanes: Swimlane[]) {
    const FIRST_Y = 28;
    const GAP = 20;
    let cursor = FIRST_Y;
    const laneUpdates = orderedLanes.map(lane => {
      const newY = cursor;
      cursor += lane.h + GAP;
      return { id: lane.id, y: newY, oldY: lane.y };
    });

    await Promise.all(
      laneUpdates.map(u => supabase.from('network_swimlanes').update({ y: u.y }).eq('id', u.id))
    );

    // Shift all nodes in each lane by the same delta
    const { data: allNodes } = await supabase.from('network_nodes').select('*');
    const nodeUpdates: Promise<unknown>[] = [];
    for (const lu of laneUpdates) {
      const delta = lu.y - lu.oldY;
      if (delta === 0) continue;
      ((allNodes || []) as Node[])
        .filter(n => n.swimlane_id === lu.id)
        .forEach(n => {
          nodeUpdates.push(
            supabase.from('network_nodes').update({ y: n.y + delta }).eq('id', n.id)
          );
        });
    }
    if (nodeUpdates.length > 0) await Promise.all(nodeUpdates);
  }

  async function reorderLane(lane: Swimlane, direction: 'up' | 'down') {
    const sorted = [...lanes].sort((a, b) => a.sort_order - b.sort_order || a.y - b.y);
    const idx = sorted.findIndex(l => l.id === lane.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    // Normalize sort_order values first to guarantee distinct values
    const normalizeUpdates = sorted.map((l, i) =>
      supabase.from('network_swimlanes').update({ sort_order: i }).eq('id', l.id)
    );
    await Promise.all(normalizeUpdates);

    // Swap the two adjacent sort_order values
    await Promise.all([
      supabase.from('network_swimlanes').update({ sort_order: swapIdx }).eq('id', sorted[idx].id),
      supabase.from('network_swimlanes').update({ sort_order: idx }).eq('id', sorted[swapIdx].id),
    ]);

    // Rebuild the ordered list after swap and restack y positions
    const reordered = [...sorted];
    reordered[idx] = { ...sorted[idx], sort_order: swapIdx };
    reordered[swapIdx] = { ...sorted[swapIdx], sort_order: idx };
    reordered.sort((a, b) => a.sort_order - b.sort_order);
    await reStackLanes(reordered);
    await load();
  }

  async function addLane(form: LaneForm) {
    const { error } = await supabase.from('network_swimlanes').insert([form]);
    if (error) { showToast('Failed to add swimlane: ' + error.message, 'error'); return; }
    showToast('Swimlane added'); setModal(null); await load();
  }

  async function updateLane(id: string, form: LaneForm) {
    const { error } = await supabase.from('network_swimlanes').update(form).eq('id', id);
    if (error) { showToast('Failed to update swimlane: ' + error.message, 'error'); return; }
    showToast('Swimlane updated'); setModal(null); await load();
  }

  async function deleteLane(lane: Swimlane) {
    const { error } = await supabase.from('network_swimlanes').delete().eq('id', lane.id);
    if (error) { showToast('Failed to delete: ' + error.message, 'error'); return; }
    showToast('Swimlane deleted'); setModal(null); await load();
  }

  const [relaying, setRelaying] = useState(false);

  async function resetAllLayouts() {
    setRelaying(true);
    const { data } = await supabase.from('network_nodes').select('*');
    const all = (data as Node[]) || [];
    // Auto-size every node from its label before re-centering
    const sizeUpdates = all.map(n => {
      const dims = autoSizeDims(n.label);
      return supabase.from('network_nodes').update({ w: dims.w, h: dims.h }).eq('id', n.id);
    });
    await Promise.all(sizeUpdates);
    // Fetch updated nodes so reLayoutLane sees the new dimensions
    const { data: refreshed } = await supabase.from('network_nodes').select('*');
    const resized = (refreshed as Node[]) || [];
    await Promise.all(lanes.map(l => reLayoutLane(l.id, resized)));
    await load();
    showToast('All lanes re-sized and re-centered');
    setRelaying(false);
  }

  const laneById = Object.fromEntries(lanes.map(l => [l.id, l]));
  const nodeByKey = Object.fromEntries(nodes.map(n => [n.node_key, n]));
  const maxY = lanes.length > 0 ? Math.max(...lanes.map(l => l.y + l.h)) : 480;

  const filteredEdges = useMemo(() => {
    const q = edgeSearch.trim().toLowerCase();
    return edges.filter(e => {
      const fLabel = (nodeByKey[e.from_node_key]?.label || e.from_node_key).replace(/\n/g, ' ').toLowerCase();
      const tLabel = (nodeByKey[e.to_node_key]?.label || e.to_node_key).replace(/\n/g, ' ').toLowerCase();
      if (q && !fLabel.includes(q) && !tLabel.includes(q) &&
          !e.from_node_key.toLowerCase().includes(q) && !e.to_node_key.toLowerCase().includes(q)) return false;
      if (edgeNodeFilter && e.from_node_key !== edgeNodeFilter && e.to_node_key !== edgeNodeFilter) return false;
      if (edgeTypeFilter.size > 0) {
        const matchCross    = edgeTypeFilter.has('cross')    && e.is_cross;
        const matchFeedback = edgeTypeFilter.has('feedback') && e.is_feedback;
        const matchUpward   = edgeTypeFilter.has('upward')   && e.is_upward;
        if (!matchCross && !matchFeedback && !matchUpward) return false;
      }
      return true;
    }).sort((a, b) => {
      const aLabel = (nodeByKey[a.from_node_key]?.label || a.from_node_key).replace(/\n/g, ' ');
      const bLabel = (nodeByKey[b.from_node_key]?.label || b.from_node_key).replace(/\n/g, ' ');
      return aLabel.localeCompare(bLabel);
    });
  }, [edges, edgeSearch, edgeNodeFilter, edgeTypeFilter, nodeByKey]);

  const sectionTabs = [
    { id: 'nodes' as const, label: 'Nodes', count: nodes.length },
    { id: 'edges' as const, label: 'Connections', count: edges.length },
    { id: 'lanes' as const, label: 'Swimlanes', count: lanes.length },
  ];

  if (loading) return <div style={{ padding: '20px', color: '#9C8878', fontSize: '12px' }}>Loading network data...</div>;

  return (
    <div>
      {/* Section tabs + add button */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
        {sectionTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSection(t.id)}
            style={{ padding: '6px 14px', borderRadius: '7px', border: '1px solid', borderColor: activeSection === t.id ? '#1F1D1C' : '#E4E2D6', background: activeSection === t.id ? '#1F1D1C' : '#fff', color: activeSection === t.id ? '#fff' : '#6A453A', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif' }}
          >
            {t.label}
            <span style={{ marginLeft: '5px', opacity: 0.6, fontSize: '10px' }}>({t.count})</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {activeSection === 'nodes' && (
          <>
            <button onClick={resetAllLayouts} disabled={relaying} title="Re-center all nodes within their swimlanes" style={{ padding: '6px 14px', borderRadius: '7px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', fontSize: '11px', fontWeight: 700, cursor: relaying ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '5px', opacity: relaying ? 0.5 : 1 }}>
              <AlignCenter size={12} /> {relaying ? 'Resetting...' : 'Reset Layout'}
            </button>
            <button onClick={() => setModal({ type: 'add-node' })} style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: '#1A7895', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Plus size={12} /> Add Node
            </button>
          </>
        )}
        {activeSection === 'edges' && (
          <button onClick={() => setModal({ type: 'add-edge' })} style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: '#534AB7', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Link size={12} /> Add Connection
          </button>
        )}
        {activeSection === 'lanes' && (
          <button onClick={() => setModal({ type: 'add-lane' })} style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: '#0F6E56', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Layers size={12} /> Add Swimlane
          </button>
        )}
      </div>

      {/* ── Nodes list ────────────────────────────────────────────────────────── */}
      {activeSection === 'nodes' && (
        <div>
          {lanes.map(lane => {
            const laneNodes = nodes
              .filter(n => n.swimlane_id === lane.id)
              .sort((a, b) => a.sort_order - b.sort_order || a.x - b.x);
            if (laneNodes.length === 0) return null;
            const cl = COLOR_OPTIONS.find(c => c.key === lane.color_key);
            return (
              <div key={lane.id} style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: cl?.color || '#9C8878', marginBottom: '6px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {lane.label}
                  {lane.min_role === 'executive' && (
                    <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: '#FEF3CC', color: '#7A5500', border: '1px solid #FABE3D' }}>EXEC ONLY</span>
                  )}
                  {lane.min_role === 'jsp_admin' && (
                    <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: '#D6EAF3', color: '#1A4F66', border: '1px solid #7BB8D4' }}>JSP ADMIN+</span>
                  )}
                  <span style={{ fontSize: '9px', color: '#C8C4B4', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— drag order = left-to-right on map</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {laneNodes.map((n, i) => (
                    <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '7px', background: '#F2F1E9', border: '1px solid #E4E2D6' }}>
                      {/* Order controls */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flexShrink: 0 }}>
                        <button
                          onClick={() => reorderNode(n, 'up')}
                          disabled={i === 0}
                          title="Move left"
                          style={{ padding: '2px 4px', border: '1px solid #E4E2D6', borderRadius: '3px', background: i === 0 ? '#F9F9F5' : '#fff', cursor: i === 0 ? 'default' : 'pointer', color: '#9C8878', display: 'flex', alignItems: 'center', opacity: i === 0 ? 0.3 : 1, lineHeight: 1 }}
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => reorderNode(n, 'down')}
                          disabled={i === laneNodes.length - 1}
                          title="Move right"
                          style={{ padding: '2px 4px', border: '1px solid #E4E2D6', borderRadius: '3px', background: i === laneNodes.length - 1 ? '#F9F9F5' : '#fff', cursor: i === laneNodes.length - 1 ? 'default' : 'pointer', color: '#9C8878', display: 'flex', alignItems: 'center', opacity: i === laneNodes.length - 1 ? 0.3 : 1, lineHeight: 1 }}
                        >
                          ▼
                        </button>
                      </div>
                      <div style={{ width: '20px', textAlign: 'center', fontSize: '9px', color: '#C8C4B4', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1F1D1C', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '1px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {n.label.replace(/\n/g, ' ')}
                          {n.has_sub_nodes && (
                            <span style={{ fontSize: '8px', padding: '1px 6px', borderRadius: '3px', background: '#EDF6F9', color: '#0D4D60', border: '1px solid #1A789540', fontWeight: 700 }}>sub-nodes</span>
                          )}
                          {n.json_data && (
                            <span style={{ fontSize: '8px', padding: '1px 6px', borderRadius: '3px', background: '#F0FAF5', color: '#085041', border: '1px solid #0F6E5640', fontWeight: 700 }}>JSON</span>
                          )}
                        </div>
                        <div style={{ fontSize: '9px', color: '#9C8878' }}>key: {n.node_key} · w: {n.w}px</div>
                        {n.description && <div style={{ fontSize: '10px', color: '#6A453A', marginTop: '1px' }}>{n.description}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                        <button onClick={() => setModal({ type: 'edit-node', node: n })} title="Edit node" style={{ padding: '4px', border: '1px solid #E4E2D6', borderRadius: '5px', background: '#fff', cursor: 'pointer', color: '#6A453A', display: 'flex', alignItems: 'center' }}>
                          <Pencil size={11} />
                        </button>
                        <button onClick={() => setModal({ type: 'delete-node', node: n })} title="Delete node" style={{ padding: '4px', border: 'none', borderRadius: '5px', background: 'none', cursor: 'pointer', color: '#CC3B2B', display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edges list ────────────────────────────────────────────────────────── */}
      {activeSection === 'edges' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* Filter bar */}
          <div style={{ background: '#fff', border: '1px solid #E4E2D6', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Row 1: text search + node filter */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '2 1 180px' }}>
                <input
                  type="text"
                  value={edgeSearch}
                  onChange={e => setEdgeSearch(e.target.value)}
                  placeholder="Search node names or keys..."
                  style={{ width: '100%', padding: '7px 28px 7px 10px', border: '1px solid #E4E2D6', borderRadius: '6px', fontSize: '11px', fontFamily: 'Verdana,sans-serif', color: '#1F1D1C', boxSizing: 'border-box', outline: 'none' }}
                />
                {edgeSearch && (
                  <button onClick={() => setEdgeSearch('')} style={{ position: 'absolute', right: '7px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#9C8878', padding: 0, display: 'flex', alignItems: 'center' }}>
                    <X size={12} />
                  </button>
                )}
              </div>
              <div style={{ flex: '3 1 200px' }}>
                <select
                  value={edgeNodeFilter}
                  onChange={e => setEdgeNodeFilter(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', border: '1px solid #E4E2D6', borderRadius: '6px', fontSize: '11px', fontFamily: 'Verdana,sans-serif', color: edgeNodeFilter ? '#1F1D1C' : '#9C8878', boxSizing: 'border-box', outline: 'none', background: '#fff' }}
                >
                  <option value="">All nodes</option>
                  {[...nodes].sort((a, b) => a.label.localeCompare(b.label)).map(n => (
                    <option key={n.node_key} value={n.node_key}>{n.label.replace(/\n/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: type toggles + result count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9C8878', fontFamily: 'Verdana,sans-serif', marginRight: '2px' }}>Type:</span>
              {([
                { key: 'cross'    as const, label: 'Cross-lane', bg: '#EEF',     tc: '#534AB7', border: '#C9C6F0' },
                { key: 'feedback' as const, label: 'Feedback',   bg: '#FEF3CC',  tc: '#7A5500', border: '#FABE3D' },
                { key: 'upward'   as const, label: 'Upward',     bg: '#F0FAF5',  tc: '#085041', border: '#0F6E5640' },
              ]).map(({ key, label, bg, tc, border }) => {
                const active = edgeTypeFilter.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => setEdgeTypeFilter(prev => {
                      const next = new Set(prev);
                      if (next.has(key)) next.delete(key); else next.add(key);
                      return next;
                    })}
                    style={{
                      padding: '3px 10px', borderRadius: '4px', cursor: 'pointer',
                      fontSize: '9px', fontWeight: 700, fontFamily: 'Verdana,sans-serif',
                      border: `1.5px solid ${active ? border : '#E4E2D6'}`,
                      background: active ? bg : '#F9F8F4',
                      color: active ? tc : '#9C8878',
                      transition: 'all .12s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: '10px', color: '#9C8878', fontFamily: 'Verdana,sans-serif' }}>
                {filteredEdges.length === edges.length
                  ? `${edges.length} connection${edges.length !== 1 ? 's' : ''}`
                  : `${filteredEdges.length} of ${edges.length}`}
              </span>
              {(edgeSearch || edgeNodeFilter || edgeTypeFilter.size > 0) && (
                <button
                  onClick={() => { setEdgeSearch(''); setEdgeNodeFilter(''); setEdgeTypeFilter(new Set()); }}
                  style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', fontSize: '9px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif' }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {filteredEdges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px', color: '#9C8878', fontSize: '12px', fontFamily: 'Verdana,sans-serif' }}>
              No connections match the current filters.
            </div>
          ) : (
            filteredEdges.map(e => {
              const fNode = nodeByKey[e.from_node_key];
              const tNode = nodeByKey[e.to_node_key];
              const fSwim = fNode ? laneById[fNode.swimlane_id] : null;
              const tSwim = tNode ? laneById[tNode.swimlane_id] : null;
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '7px', background: '#F2F1E9', border: '1px solid #E4E2D6' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', color: '#1F1D1C', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>
                      <span style={{ fontWeight: 700 }}>{fNode?.label.replace(/\n/g,' ') || e.from_node_key}</span>
                      <span style={{ color: '#9C8878', margin: '0 6px' }}>→</span>
                      <span style={{ fontWeight: 700 }}>{tNode?.label.replace(/\n/g,' ') || e.to_node_key}</span>
                    </div>
                    {(fSwim || tSwim) && (
                      <div style={{ fontSize: '9px', color: '#C8C4B4', marginTop: '2px', fontFamily: 'Verdana,sans-serif' }}>
                        {fSwim?.label || '?'} → {tSwim?.label || '?'}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {e.is_cross && <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: '#EEF', color: '#534AB7', border: '1px solid #C9C6F0' }}>cross</span>}
                    {e.is_feedback && <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: '#FEF3CC', color: '#7A5500', border: '1px solid #FABE3D' }}>feedback</span>}
                    {e.is_upward && <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: '#F0FAF5', color: '#085041', border: '1px solid #0F6E5640' }}>upward</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                    <button onClick={() => setModal({ type: 'edit-edge', edge: e })} title="Edit connection" style={{ padding: '4px', border: '1px solid #E4E2D6', borderRadius: '5px', background: '#fff', cursor: 'pointer', color: '#6A453A', display: 'flex', alignItems: 'center' }}>
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => setModal({ type: 'delete-edge', edge: e })} title="Delete connection" style={{ padding: '4px', border: 'none', borderRadius: '5px', background: 'none', cursor: 'pointer', color: '#CC3B2B', display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Swimlanes list ────────────────────────────────────────────────────── */}
      {activeSection === 'lanes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '9px', color: '#C8C4B4', marginBottom: '2px', fontFamily: 'Verdana,sans-serif' }}>
            — drag order = top-to-bottom on map
          </div>
          {[...lanes].sort((a, b) => a.sort_order - b.sort_order || a.y - b.y).map((lane, i, sorted) => {
            const cl = COLOR_OPTIONS.find(c => c.key === lane.color_key);
            const nodeCount = nodes.filter(n => n.swimlane_id === lane.id).length;
            const isFirst = i === 0;
            const isLast = i === sorted.length - 1;
            return (
              <div key={lane.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', background: '#F2F1E9', border: '1px solid #E4E2D6' }}>
                {/* Reorder controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flexShrink: 0 }}>
                  <button
                    onClick={() => reorderLane(lane, 'up')}
                    disabled={isFirst}
                    title="Move up"
                    style={{ padding: '2px 4px', border: '1px solid #E4E2D6', borderRadius: '3px', background: isFirst ? '#F9F9F5' : '#fff', cursor: isFirst ? 'default' : 'pointer', color: '#9C8878', display: 'flex', alignItems: 'center', opacity: isFirst ? 0.3 : 1, lineHeight: 1 }}
                  >▲</button>
                  <button
                    onClick={() => reorderLane(lane, 'down')}
                    disabled={isLast}
                    title="Move down"
                    style={{ padding: '2px 4px', border: '1px solid #E4E2D6', borderRadius: '3px', background: isLast ? '#F9F9F5' : '#fff', cursor: isLast ? 'default' : 'pointer', color: '#9C8878', display: 'flex', alignItems: 'center', opacity: isLast ? 0.3 : 1, lineHeight: 1 }}
                  >▼</button>
                </div>
                <div style={{ width: '20px', textAlign: 'center', fontSize: '9px', color: '#C8C4B4', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: cl?.color || '#ccc', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1F1D1C', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '1px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {lane.parent_node_key && <span style={{ fontSize: '10px', color: '#9C8878' }}>↳</span>}
                    {lane.label}
                    {lane.min_role === 'executive' && <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: '#FEF3CC', color: '#7A5500', border: '1px solid #FABE3D' }}>EXEC ONLY</span>}
                    {lane.min_role === 'jsp_admin' && <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: '#D6EAF3', color: '#1A4F66', border: '1px solid #7BB8D4' }}>JSP ADMIN+</span>}
                    {lane.parent_node_key && <span style={{ fontSize: '8px', padding: '1px 6px', borderRadius: '3px', background: '#EDF6F9', color: '#0D4D60', border: '1px solid #1A789540' }}>child of {lane.parent_node_key}</span>}
                    {lane.is_collapsible && <span style={{ fontSize: '8px', padding: '1px 6px', borderRadius: '3px', background: '#F2F1E9', color: '#6A453A', border: '1px solid #C8C4B4' }}>collapsible</span>}
                  </div>
                  <div style={{ fontSize: '9px', color: '#9C8878' }}>badge: {lane.badge} · y:{lane.y} h:{lane.h} · {nodeCount} node{nodeCount !== 1 ? 's' : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                  <button onClick={() => setModal({ type: 'edit-lane', lane })} title="Edit swimlane" style={{ padding: '4px', border: '1px solid #E4E2D6', borderRadius: '5px', background: '#fff', cursor: 'pointer', color: '#6A453A', display: 'flex', alignItems: 'center' }}>
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={() => nodeCount === 0 && setModal({ type: 'delete-lane', lane })}
                    title={nodeCount > 0 ? 'Delete all nodes in this lane first' : 'Delete swimlane'}
                    disabled={nodeCount > 0}
                    style={{ padding: '4px', border: 'none', borderRadius: '5px', background: 'none', cursor: nodeCount > 0 ? 'not-allowed' : 'pointer', color: '#CC3B2B', display: 'flex', alignItems: 'center', opacity: nodeCount > 0 ? 0.2 : 0.6 }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {modal?.type === 'add-node'   && <AddNodeModal lanes={lanes} nodes={nodes} onSave={addNode} onClose={() => setModal(null)} orgRoles={orgRoles} />}
      {modal?.type === 'edit-node'  && <EditNodeModal node={modal.node} lanes={lanes} nodes={nodes} onSave={updateNode} onClose={() => setModal(null)} orgRoles={orgRoles} />}
      {modal?.type === 'add-edge'   && <AddEdgeModal nodes={nodes} onSave={addEdge} onClose={() => setModal(null)} />}
      {modal?.type === 'edit-edge'  && <EditEdgeModal edge={modal.edge} nodes={nodes} onSave={updateEdge} onClose={() => setModal(null)} />}
      {modal?.type === 'add-lane'   && <AddLaneModal onSave={addLane} onClose={() => setModal(null)} currentMaxY={maxY} nodes={nodes} />}
      {modal?.type === 'edit-lane'  && <EditLaneModal lane={modal.lane} onSave={updateLane} onClose={() => setModal(null)} nodes={nodes} />}

      {modal?.type === 'delete-node' && (
        <DeleteConfirm label={modal.node.label.replace(/\n/g,' ')} onConfirm={() => deleteNode(modal.node)} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'delete-edge' && (
        <DeleteConfirm
          label={`${nodeByKey[modal.edge.from_node_key]?.label.replace(/\n/g,' ') || modal.edge.from_node_key} → ${nodeByKey[modal.edge.to_node_key]?.label.replace(/\n/g,' ') || modal.edge.to_node_key}`}
          onConfirm={() => deleteEdge(modal.edge)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'delete-lane' && (
        <DeleteConfirm label={modal.lane.label} onConfirm={() => deleteLane(modal.lane)} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
