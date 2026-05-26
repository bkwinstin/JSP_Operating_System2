import { useState, useEffect, useRef, useMemo } from 'react';
import { X, FileText, Download, Eye, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Document, Job } from '../../lib/types';
import { toDropboxDownloadUrl, toDropboxPreviewUrl } from '../../hooks/useDocuments';
import OrgChart from '../JSP_Org_Structure';

const NS = 'http://www.w3.org/2000/svg';

type ColorKey = 'emp' | 'proj' | 'ic' | 'ec' | 'bub' | 'infra' | 'exec';

const CL: Record<ColorKey, { f: string; s: string; t: string; ls: string }> = {
  emp:   { f: '#FFFBF0', s: '#BA7517', t: '#633806', ls: '#BA7517' },
  proj:  { f: '#F0FAF5', s: '#0F6E56', t: '#085041', ls: '#0F6E56' },
  ic:    { f: '#F5F4FE', s: '#534AB7', t: '#3C3489', ls: '#534AB7' },
  ec:    { f: '#FDF5F2', s: '#993C1D', t: '#712B13', ls: '#993C1D' },
  bub:   { f: '#FEF3CC', s: '#C8881A', t: '#633806', ls: '#C8881A' },
  infra: { f: '#EDF6F9', s: '#1A7895', t: '#0D4D60', ls: '#1A7895' },
  exec:  { f: '#FEF8E8', s: '#B8860B', t: '#7A5500', ls: '#B8860B' },
};

interface DBSwimlane {
  id: string; label: string; badge: string; color_key: ColorKey;
  x: number; y: number; w: number; h: number;
  sort_order: number; min_role: string;
  why_title: string; why_content: string;
  how_title: string; how_content: string;
  job_id: string | null;
  parent_node_key: string | null;
  is_collapsible: boolean;
}

interface DBNode {
  id: string; swimlane_id: string; node_key: string;
  label: string; description: string;
  x: number; y: number; w: number; h: number;
  color_key: ColorKey; is_bubble: boolean; sort_order: number;
  has_sub_nodes: boolean;
  json_data: object | null;
  node_component: string | null;
  primary_person_responsible: string | null;
  additional_persons_responsible: string[] | null;
  why: string | null;
}

interface DBEdge {
  id: string; from_node_key: string; to_node_key: string;
  is_cross: boolean; is_feedback: boolean; is_upward: boolean;
  v_midpoint: number | null; custom_path: string | null;
}

interface DBNodeGroup {
  id: string; swimlane_id: string; label: string;
  node_keys: string[]; color_key: ColorKey; sort_order: number;
}

interface NetworkMapProps { onClose: () => void; }

interface CatalystInfo {
  id: string;
  why_title: string;
  why_content: string;
  how_title: string;
  how_content: string;
}

function ncx(n: DBNode) { return n.x + n.w / 2; }
function ncy(n: DBNode) { return n.y + n.h / 2; }

function edgePath(e: DBEdge, idx: Record<string, DBNode>): string | null {
  const s = idx[e.from_node_key], t = idx[e.to_node_key];
  if (!s || !t) return null;
  if (e.custom_path) return e.custom_path;
  const sy = ncy(s), tx = ncx(t), ty = ncy(t);
  if (!e.is_cross) {
    const x1 = s.x + s.w, y1 = sy, x2 = t.x, y2 = ty;
    if (x2 < x1 + 4) return null;
    const mx = (x1 + x2) / 2;
    return `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
  }
  const v = e.v_midpoint ?? Math.round((ncy(s) + ncy(t)) / 2);
  const sIsFC = e.from_node_key === 'field_catalyst', tIsFC = e.to_node_key === 'field_catalyst';
  // For field_catalyst, collapse entry/exit to center since it has no top/bottom edge semantics
  const sEntry = sIsFC ? ncy(s) : s.y;
  const sExit  = sIsFC ? ncy(s) : s.y + s.h;
  const tEntry = tIsFC ? ncy(t) : t.y;
  const tExit  = tIsFC ? ncy(t) : t.y + t.h;
  if (e.is_upward) {
    // When target is field_catalyst and upward, reverse path so arrowhead points at source top
    if (tIsFC) return `M${tx} ${ncy(t)} C${tx} ${v} ${ncx(s)} ${v} ${ncx(s)} ${sEntry}`;
    return `M${ncx(s)} ${sEntry} C${ncx(s)} ${v} ${tx} ${v} ${tx} ${tExit}`;
  }
  return `M${ncx(s)} ${sExit} C${ncx(s)} ${v} ${tx} ${v} ${tx} ${tEntry}`;
}

// ── Doc preview modal ─────────────────────────────────────────────────────────
function DocPreviewModal({ doc, onClose }: { doc: Document; onClose: () => void }) {
  const previewUrl = doc.dropbox_url ? toDropboxPreviewUrl(doc.dropbox_url) : null;
  const downloadUrl = doc.dropbox_url ? toDropboxDownloadUrl(doc.dropbox_url) : null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(31,29,28,.65)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(31,29,28,.32)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #E4E2D6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F2F1E9', border: '1px solid #E4E2D6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={18} color="#9C8878" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#1F1D1C', lineHeight: 1.25, marginBottom: '3px' }}>{doc.name}</div>
              {doc.description && <div style={{ fontSize: '11px', color: '#9C8878', lineHeight: 1.4 }}>{doc.description}</div>}
            </div>
          </div>
          <button onClick={onClose} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {previewUrl && (
            <a href={previewUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', borderRadius: '9px', background: '#0061FF', color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'Verdana,sans-serif', textDecoration: 'none' }}>
              <Eye size={15} /> Preview in Dropbox
            </a>
          )}
          {downloadUrl && (
            <a href={downloadUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', borderRadius: '9px', background: '#F2F1E9', border: '1px solid #E4E2D6', color: '#1F1D1C', fontSize: '13px', fontWeight: 700, fontFamily: 'Verdana,sans-serif', textDecoration: 'none' }}>
              <Download size={15} /> Download File
            </a>
          )}
          {!previewUrl && !downloadUrl && (
            <div style={{ textAlign: 'center', padding: '16px', color: '#9C8878', fontSize: '12px' }}>No file linked</div>
          )}
          <div style={{ fontSize: '10px', color: '#C8C4B4', textAlign: 'center' }}>Opens in a new tab via Dropbox</div>
        </div>
      </div>
    </div>
  );
}

// ── JSON viewer ───────────────────────────────────────────────────────────────
function JsonViewer({ data, color }: { data: object; color: string }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']));

  function toggle(path: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  }

  function renderValue(val: unknown, path: string, depth: number): React.ReactNode {
    const indent = depth * 14;
    if (val === null) return <span style={{ color: '#9C8878', fontStyle: 'italic' }}>null</span>;
    if (typeof val === 'boolean') return <span style={{ color: '#0F6E56', fontWeight: 700 }}>{String(val)}</span>;
    if (typeof val === 'number') return <span style={{ color: '#1A7895', fontWeight: 700 }}>{val}</span>;
    if (typeof val === 'string') return <span style={{ color: '#633806' }}>"{val}"</span>;

    if (Array.isArray(val)) {
      const isOpen = expanded.has(path);
      if (val.length === 0) return <span style={{ color: '#9C8878' }}>[]</span>;
      return (
        <span>
          <button onClick={() => toggle(path)} style={{ background: 'none', border: 'none', cursor: 'pointer', color, padding: '0 2px', fontSize: '10px', fontWeight: 700 }}>
            {isOpen ? '▾' : '▸'} [{val.length}]
          </button>
          {isOpen && (
            <div style={{ marginLeft: indent + 14 }}>
              {val.map((item, i) => (
                <div key={i} style={{ paddingTop: '2px' }}>
                  <span style={{ color: '#C8C4B4', fontSize: '9px', marginRight: '6px' }}>{i}</span>
                  {renderValue(item, `${path}[${i}]`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </span>
      );
    }

    if (typeof val === 'object') {
      const keys = Object.keys(val as Record<string, unknown>);
      const isOpen = expanded.has(path);
      if (keys.length === 0) return <span style={{ color: '#9C8878' }}>{'{}'}</span>;
      return (
        <span>
          <button onClick={() => toggle(path)} style={{ background: 'none', border: 'none', cursor: 'pointer', color, padding: '0 2px', fontSize: '10px', fontWeight: 700 }}>
            {isOpen ? '▾' : '▸'} {'{'}…{'}'}
          </button>
          {isOpen && (
            <div style={{ marginLeft: 14 }}>
              {keys.map(k => (
                <div key={k} style={{ paddingTop: '3px', display: 'flex', alignItems: 'flex-start', gap: '4px', flexWrap: 'wrap' }}>
                  <span style={{ color, fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>{k}:</span>
                  <span style={{ fontSize: '11px', fontFamily: '"Courier New",monospace' }}>
                    {renderValue((val as Record<string, unknown>)[k], `${path}.${k}`, depth + 1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </span>
      );
    }
    return null;
  }

  const keys = Object.keys(data);
  const isOpen = expanded.has('root');

  return (
    <div style={{ background: '#FAFAF7', border: '1px solid #E4E2D6', borderRadius: '8px', padding: '12px 14px', fontSize: '11px', fontFamily: '"Courier New",monospace', lineHeight: 1.7, overflow: 'auto', maxHeight: '360px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: isOpen ? '8px' : 0 }}>
        <button onClick={() => toggle('root')} style={{ background: 'none', border: 'none', cursor: 'pointer', color, padding: '0 2px', fontSize: '11px', fontWeight: 700 }}>
          {isOpen ? '▾' : '▸'}
        </button>
        <span style={{ color: '#9C8878', fontSize: '10px' }}>{keys.length} field{keys.length !== 1 ? 's' : ''}</span>
      </div>
      {isOpen && keys.map(k => (
        <div key={k} style={{ paddingTop: '3px', display: 'flex', alignItems: 'flex-start', gap: '4px', flexWrap: 'wrap' }}>
          <span style={{ color, fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>{k}:</span>
          <span style={{ fontSize: '11px' }}>
            {renderValue((data as Record<string, unknown>)[k], `root.${k}`, 1)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Node drawer content ───────────────────────────────────────────────────────
function NodeDrawerContent({ node, docs, canSee, connectedNames, onPreview }: {
  node: DBNode;
  docs: Document[];
  canSee: (d: Document) => boolean;
  connectedNames: string[];
  onPreview: (d: Document) => void;
}) {
  const cl = CL[node.color_key] || CL.emp;
  const visibleDocs = docs.filter(d => canSee(d));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Node identity */}
      <div style={{ padding: '16px', borderRadius: '10px', background: cl.f, border: `1.5px solid ${cl.s}` }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: cl.t, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', lineHeight: 1.3, marginBottom: '6px' }}>
          {node.label.replace(/\\N|\n/g, ' ')}
        </div>
        {node.description && (
          <div style={{ fontSize: '12px', color: cl.t, opacity: 0.8, lineHeight: 1.5 }}>{node.description}</div>
        )}
        {connectedNames.length > 0 && (
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${cl.s}25` }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: cl.ls, opacity: 0.7, marginBottom: '5px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>Connects to</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {connectedNames.map(n => (
                <span key={n} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '8px', background: `${cl.s}18`, color: cl.ls, fontWeight: 600 }}>{n}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Why */}
      {!!node.why && (
        <div style={{ padding: '14px 16px', borderRadius: '10px', background: '#FAFAF7', border: `1px solid ${cl.s}30` }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: cl.ls, marginBottom: '7px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>Why</div>
          <div style={{ fontSize: '12px', color: '#3A3330', lineHeight: 1.65 }}>{node.why}</div>
        </div>
      )}

      {/* JSON Data */}
      {node.json_data && (
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9C8878', marginBottom: '8px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>
            Data
          </div>
          <JsonViewer data={node.json_data} color={cl.s} />
        </div>
      )}

      {/* Primary Person Responsible */}
      {!node.has_sub_nodes && node.primary_person_responsible && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: cl.f, border: `1px solid ${cl.s}30` }}>
          <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: cl.ls, opacity: 0.7, marginBottom: '6px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>Primary Person Responsible</div>
          <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: `${cl.s}22`, color: cl.t, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>{node.primary_person_responsible}</span>
        </div>
      )}

      {/* Additional Persons Responsible */}
      {!node.has_sub_nodes && node.additional_persons_responsible && node.additional_persons_responsible.length > 0 && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: cl.f, border: `1px solid ${cl.s}30` }}>
          <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: cl.ls, opacity: 0.7, marginBottom: '6px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>Additional Person(s) Responsible</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {node.additional_persons_responsible.map(p => (
              <span key={p} style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: `${cl.s}22`, color: cl.t, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9C8878', marginBottom: '8px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>
          Linked Documents
        </div>
        {visibleDocs.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#C8C4B4', fontStyle: 'italic', padding: '12px', textAlign: 'center', borderRadius: '8px', border: '1px dashed #E4E2D6' }}>
            No documents linked to this node yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {visibleDocs.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: '#fff', border: '1px solid #E4E2D6' }}>
                <FileText size={14} color={cl.s} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1F1D1C', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', lineHeight: 1.4 }}>{d.name}</div>
                  {d.description && <div style={{ fontSize: '10px', color: '#9C8878', marginTop: '1px', lineHeight: 1.4 }}>{d.description}</div>}
                  <div style={{ fontSize: '9px', fontWeight: 700, color: cl.ls, marginTop: '2px' }}>{d.doc_type}</div>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {d.dropbox_url && (
                    <button onClick={() => onPreview(d)} style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>
                      <Eye size={11} /> View
                    </button>
                  )}
                  {d.dropbox_url && (
                    <a href={toDropboxDownloadUrl(d.dropbox_url)} target="_blank" rel="noreferrer" style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                      <Download size={11} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Swimlane Why/How panel ────────────────────────────────────────────────────

function PrincipleAccordion({ title, body, index, light, dark, docs, canSeeDoc }: {
  title: string; body: string; index: number; color: string; light: string; dark: string;
  docs: Document[]; canSeeDoc: (d: Document) => boolean;
}) {
  const [open, setOpen] = useState(true);
  const visibleDocs = docs.filter(d => canSeeDoc(d));

  return (
    <div style={{ borderRadius: '8px', background: '#F9F8F4', border: '1px solid #E4E2D6', overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(p => !p)}
        style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '11px 13px', cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, background: light, color: dark, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginTop: '1px' }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', color: '#1F1D1C', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', lineHeight: 1.4, marginBottom: '2px' }}>
            {title}
          </div>
          {!open && visibleDocs.length > 0 && (
            <div style={{ fontSize: '9px', color: '#9C8878', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <FileText size={9} /> {visibleDocs.length} doc{visibleDocs.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <ChevronDown size={14} color="#9C8878" style={{ flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', marginTop: '4px' }} />
      </div>
      {open && (
        <div style={{ padding: '0 13px 13px 49px' }}>
          {body.split('\n\n').map((para, i, arr) => (
            <p key={i} style={{ fontSize: '12px', color: '#6A453A', lineHeight: 1.7, margin: 0, marginBottom: i < arr.length - 1 ? '8px' : 0 }}>{para}</p>
          ))}
          {visibleDocs.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {visibleDocs.map(d => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '6px', background: 'rgba(255,255,255,.8)', border: '1px solid #E4E2D6' }}>
                  <FileText size={11} color="#9C8878" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#1F1D1C', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', lineHeight: 1.4 }}>{d.name}</div>
                    {d.description && <div style={{ fontSize: '9px', color: '#9C8878', lineHeight: 1.4 }}>{d.description}</div>}
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#E4E2D6', color: '#6A453A', flexShrink: 0 }}>{d.doc_type}</span>
                  {d.dropbox_url && (
                    <a href={toDropboxDownloadUrl(d.dropbox_url)} target="_blank" rel="noreferrer" style={{ padding: '3px 7px', borderRadius: '4px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <Download size={10} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JobWhySection({ job }: { job: Job }) {
  const why = job.why;
  if (!why) return null;
  return (
    <div>
      <p style={{ fontSize: '12px', color: '#6A453A', lineHeight: 1.75, marginBottom: '14px', marginTop: 0 }}>{why.body}</p>
      <div style={{ padding: '12px 15px', borderRadius: '8px', borderLeft: `4px solid ${job.color}`, background: job.light, fontSize: '12px', lineHeight: 1.65, marginBottom: '14px', fontStyle: 'italic', color: job.dark }}>
        {why.anchor}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {(why.values || []).map(v => (
          <span key={v} style={{ fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '12px', background: job.light, color: job.dark, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

function JobHowSection({ job, canSeeDoc }: { job: Job; canSeeDoc: (d: Document) => boolean }) {
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    if (!job.function_area) return;
    supabase.from('documents').select('*').eq('function_area', job.function_area).order('name')
      .then(({ data }) => setDocs((data as Document[]) || []));
  }, [job.function_area]);

  const principles = job.howPrinciples || [];
  const docsByPrinciple: Record<string, Document[]> = {};
  docs.forEach(d => {
    if (d.principle_id) {
      if (!docsByPrinciple[d.principle_id]) docsByPrinciple[d.principle_id] = [];
      docsByPrinciple[d.principle_id].push(d);
    }
  });
  const unattached = docs.filter(d => !d.principle_id && canSeeDoc(d));

  if (principles.length === 0) return <div style={{ fontSize: '12px', color: '#9C8878', fontStyle: 'italic' }}>No principles added yet.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {principles.map((p, i) => (
        <PrincipleAccordion
          key={p.id} title={p.title} body={p.body} index={i}
          color={job.color} light={job.light} dark={job.dark}
          docs={docsByPrinciple[p.id] || []} canSeeDoc={canSeeDoc}
        />
      ))}
      {unattached.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9C8878', marginBottom: '6px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>
            Additional Documents
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {unattached.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '6px', background: 'rgba(255,255,255,.8)', border: '1px solid #E4E2D6' }}>
                <FileText size={11} color="#9C8878" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#1F1D1C', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', lineHeight: 1.4 }}>{d.name}</div>
                  {d.description && <div style={{ fontSize: '9px', color: '#9C8878', lineHeight: 1.4 }}>{d.description}</div>}
                </div>
                <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#E4E2D6', color: '#6A453A', flexShrink: 0 }}>{d.doc_type}</span>
                {d.dropbox_url && (
                  <a href={toDropboxDownloadUrl(d.dropbox_url)} target="_blank" rel="noreferrer" style={{ padding: '3px 7px', borderRadius: '4px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <Download size={10} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SwimlaneTileSection({ label, tagLabel, headerBg, headerTc, pillBg, pillTc, children }: {
  label: string; tagLabel: string; headerBg: string; headerTc: string; pillBg: string; pillTc: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: '12px', border: '1px solid #E4E2D6', overflow: 'hidden', boxShadow: open ? '0 2px 12px rgba(31,29,28,.08)' : '0 1px 4px rgba(31,29,28,.04)' }}>
      <div
        onClick={() => setOpen(p => !p)}
        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0', cursor: 'pointer', background: headerBg, borderRadius: open ? '12px 12px 0 0' : '12px', userSelect: 'none' }}
      >
        <div style={{ padding: '14px 18px', flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.1em', padding: '4px 11px', borderRadius: '10px', background: pillBg, color: pillTc, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', flexShrink: 0 }}>
            {tagLabel}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: headerTc }}>
            {label}
          </span>
        </div>
        <div style={{ padding: '14px 18px 14px 0', color: headerTc, transition: 'transform .22s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
          <ChevronDown size={16} />
        </div>
      </div>
      {open && (
        <div style={{ padding: '16px 20px 20px', background: '#fff' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SwimlanePanelContent({ lane, job, canSeeDoc }: { lane: DBSwimlane; job: Job | null; canSeeDoc: (d: Document) => boolean }) {
  const cl = CL[lane.color_key] || CL.emp;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {job ? (
        <>
          <SwimlaneTileSection
            label={`Why ${job.name} matters`}
            tagLabel="WHY"
            headerBg={job.dark}
            headerTc="#fff"
            pillBg={job.color}
            pillTc={job.dark}
          >
            <JobWhySection job={job} />
          </SwimlaneTileSection>
          <SwimlaneTileSection
            label="How it works"
            tagLabel="HOW"
            headerBg={job.color}
            headerTc="#fff"
            pillBg={job.dark}
            pillTc="#fff"
          >
            <JobHowSection job={job} canSeeDoc={canSeeDoc} />
          </SwimlaneTileSection>
        </>
      ) : (
        <>
          {lane.why_content && (
            <SwimlaneTileSection label={lane.why_title || `Why ${lane.label}`} tagLabel="WHY" headerBg={cl.s} headerTc="#fff" pillBg={cl.f} pillTc={cl.t}>
              <p style={{ fontSize: '12px', color: '#6A453A', lineHeight: 1.75, margin: 0 }}>{lane.why_content}</p>
            </SwimlaneTileSection>
          )}
          {lane.how_content && (
            <SwimlaneTileSection label={lane.how_title || `How ${lane.label} Works`} tagLabel="HOW" headerBg={cl.s} headerTc="#fff" pillBg={cl.f} pillTc={cl.t}>
              <p style={{ fontSize: '12px', color: '#6A453A', lineHeight: 1.75, margin: 0 }}>{lane.how_content}</p>
            </SwimlaneTileSection>
          )}
          {!lane.why_content && !lane.how_content && (
            <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: '#9C8878', fontStyle: 'italic' }}>
              No content added yet for this swimlane.
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Field Catalyst panel ─────────────────────────────────────────────────────
function CatalystPanelContent({ info, docs, canSee, onPreview }: {
  info: CatalystInfo;
  docs: Document[];
  canSee: (d: Document) => boolean;
  onPreview: (d: Document) => void;
}) {
  const visibleDocs = docs.filter(d => canSee(d));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {info.why_content && (
        <SwimlaneTileSection label={info.why_title || 'Why it matters'} tagLabel="WHY" headerBg="#1F1D1C" headerTc="#FABE3D" pillBg="#FABE3D" pillTc="#1F1D1C">
          <p style={{ fontSize: '12px', color: '#6A453A', lineHeight: 1.75, margin: 0 }}>{info.why_content}</p>
        </SwimlaneTileSection>
      )}
      {info.how_content && (
        <SwimlaneTileSection label={info.how_title || 'How it works'} tagLabel="HOW" headerBg="#1F1D1C" headerTc="#FABE3D" pillBg="#FABE3D" pillTc="#1F1D1C">
          <p style={{ fontSize: '12px', color: '#6A453A', lineHeight: 1.75, margin: 0 }}>{info.how_content}</p>
        </SwimlaneTileSection>
      )}
      {!info.why_content && !info.how_content && (
        <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: '#9C8878', fontStyle: 'italic' }}>
          No content added yet for Field Catalyst.
        </div>
      )}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9C8878', marginBottom: '8px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>
          Linked Documents
        </div>
        {visibleDocs.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#C8C4B4', fontStyle: 'italic', padding: '12px', textAlign: 'center', borderRadius: '8px', border: '1px dashed #E4E2D6' }}>
            No documents linked to Field Catalyst yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {visibleDocs.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: '#fff', border: '1px solid #E4E2D6' }}>
                <FileText size={14} color="#FABE3D" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1F1D1C', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', lineHeight: 1.4 }}>{d.name}</div>
                  {d.description && <div style={{ fontSize: '10px', color: '#9C8878', marginTop: '1px', lineHeight: 1.4 }}>{d.description}</div>}
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#B8860B', marginTop: '2px' }}>{d.doc_type}</div>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {d.dropbox_url && (
                    <button onClick={() => onPreview(d)} style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>
                      <Eye size={11} /> View
                    </button>
                  )}
                  {d.dropbox_url && (
                    <a href={toDropboxDownloadUrl(d.dropbox_url)} target="_blank" rel="noreferrer" style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                      <Download size={11} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function NetworkMap({ onClose }: NetworkMapProps) {
  const { profile } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [selectedCatalyst, setSelectedCatalyst] = useState(false);
  const [lanes, setLanes] = useState<DBSwimlane[]>([]);
  const [nodes, setNodes] = useState<DBNode[]>([]);
  const [edges, setEdges] = useState<DBEdge[]>([]);
  const [groups, setGroups] = useState<DBNodeGroup[]>([]);
  // Child lanes — parented to a node; shown only when that parent node is expanded
  const [allChildLanes, setAllChildLanes] = useState<DBSwimlane[]>([]);
  const [allChildNodes, setAllChildNodes] = useState<DBNode[]>([]);
  const [expandedParentKeys, setExpandedParentKeys] = useState<Set<string>>(new Set());
  const [collapsedLanes, setCollapsedLanes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [allDocs, setAllDocs] = useState<Document[]>([]);
  const [nodeDocsCache, setNodeDocsCache] = useState<Record<string, Document[]>>({});
  const [catalystDocs, setCatalystDocs] = useState<Document[]>([]);
  const [catalystInfo, setCatalystInfo] = useState<CatalystInfo | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [jobsMap, setJobsMap] = useState<Record<string, Job>>({});

  const svgRef = useRef<SVGSVGElement>(null);
  const diagramScrollRef = useRef<HTMLDivElement>(null);
  const role = profile?.role;
  const isJspAdminOrAbove = role === 'jsp_admin' || role === 'executive' || role === 'admin';
  const isExecOrAdmin = role === 'executive' || role === 'admin';

  function canSee(doc: Document) {
    if (doc.security_level === 'all') return true;
    if (doc.security_level === 'jsp_admin') return isJspAdminOrAbove;
    return isExecOrAdmin;
  }

  useEffect(() => {
    async function load() {
      const [{ data: laneData }, { data: nodeData }, { data: edgeData }, { data: docData },
             { data: jobsData }, { data: whyData }, { data: principlesData },
             { data: catalystData }, { data: groupData }] = await Promise.all([
        supabase.from('network_swimlanes').select('*').order('sort_order'),
        supabase.from('network_nodes').select('*').order('sort_order'),
        supabase.from('network_edges').select('*').order('sort_order'),
        supabase.from('documents').select('*').order('name'),
        supabase.from('jobs').select('*').order('sort_order'),
        supabase.from('job_why').select('*'),
        supabase.from('job_how_principles').select('*').order('sort_order'),
        supabase.from('catalyst_info').select('*').limit(1).maybeSingle(),
        supabase.from('network_node_groups').select('*').order('sort_order'),
      ]);

      // Build jobs map with why + principles
      const whyByJob: Record<string, typeof whyData[0]> = {};
      (whyData || []).forEach(w => { whyByJob[w.job_id] = w; });
      const principlesByJob: Record<string, typeof principlesData> = {};
      (principlesData || []).forEach(p => {
        if (!principlesByJob[p.job_id]) principlesByJob[p.job_id] = [];
        principlesByJob[p.job_id].push(p);
      });
      const jMap: Record<string, Job> = {};
      (jobsData || []).forEach(j => {
        jMap[j.id] = { ...j, why: whyByJob[j.id], howPrinciples: principlesByJob[j.id] || [], whatTools: [] };
      });
      setJobsMap(jMap);

      const allLanes = ((laneData || []) as DBSwimlane[]).filter(l =>
        l.min_role === 'all' ||
        (l.min_role === 'jsp_admin' && isJspAdminOrAbove) ||
        isExecOrAdmin
      );

      // Separate top-level lanes from child (drill-down) lanes
      const topLevelRaw = allLanes.filter(l => !l.parent_node_key);
      const childLanesRaw = allLanes.filter(l => !!l.parent_node_key);

      // Restack visible top-level lanes top-to-bottom without gaps from hidden lanes
      const FIRST_Y = 28;
      const GAP = 20;
      let cursor = FIRST_Y;
      const visibleLanes = topLevelRaw.map(lane => {
        const newY = cursor;
        cursor += lane.h + GAP;
        return newY === lane.y ? lane : { ...lane, y: newY };
      });

      // Shift each top-level node's y by the same delta its lane moved
      const laneYDelta: Record<string, number> = {};
      topLevelRaw.forEach((orig, i) => {
        const delta = visibleLanes[i].y - orig.y;
        if (delta !== 0) laneYDelta[orig.id] = delta;
      });

      const allNodes = ((nodeData || []) as DBNode[]);
      const visibleLaneIds = new Set(visibleLanes.map(l => l.id));
      const rawNodes = allNodes.filter(n => visibleLaneIds.has(n.swimlane_id));
      const visibleNodes = rawNodes.map(n => {
        const delta = laneYDelta[n.swimlane_id];
        return delta ? { ...n, y: n.y + delta } : n;
      });

      const visibleNodeKeys = new Set(visibleNodes.map(n => n.node_key));

      // Child lane nodes (for drill-down) — kept separate, not y-shifted
      const childLaneIds = new Set(childLanesRaw.map(l => l.id));
      const childNodes = allNodes.filter(n => childLaneIds.has(n.swimlane_id));

      const childNodeKeys = new Set(childNodes.map(n => n.node_key));
      const visibleEdges = ((edgeData || []) as DBEdge[]).filter(e => {
        const fromVisible = visibleNodeKeys.has(e.from_node_key);
        const toVisible = visibleNodeKeys.has(e.to_node_key);
        const fromChild = childNodeKeys.has(e.from_node_key);
        const toChild = childNodeKeys.has(e.to_node_key);
        // Both top-level, both child nodes, or cross (one top-level + one child — shown when child lane expanded)
        // Also allow edges to/from the virtual field_catalyst node
        const isCatalyst = (k: string) => k === 'field_catalyst';
        if (isCatalyst(e.from_node_key) || isCatalyst(e.to_node_key)) {
          const other = isCatalyst(e.from_node_key) ? e.to_node_key : e.from_node_key;
          return visibleNodeKeys.has(other) || childNodeKeys.has(other);
        }
        return (fromVisible && toVisible) || (fromChild && toChild) || (fromChild && toVisible) || (fromVisible && toChild);
      });

      // Groups: filter to top-level visible lanes only
      const visibleGroups = ((groupData || []) as DBNodeGroup[])
        .filter(g => visibleLaneIds.has(g.swimlane_id))
        .map(g => ({ ...g, node_keys: g.node_keys.filter(k => visibleNodeKeys.has(k)) }))
        .filter(g => g.node_keys.length >= 1);

      setLanes(visibleLanes);
      setNodes(visibleNodes);
      setEdges(visibleEdges);
      setGroups(visibleGroups);
      setAllChildLanes(childLanesRaw);
      setAllChildNodes(childNodes);
      setAllDocs((docData || []) as Document[]);
      if (catalystData) setCatalystInfo(catalystData as CatalystInfo);
      // Start collapsible lanes in the collapsed state
      setCollapsedLanes(new Set(visibleLanes.filter(l => l.is_collapsible).map(l => l.id)));
      setLoading(false);
    }
    load();
  }, [isExecOrAdmin, isJspAdminOrAbove]);

  useEffect(() => {
    const cache: Record<string, Document[]> = {};
    for (const doc of allDocs) {
      if (doc.node_key) {
        if (!cache[doc.node_key]) cache[doc.node_key] = [];
        cache[doc.node_key].push(doc);
      }
    }
    setNodeDocsCache(cache);
    setCatalystDocs(allDocs.filter(d => !!d.catalyst_key));
  }, [allDocs]);

  const idx = useMemo(() => {
    const m: Record<string, DBNode> = {};
    nodes.forEach(n => { m[n.node_key] = n; });
    return m;
  }, [nodes]);

  const CHILD_INDENT = 26;  // px indent from parent lane's left edge (matches OWNER_W)
  const CHILD_GAP    = 10;  // gap between parent node bottom and child lane top
  const CHILD_MARGIN = 14;  // extra gap below child lane before the next swimlane

  // Core layout: given the base lanes/nodes (no child lanes yet), compute the
  // final y-positions of every top-level lane and top-level node after pushing
  // them down to make room for any expanded child lanes.
  //
  // Algorithm:
  //   1. Gather each expanded child lane paired with its parent node.
  //   2. Sort expansions by the parent node's *base* y (top to bottom).
  //   3. Walk through top-level lanes in vertical order. Before each lane,
  //      check if any expansion whose parent belongs to a *preceding* lane
  //      hasn't been accounted for yet — accumulate downward push as we go.
  const { shiftedLanes, shiftedNodes, expandedChildLanes, expandedChildNodes, presBarY } = useMemo(() => {
    // Build list of active expansions: { childLane, parentNode }
    type Expansion = { childLane: DBSwimlane; parentNode: DBNode; parentLaneId: string };
    const expansions: Expansion[] = [];
    for (const cl of allChildLanes) {
      if (!expandedParentKeys.has(cl.parent_node_key!)) continue;
      const parentNode = idx[cl.parent_node_key!];
      if (!parentNode) continue;
      // Find which top-level lane contains this parent node
      const parentLane = lanes.find(l => l.id === parentNode.swimlane_id);
      if (!parentLane) continue;
      expansions.push({ childLane: cl, parentNode, parentLaneId: parentLane.id });
    }

    // Sort expansions top-to-bottom by parent lane's y then parent node's y
    expansions.sort((a, b) => {
      const la = lanes.find(l => l.id === a.parentLaneId)!;
      const lb = lanes.find(l => l.id === b.parentLaneId)!;
      return (la?.y ?? 0) - (lb?.y ?? 0) || a.parentNode.y - b.parentNode.y;
    });

    const COLLAPSED_H = 22;
    const LANE_GAP = 20;
    const PRES_BAR_H = 22;
    const PRES_BAR_GAP = 6; // space between BOD bottom and PRESIDENT bar
    const FIRST_Y_BOD = 8;  // BOD lanes start here (above PRESIDENT)
    const FIRST_Y = 28;     // non-BOD lanes start offset (relative, will be set after BOD)

    // Split lanes: BOD (sort_order < 0) above PRESIDENT bar, rest below
    const lanesSorted = [...lanes].sort((a, b) => a.sort_order - b.sort_order || a.y - b.y);
    const bodLanes = lanesSorted.filter(l => l.sort_order < 0);
    const mainLanes = lanesSorted.filter(l => l.sort_order >= 0);

    // Stack BOD lanes
    const lanesRestacked: DBSwimlane[] = [];
    let cursor = FIRST_Y_BOD;
    for (const lane of bodLanes) {
      const isCollapsed = collapsedLanes.has(lane.id);
      const effectiveH = isCollapsed ? COLLAPSED_H : lane.h;
      lanesRestacked.push({ ...lane, y: cursor, h: effectiveH });
      cursor += effectiveH + PRES_BAR_GAP;
    }

    // PRESIDENT bar y sits right after BOD bottom
    const presBarY = bodLanes.length > 0 ? cursor : 0;
    const mainFirstY = presBarY + PRES_BAR_H + (bodLanes.length > 0 ? PRES_BAR_GAP : FIRST_Y);

    // Stack main lanes below PRESIDENT bar
    cursor = mainFirstY;
    for (const lane of mainLanes) {
      const isCollapsed = collapsedLanes.has(lane.id);
      const effectiveH = isCollapsed ? COLLAPSED_H : lane.h;
      lanesRestacked.push({ ...lane, y: cursor, h: effectiveH });
      cursor += effectiveH + LANE_GAP;
    }

    // Build restacked lookup
    const restackedById: Record<string, DBSwimlane> = {};
    lanesRestacked.forEach(l => { restackedById[l.id] = l; });

    // For each lane, compute total extra push from all expansions whose parent
    // lane is strictly *above* this lane (collapsed lanes never expand sub-nodes).
    const lanePush: Record<string, number> = {};
    let cumulativePush = 0;
    for (const lane of lanesRestacked) {
      lanePush[lane.id] = cumulativePush;
      if (!collapsedLanes.has(lane.id)) {
        for (const exp of expansions) {
          if (exp.parentLaneId === lane.id) {
            cumulativePush += exp.childLane.h + CHILD_GAP + CHILD_MARGIN;
          }
        }
      }
    }

    // Apply push to restacked lanes
    const shiftedLanes = lanesRestacked.map(l => {
      const push = lanePush[l.id] ?? 0;
      return push === 0 ? l : { ...l, y: l.y + push };
    });

    // Apply same y-shift to top-level nodes; hide nodes in collapsed lanes
    const laneIdToPush: Record<string, number> = {};
    lanesRestacked.forEach(l => { laneIdToPush[l.id] = lanePush[l.id] ?? 0; });
    const shiftedNodes = nodes
      .filter(n => !collapsedLanes.has(n.swimlane_id))
      .map(n => {
        const restacked = restackedById[n.swimlane_id];
        const push = laneIdToPush[n.swimlane_id] ?? 0;
        if (!restacked) return n;
        const origLane = lanes.find(l => l.id === n.swimlane_id);
        // restacked.y already has the new stacked position; push adds expansion offset
        const dy = (restacked.y + push) - (origLane?.y ?? restacked.y);
        return dy !== 0 ? { ...n, y: n.y + dy } : n;
      });

    // Position each expanded child lane directly below its (now-shifted) parent node
    const shiftedNodeIdx: Record<string, DBNode> = {};
    shiftedNodes.forEach(n => { shiftedNodeIdx[n.node_key] = n; });

    // Build a lookup of shifted parent lanes by id
    const shiftedLaneById: Record<string, DBSwimlane> = {};
    shiftedLanes.forEach(l => { shiftedLaneById[l.id] = l; });

    // Track the next available Y cursor per parent lane so multiple child lanes
    // in the same swimlane stack vertically without overlapping each other.
    const laneCursor: Record<string, number> = {};

    const expandedChildLanes: DBSwimlane[] = expansions.map(exp => {
      const parentLane = shiftedLaneById[exp.parentLaneId];
      if (!parentLane) return null;

      // First child lane for this parent lane starts just below it
      if (!(exp.parentLaneId in laneCursor)) {
        laneCursor[exp.parentLaneId] = parentLane.y + parentLane.h + CHILD_GAP;
      }

      const newY = laneCursor[exp.parentLaneId];
      // Advance cursor for the next child lane in this same parent lane
      laneCursor[exp.parentLaneId] = newY + exp.childLane.h + CHILD_GAP + CHILD_MARGIN;

      const newX = parentLane.x + CHILD_INDENT;
      const newW = parentLane.w - CHILD_INDENT;
      return {
        ...exp.childLane,
        y: newY,
        x: newX,
        w: newW,
      };
    }).filter(Boolean) as DBSwimlane[];

    // Shift child nodes to match their child lane's new x and y
    const expandedChildNodes: DBNode[] = allChildNodes
      .filter(n => expandedChildLanes.some(l => l.id === n.swimlane_id))
      .map(n => {
        const placed = expandedChildLanes.find(l => l.id === n.swimlane_id)!;
        const orig   = allChildLanes.find(l => l.id === n.swimlane_id)!;
        const dy = placed.y - orig.y;
        const dx = placed.x - orig.x;
        return (dy !== 0 || dx !== 0) ? { ...n, x: n.x + dx, y: n.y + dy } : n;
      });

    return { shiftedLanes, shiftedNodes, expandedChildLanes, expandedChildNodes, presBarY };
  }, [lanes, nodes, allChildLanes, allChildNodes, expandedParentKeys, collapsedLanes, idx]);

  const childNodeIdx = useMemo(() => {
    const m: Record<string, DBNode> = {};
    expandedChildNodes.forEach(n => { m[n.node_key] = n; });
    return m;
  }, [expandedChildNodes]);

  // Combined node index (shifted top-level + expanded child nodes)
  // For collapsed child nodes, fall back to the parent node's position so cross-lane edges still render
  const allVisibleIdx = useMemo(() => {
    const m: Record<string, DBNode> = {};
    shiftedNodes.forEach(n => { m[n.node_key] = n; });
    expandedChildNodes.forEach(n => { m[n.node_key] = n; });
    // For child nodes whose lane is not expanded, proxy to their parent node
    const expandedChildNodeKeys = new Set(expandedChildNodes.map(n => n.node_key));
    allChildNodes.forEach(n => {
      if (expandedChildNodeKeys.has(n.node_key)) return;
      const lane = allChildLanes.find(l => l.id === n.swimlane_id);
      if (!lane?.parent_node_key) return;
      const parentNode = m[lane.parent_node_key];
      if (parentNode) m[n.node_key] = parentNode;
    });
    return m;
  }, [shiftedNodes, expandedChildNodes, allChildNodes, allChildLanes]);

  const svgHeight = useMemo(() => {
    const bottoms = [...shiftedLanes, ...expandedChildLanes].map(l => l.y + l.h);
    return bottoms.length > 0 ? Math.max(...bottoms) + 40 : 478;
  }, [shiftedLanes, expandedChildLanes]);

  // Y where the PRESIDENT bar is rendered (above main lanes, below BOD)
  const presBarYFinal = presBarY ?? 0;

  const conn = useMemo(() => {
    if (!selected) return null;
    const s = new Set([selected]);
    edges.forEach(e => {
      if (e.from_node_key === selected) s.add(e.to_node_key);
      if (e.to_node_key === selected) s.add(e.from_node_key);
    });
    return s;
  }, [selected, edges]);

  const selNode = selected ? allVisibleIdx[selected] : null;
  // If selected node is a "has_sub_nodes" parent, don't open the document drawer
  const selNodeHasSubs = selNode?.has_sub_nodes ?? false;

  const allVisibleNodes = useMemo(() => [...shiftedNodes, ...expandedChildNodes], [shiftedNodes, expandedChildNodes]);

  const connectedNames = selNode && conn && !selNodeHasSubs
    ? allVisibleNodes.filter(n => n.node_key !== selected && conn.has(n.node_key)).map(n => n.label.replace(/\n/g, ' '))
    : [];

  // When a node is selected, scroll so the selected node + all its connected
  // nodes are visible. The scroll container's clientWidth already reflects the
  // narrowed space beside the open drawer (flex siblings), so no extra subtraction needed.
  useEffect(() => {
    if (!selNode || !diagramScrollRef.current || !conn) return;

    // Wait for the drawer transition to finish (300ms) before measuring clientWidth
    const timer = setTimeout(() => {
      const container = diagramScrollRef.current;
      if (!container) return;
      const PAD = 40;

      const connectedNodes = allVisibleNodes.filter(n => conn.has(n.node_key));
      const allX = connectedNodes.flatMap(n => [n.x, n.x + n.w]);
      const minX = Math.min(...allX);
      const maxX = Math.max(...allX);
      const groupW = maxX - minX;
      const visibleW = container.clientWidth;

      let targetScroll: number;
      if (groupW + PAD * 2 <= visibleW) {
        targetScroll = minX - (visibleW - groupW) / 2;
      } else {
        targetScroll = minX - PAD;
      }

      container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
    }, 300);

    return () => clearTimeout(timer);
  }, [selNode, conn, nodes]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || loading) return;
    svg.innerHTML = '';

    function mkEl(tag: string, attrs: Record<string, string | number>) {
      const el = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
      return el;
    }

    // Defs (arrowheads)
    const defs = mkEl('defs', {});
    [['slaw', '#888'], ['slax', '#9B8ECC'], ['slaf', '#C8881A'], ['slai', '#1A7895'], ['slae', '#B8860B'],
     ['slawh', '#1F1D1C'], ['slaxh', '#534AB7'], ['slafh', '#C8881A'], ['slaih', '#0D4D60'], ['slaeh', '#7A5500']
    ].forEach(([id, col]) => {
      const m = mkEl('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' });
      const p = mkEl('path', { d: 'M2 1L8 5L2 9', fill: 'none', stroke: col, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      m.appendChild(p); defs.appendChild(m);
    });
    svg.appendChild(defs);

    // PRESIDENT bar — sits between BOD lanes and main lanes
    const PRES_H = 22;
    svg.appendChild(mkEl('rect', { x: 0, y: presBarYFinal, width: 1460, height: PRES_H, rx: 0, fill: '#1F1D1C', opacity: 0.92 }));
    const tpres = mkEl('text', { x: 730, y: presBarYFinal + PRES_H / 2, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 10, fill: '#FABE3D', 'font-weight': 700, 'letter-spacing': '0.14em' });
    tpres.textContent = 'PRESIDENT'; svg.appendChild(tpres);

    // Far-left bar: EXECUTIVE VICE PRESIDENT spanning only main (non-BOD) swimlanes
    const LB_X = 8, LB_W = 22;
    const mainShiftedLanes = shiftedLanes.filter(l => l.sort_order >= 0);
    const lbTop = mainShiftedLanes.length > 0 ? Math.min(...mainShiftedLanes.map(l => l.y)) : presBarYFinal + PRES_H + 6;
    const lbBot = mainShiftedLanes.length > 0 ? Math.max(...mainShiftedLanes.map(l => l.y + l.h)) : svgHeight - 12;
    const lbH = lbBot - lbTop;
    svg.appendChild(mkEl('rect', { x: LB_X, y: lbTop, width: LB_W, height: lbH, rx: 5, fill: '#1F1D1C', opacity: 0.92 }));
    const evpY = lbTop + lbH / 2;
    const tevp = mkEl('text', { x: LB_X + LB_W / 2, y: evpY, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 8, fill: '#FABE3D', 'font-weight': 700, 'letter-spacing': '0.1em', transform: `rotate(-90,${LB_X + LB_W / 2},${evpY})` });
    tevp.textContent = 'EXECUTIVE VICE PRESIDENT'; svg.appendChild(tevp);

    // Right bar (field catalyst) — clickable
    const fcG = document.createElementNS(NS, 'g');
    fcG.style.cursor = 'pointer';
    const fcRect = mkEl('rect', { x: 1402, y: lbTop, width: 52, height: lbH, rx: 6, fill: '#1F1D1C', opacity: selectedCatalyst ? 1 : 0.9 });
    if (selectedCatalyst) {
      fcRect.setAttribute('stroke', '#FABE3D');
      fcRect.setAttribute('stroke-width', '2');
    }
    fcG.appendChild(fcRect);
    const fcMidY = lbTop + lbH / 2;
    const tfc = mkEl('text', { x: 1428, y: fcMidY, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 11, fill: '#FABE3D', transform: `rotate(-90,1428,${fcMidY})` });
    tfc.textContent = 'FIELD CATALYST';
    fcG.appendChild(tfc);
    fcG.addEventListener('click', () => {
      setSelectedCatalyst(prev => !prev);
      setSelected(null);
      setSelectedLaneId(null);
    });
    svg.appendChild(fcG);

    // Owner tab width inside each swimlane
    const OWNER_W = 26;

    // Render a swimlane (shared by top-level and child lanes)
    function renderLane(lane: DBSwimlane, isChild: boolean) {
      const cl = CL[lane.color_key] || CL.emp;
      const isExec = lane.min_role === 'executive' || lane.min_role === 'jsp_admin';
      const laneId = lane.id;
      const isCollapsed = collapsedLanes.has(laneId);

      // Collapsed strip — show only a slim bar with label + expand toggle
      if (!isChild && lane.is_collapsible && isCollapsed) {
        const g = document.createElementNS(NS, 'g');
        g.style.cursor = 'pointer';
        g.appendChild(mkEl('rect', {
          x: lane.x, y: lane.y, width: lane.w, height: lane.h, rx: 6,
          fill: cl.f, stroke: cl.s, 'stroke-width': 1.2, opacity: 0.85,
        }));
        // Owner strip
        g.appendChild(mkEl('rect', { x: lane.x, y: lane.y, width: OWNER_W, height: lane.h, rx: 6, fill: cl.s, opacity: 0.15 }));
        // Label
        const tl = mkEl('text', {
          x: lane.x + OWNER_W + 10, y: lane.y + lane.h / 2,
          'dominant-baseline': 'central', 'font-size': 10, 'font-weight': 700, fill: cl.ls,
        });
        tl.textContent = lane.label;
        g.appendChild(tl);
        // Expand toggle (▾ chevron on right)
        const chevX = lane.x + lane.w - 18;
        const chevY = lane.y + lane.h / 2;
        const chevBg = mkEl('rect', { x: chevX - 8, y: chevY - 7, width: 18, height: 14, rx: 4, fill: cl.s, opacity: 0.18 });
        const chevT = mkEl('text', { x: chevX + 1, y: chevY, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 10, fill: cl.s, 'font-weight': 700 });
        chevT.textContent = '▾';
        g.appendChild(chevBg);
        g.appendChild(chevT);
        g.addEventListener('click', () => {
          setCollapsedLanes(prev => { const next = new Set(prev); next.delete(laneId); return next; });
        });
        svg.appendChild(g);
        return;
      }

      if (isChild) {
        // Child lane: indented bracket + dashed border + label
        svg.appendChild(mkEl('rect', {
          x: lane.x, y: lane.y, width: lane.w, height: lane.h, rx: 6,
          fill: cl.f, stroke: cl.s,
          'stroke-width': 1,
          'stroke-dasharray': '5 3',
          opacity: 0.85,
        }));
        // Indent guide line on left
        svg.appendChild(mkEl('line', {
          x1: lane.x - 12, y1: lane.y,
          x2: lane.x - 12, y2: lane.y + lane.h,
          stroke: cl.s, 'stroke-width': 1.5, opacity: 0.4, 'stroke-linecap': 'round',
        }));
        // Lane label (no owner tab on child lanes — just a small header text)
        const lt = mkEl('text', {
          x: lane.x + 8, y: lane.y + 13,
          'font-size': 9.5, 'font-weight': 600, fill: cl.ls, opacity: 0.8,
        });
        lt.textContent = `↳ ${lane.label}`;
        svg.appendChild(lt);
        return;
      }

      // Top-level lane (existing logic)
      svg.appendChild(mkEl('rect', { x: lane.x, y: lane.y, width: lane.w, height: lane.h, rx: 8, fill: cl.f, stroke: cl.s, 'stroke-width': isExec ? 1.5 : 0.5, opacity: 0.75, 'stroke-dasharray': isExec ? '6 3' : '' }));

      const labelG = document.createElementNS(NS, 'g');
      labelG.style.cursor = 'pointer';
      const isLaneSel = selectedLaneId === laneId;
      const labelX = lane.x + OWNER_W + 8;
      if (isLaneSel) {
        const pill = mkEl('rect', { x: labelX - 4, y: lane.y + 3, width: 140, height: 18, rx: 4, fill: cl.s, opacity: 0.15 });
        labelG.appendChild(pill);
      }
      const tl = mkEl('text', { x: labelX + 4, y: lane.y + 13, 'font-size': 10.5, 'font-weight': isLaneSel ? 700 : 500, fill: isLaneSel ? cl.s : cl.ls });
      tl.textContent = lane.label;
      labelG.appendChild(tl);
      labelG.addEventListener('click', () => {
        setSelectedLaneId(prev => prev === laneId ? null : laneId);
        setSelected(null);
        setSelectedCatalyst(false);
      });
      svg.appendChild(labelG);

      // Badge / is_exec indicator
      const badgeText = lane.badge || lane.label;
      const fs = Math.min(9, (lane.h - 12) / (badgeText.length * 0.6));
      const ownerG = document.createElementNS(NS, 'g');
      svg.appendChild(mkEl('rect', { x: lane.x, y: lane.y, width: OWNER_W, height: lane.h, rx: 8, fill: cl.s, opacity: 0.12 }));
      const bt = mkEl('text', {
        x: lane.x + OWNER_W / 2, y: lane.y + lane.h / 2,
        'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': fs, 'font-weight': 700, fill: cl.s, opacity: 0.7,
        transform: `rotate(-90,${lane.x + OWNER_W / 2},${lane.y + lane.h / 2})`,
      });
      bt.textContent = badgeText;
      ownerG.appendChild(bt);
      svg.appendChild(ownerG);

      // Collapse toggle for collapsible lanes (▴ button at right edge)
      if (lane.is_collapsible) {
        const colG = document.createElementNS(NS, 'g');
        colG.style.cursor = 'pointer';
        const btnX = lane.x + lane.w - 18;
        const btnY = lane.y + lane.h / 2;
        colG.appendChild(mkEl('rect', { x: btnX - 8, y: btnY - 7, width: 18, height: 14, rx: 4, fill: cl.s, opacity: 0.18 }));
        const colT = mkEl('text', { x: btnX + 1, y: btnY, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 10, fill: cl.s, 'font-weight': 700 });
        colT.textContent = '▴';
        colG.appendChild(colT);
        colG.addEventListener('click', () => {
          setCollapsedLanes(prev => { const next = new Set(prev); next.add(laneId); return next; });
        });
        svg.appendChild(colG);
      }
    }

    // Draw top-level lanes first
    shiftedLanes.forEach(lane => renderLane(lane, false));
    // Draw expanded child lanes on top
    expandedChildLanes.forEach(lane => renderLane(lane, true));

    // Edges — use allVisibleIdx so shifted node positions are respected
    // Inject a synthetic node for the Field Catalyst bar so edges can connect to it
    const edgeIdx = { ...allVisibleIdx };
    edgeIdx['field_catalyst'] = { node_key: 'field_catalyst', x: 1402, y: lbTop, w: 52, h: lbH } as DBNode;
    edges.forEach(e => {
      const d = edgePath(e, edgeIdx); if (!d) return;
      const fNode = edgeIdx[e.from_node_key];
      const active = conn ? (e.from_node_key === selected || e.to_node_key === selected) : false;
      const isCross = e.is_cross, isFb = e.is_feedback;
      const fKey = fNode?.color_key as ColorKey | undefined;
      const isInfra = fKey === 'infra';
      const isExec = fKey === 'exec';

      let op: number, sw: number, sc: string, dash: string, mkr: string;
      if (active) {
        op = 0.9; sw = 2;
        sc = isFb ? '#C8881A' : isInfra ? '#1A7895' : isExec ? '#B8860B' : (isCross ? '#534AB7' : '#1F1D1C');
        dash = isFb ? '2 4' : (isCross ? '5 3' : 'none');
        mkr = isFb ? 'url(#slafh)' : isInfra ? 'url(#slaih)' : isExec ? 'url(#slaeh)' : (isCross ? 'url(#slaxh)' : 'url(#slawh)');
      } else if (conn) {
        op = 0.04; sw = 0.8; sc = '#888'; dash = isFb ? '2 4' : (isCross ? '5 3' : 'none');
        mkr = isCross || isFb ? 'url(#slax)' : 'url(#slaw)';
      } else {
        op = isFb ? 0.03 : (isCross ? 0.07 : 0.13); sw = 0.85;
        sc = isFb ? '#C8881A' : isInfra ? '#1A7895' : isExec ? '#B8860B' : (isCross ? '#9B8ECC' : '#888');
        dash = isFb ? '2 4' : (isCross ? '5 3' : 'none');
        mkr = isFb ? 'url(#slaf)' : isInfra ? 'url(#slai)' : isExec ? 'url(#slae)' : (isCross ? 'url(#slax)' : 'url(#slaw)');
      }
      svg.appendChild(mkEl('path', { d, fill: 'none', stroke: sc, 'stroke-width': sw, opacity: op, 'stroke-dasharray': dash, 'stroke-linecap': 'round', 'marker-end': mkr }));
    });

    // Group brackets
    groups.forEach(g => {
      const memberNodes = g.node_keys.map(k => allVisibleIdx[k]).filter(Boolean);
      if (memberNodes.length === 0) return;
      const cl = CL[g.color_key as ColorKey] || CL.emp;
      const leftNode  = memberNodes.reduce((a, b) => a.x < b.x ? a : b);
      const rightNode = memberNodes.reduce((a, b) => (a.x + a.w) > (b.x + b.w) ? a : b);
      const bottomNode = memberNodes.reduce((a, b) => (a.y + a.h) > (b.y + b.h) ? a : b);
      const PAD_H = 6, GAP_V = 5, TICK = 6, LABEL_GAP = 4;
      const bx1 = leftNode.x - PAD_H, bx2 = rightNode.x + rightNode.w + PAD_H;
      const by = bottomNode.y + bottomNode.h + GAP_V, bxMid = (bx1 + bx2) / 2;
      const bracketG = document.createElementNS(NS, 'g');
      bracketG.appendChild(mkEl('path', { d: `M${bx1} ${by - TICK} L${bx1} ${by} L${bx2} ${by} L${bx2} ${by - TICK}`, fill: 'none', stroke: cl.s, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.75 }));
      const labelText = g.label;
      const estW = labelText.length * 5.8 + 12;
      bracketG.appendChild(mkEl('rect', { x: bxMid - estW / 2, y: by + LABEL_GAP, width: estW, height: 14, rx: 4, fill: cl.s, opacity: 0.12 }));
      const labelEl = mkEl('text', { x: bxMid, y: by + LABEL_GAP + 7, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 9, 'font-weight': 700, fill: cl.s, opacity: 0.9, 'letter-spacing': '0.06em' });
      labelEl.textContent = labelText;
      bracketG.appendChild(labelEl);
      svg.appendChild(bracketG);
    });

    // Helper: render a single node element
    function renderNode(n: DBNode, isChildNode: boolean) {
      const isConn = conn ? conn.has(n.node_key) : true;
      const isSel = n.node_key === selected;
      const isExpanded = n.has_sub_nodes && expandedParentKeys.has(n.node_key);
      const op = conn ? (isConn ? 1 : 0.18) : 1;
      const cl = CL[n.color_key] || CL.emp;
      const hasDocs = !n.has_sub_nodes && (nodeDocsCache[n.node_key] || []).length > 0;
      const hasChildNodes = n.has_sub_nodes && allChildLanes.some(l => l.parent_node_key === n.node_key);

      const nodeG = document.createElementNS(NS, 'g');
      nodeG.style.cursor = 'pointer';
      nodeG.style.opacity = String(op);
      nodeG.style.transition = 'opacity 0.15s';

      // Node rect — drill-down nodes get a special border treatment
      const strokeW = isSel ? 2 : (n.has_sub_nodes ? 1.5 : 0.7);
      const strokeDash = n.is_bubble ? '4 2' : (n.has_sub_nodes && !isExpanded ? '3 2' : '');
      nodeG.appendChild(mkEl('rect', {
        x: n.x, y: n.y, width: n.w, height: n.h, rx: 6,
        fill: isSel ? cl.s : (isExpanded ? cl.s : cl.f),
        stroke: cl.s,
        'stroke-width': strokeW,
        'stroke-dasharray': strokeDash,
      }));

      // Label
      const lines = n.label.replace(/\\N/g, '\n').split('\n');
      const lh = 13;
      const sy = n.y + n.h / 2 - (lines.length - 1) * lh / 2;
      lines.forEach((lineText, li) => {
        const tx = mkEl('text', { x: n.x + n.w / 2, y: sy + li * lh, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 10.5, fill: (isSel || isExpanded) ? '#fff' : cl.t });
        tx.textContent = lineText; nodeG.appendChild(tx);
      });

      // Doc indicator dot (only for direct-doc nodes)
      if (hasDocs) {
        nodeG.appendChild(mkEl('circle', { cx: n.x + n.w - 5, cy: n.y + 5, r: 4, fill: isSel ? '#fff' : cl.s, opacity: 0.95 }));
        const dl = mkEl('text', { x: n.x + n.w - 5, y: n.y + 5, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 6, fill: isSel ? cl.s : '#fff', 'font-weight': 700 });
        dl.textContent = '▪'; nodeG.appendChild(dl);
      }

      // Drill-down indicator (bottom-center expand/collapse chevron)
      if (hasChildNodes) {
        const chevY = n.y + n.h - 5;
        const chevEl = mkEl('text', { x: n.x + n.w / 2, y: chevY, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 7, fill: (isSel || isExpanded) ? '#fff' : cl.s, opacity: 0.85 });
        chevEl.textContent = isExpanded ? '▴' : '▾';
        nodeG.appendChild(chevEl);
      }

      nodeG.addEventListener('click', () => {
        if (n.has_sub_nodes) {
          setExpandedParentKeys(prev => {
            const next = new Set(prev);
            if (next.has(n.node_key)) next.delete(n.node_key); else next.add(n.node_key);
            return next;
          });
          setSelected(null);
          setSelectedLaneId(null);
          setSelectedCatalyst(false);
        } else {
          setSelected(prev => prev === n.node_key ? null : n.node_key);
          setSelectedLaneId(null);
          setSelectedCatalyst(false);
        }
      });

      if (isChildNode) {
        // Subtle left connector line from child lane edge to node
        nodeG.appendChild(mkEl('line', {
          x1: n.x - 4, y1: n.y + n.h / 2,
          x2: n.x, y2: n.y + n.h / 2,
          stroke: cl.s, 'stroke-width': 0.8, opacity: 0.35,
        }));
      }

      svg.appendChild(nodeG);
    }

    // Render top-level nodes
    shiftedNodes.forEach(n => renderNode(n, false));
    // Render expanded child nodes
    expandedChildNodes.forEach(n => renderNode(n, true));

  }, [selected, selectedLaneId, selectedCatalyst, shiftedNodes, edges, shiftedLanes, groups, loading, svgHeight, nodeDocsCache, conn, allVisibleIdx, expandedParentKeys, expandedChildLanes, expandedChildNodes, allChildLanes, collapsedLanes, setCollapsedLanes, presBarYFinal]);

  const legendItems: [string, string][] = [
    ['#BA7517', 'Employees'],
    ['#0F6E56', 'Projects'],
    ['#534AB7', 'Internal Catalyst'],
    ['#993C1D', 'External Catalyst'],
    ['#1A7895', 'Infrastructure'],
    ...(isJspAdminOrAbove ? [['#B8860B', 'Executive Team'] as [string, string]] : []),
  ];

  // Nodes with sub-nodes expand a child swimlane instead of the doc drawer
  const drawerOpen = !!((selNode && !selNodeHasSubs) || selectedLaneId || selectedCatalyst);
  const drawerTitle = selNode
    ? selNode.label.replace(/\\N|\n/g, ' ')
    : selectedCatalyst ? 'Field Catalyst'
    : selectedLaneId ? (lanes.find(l => l.id === selectedLaneId)?.label ?? '') : '';
  const drawerColor = selNode ? (CL[selNode.color_key] || CL.emp) : null;

  function closeDrawer() {
    setSelected(null);
    setSelectedLaneId(null);
    setSelectedCatalyst(false);
  }

  return (
    <div style={{ position: 'fixed', top: '56px', left: 0, right: 0, bottom: 0, background: '#F2F1E9', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 24px 12px', borderBottom: '1px solid #E4E2D6', background: '#F2F1E9', flexShrink: 0 }}>
        <div style={{ background: '#1F1D1C', borderRadius: '8px', padding: '6px 12px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#FABE3D', textTransform: 'uppercase', letterSpacing: '.07em' }}>Field Catalyst</span>
        </div>
        <div style={{ fontSize: '12px', color: '#9C8878', fontStyle: 'italic' }}>How JSP works as a connected system</div>
        <div style={{ flex: 1 }} />
        <button onClick={onClose} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #E4E2D6', background: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: '#6A453A', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <X size={12} /> Close
        </button>
      </div>

      {/* Body: diagram + drawer side by side */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Diagram area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 16px' }}>
          <div style={{ fontSize: '11px', color: '#9C8878', fontStyle: 'italic', marginBottom: '10px' }}>
            Click a swimlane title to explore Why &amp; How · Click a node to see documents · Click a node with ▾ to expand sub-nodes · Scroll right to explore
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9C8878', fontSize: '12px' }}>Loading network...</div>
          ) : (
            <div ref={diagramScrollRef} style={{ overflowX: 'auto' }}>
              <svg ref={svgRef} width="1460" height={svgHeight} style={{ display: 'block', minWidth: '900px' }} />
            </div>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '10px', alignItems: 'center' }}>
            {legendItems.map(([c, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#9C8878' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '2px', background: c }} />
                {label}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#9C8878' }}>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#888' }} />
              Has linked documents
            </div>
          </div>
        </div>

        {/* Right drawer — slides in over the right side */}
        <div style={{
          width: drawerOpen ? '380px' : '0',
          minWidth: drawerOpen ? '380px' : '0',
          transition: 'width 0.28s cubic-bezier(.4,0,.2,1), min-width 0.28s cubic-bezier(.4,0,.2,1)',
          overflow: 'hidden',
          flexShrink: 0,
          borderLeft: drawerOpen ? '1px solid #E4E2D6' : 'none',
          background: '#FAFAF7',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {drawerOpen && (
            <>
              {/* Drawer header */}
              <div style={{
                padding: '14px 16px 12px',
                borderBottom: '1px solid #E4E2D6',
                background: selectedCatalyst ? '#1F1D1C' : drawerColor ? drawerColor.f : '#fff',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: selectedCatalyst ? '#FABE3D' : drawerColor ? drawerColor.t : '#1F1D1C', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', lineHeight: 1.3 }}>
                    {drawerTitle}
                  </div>
                  <div style={{ fontSize: '10px', color: selectedCatalyst ? '#FABE3D' : drawerColor ? drawerColor.ls : '#9C8878', opacity: 0.75, marginTop: '2px' }}>
                    {selNode && !selNodeHasSubs ? 'Node details & documents' : 'Why it matters & how it works'}
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  style={{ padding: '4px', borderRadius: '5px', border: '1px solid #E4E2D6', background: 'rgba(255,255,255,.5)', color: drawerColor ? drawerColor.t : '#6A453A', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0, opacity: 0.7 }}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Drawer body — scrollable */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {selNode && (
                  <NodeDrawerContent
                    node={selNode}
                    docs={nodeDocsCache[selNode.node_key] || []}
                    canSee={canSee}
                    connectedNames={connectedNames}
                    onPreview={setPreviewDoc}
                  />
                )}
                {!selNode && selectedLaneId && (() => {
                  const lane = lanes.find(l => l.id === selectedLaneId);
                  if (!lane) return null;
                  const job = lane.job_id ? (jobsMap[lane.job_id] ?? null) : null;
                  return <SwimlanePanelContent lane={lane} job={job} canSeeDoc={canSee} />;
                })()}
                {!selNode && !selectedLaneId && selectedCatalyst && catalystInfo && (
                  <CatalystPanelContent
                    info={catalystInfo}
                    docs={catalystDocs}
                    canSee={canSee}
                    onPreview={setPreviewDoc}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {previewDoc && <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}

      {/* Full-screen modal for custom node components */}
      {selNode?.node_component === 'org_structure' && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,13,12,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => { setSelected(null); }}
        >
          <div
            style={{ background: '#faf9f5', borderRadius: '16px', overflow: 'hidden', maxWidth: '820px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.35)', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'rgba(255,255,255,0.9)', border: '1px solid #E4E2D6', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#1F1D1C' }}
            >
              <X size={16} />
            </button>
            <OrgChart />
          </div>
        </div>
      )}
    </div>
  );
}
