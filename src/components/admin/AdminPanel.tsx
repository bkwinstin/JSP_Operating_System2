import { useState, useEffect } from 'react';
import { Job } from '../../lib/types';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserManagement } from './UserManagement';
import { NetworkAdmin } from './NetworkAdmin';
import { DocumentConfigEditor } from './DocumentConfigEditor';
import { supabase } from '../../lib/supabase';
import { X, Save, Users, Layers, FileText, Download, Network, Plus, Trash2, GripVertical } from 'lucide-react';
import { JobWhatTool, JobHowPrinciple } from '../../lib/types';

interface CatalystInfo {
  id: string;
  why_title: string;
  why_content: string;
  how_title: string;
  how_content: string;
}

function CatalystEditor() {
  const { showToast } = useToast();
  const [info, setInfo] = useState<CatalystInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ why_title: '', why_content: '', how_title: '', how_content: '' });

  useEffect(() => {
    supabase.from('catalyst_info').select('*').limit(1).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setInfo(data as CatalystInfo);
          setForm({ why_title: data.why_title, why_content: data.why_content, how_title: data.how_title, how_content: data.how_content });
        }
      });
  }, []);

  async function handleSave() {
    if (!info) return;
    setSaving(true);
    const { error } = await supabase.from('catalyst_info').update({ ...form, updated_at: new Date().toISOString() }).eq('id', info.id);
    setSaving(false);
    if (error) showToast('Save failed: ' + error.message, 'error');
    else showToast('Field Catalyst content saved');
  }

  if (!info) return <div style={{ fontSize: '12px', color: '#9C8878', padding: '12px' }}>Loading...</div>;

  const field = (key: keyof typeof form, label: string, rows = 3) => (
    <div key={key} style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.07em', color: '#9C8878', marginBottom: '5px', fontFamily: 'Verdana,sans-serif' }}>
        {label}
      </label>
      <textarea
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        rows={rows}
        style={{ width: '100%', padding: '8px 11px', border: '1px solid #E4E2D6', borderRadius: '7px', fontSize: '12px', fontFamily: 'Verdana,sans-serif', color: '#1F1D1C', resize: 'vertical', lineHeight: 1.55, boxSizing: 'border-box' }}
      />
    </div>
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        {field('why_title', 'Why — Section Title', 1)}
        {field('how_title', 'How — Section Title', 1)}
      </div>
      {field('why_content', 'Why — Body Content', 5)}
      {field('how_content', 'How — Body Content', 5)}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '8px 18px', borderRadius: '7px', border: 'none', background: '#1F1D1C', color: '#FABE3D', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Save size={12} />
          {saving ? 'Saving...' : 'Save Field Catalyst Content'}
        </button>
      </div>
    </div>
  );
}

// ── What Tools Editor ──────────────────────────────────────────────────────────
interface ToolDraft {
  id?: string;
  name: string;
  description: string;
  tag: string;
  system_name: string;
  sort_order: number;
  principle_id: string;
  document_id: string;
}

function WhatToolEditor({ job, onAdd, onUpdate, onDelete, onClose }: {
  job: { id: string; name: string; color: string; light: string; dark: string; function_area: string; howPrinciples: JobHowPrinciple[]; whatTools: JobWhatTool[] };
  onAdd: (data: Omit<ToolDraft, 'id'>) => Promise<void>;
  onUpdate: (id: string, data: Omit<ToolDraft, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const emptyDraft: ToolDraft = { name: '', description: '', tag: '', system_name: '', sort_order: 0, principle_id: '', document_id: '' };
  const [tools, setTools] = useState<ToolDraft[]>(
    job.whatTools.map(t => ({ id: t.id, name: t.name, description: t.description, tag: t.tag, system_name: t.system_name, sort_order: t.sort_order, principle_id: t.principle_id || '', document_id: t.document_id || '' }))
  );
  const [saving, setSaving] = useState(false);
  const [allDocs, setAllDocs] = useState<{ id: string; name: string; doc_type: string }[]>([]);

  useEffect(() => {
    supabase.from('documents').select('id, name, doc_type').order('name')
      .then(({ data }) => setAllDocs(data || []));
  }, []);

  function update(idx: number, field: keyof ToolDraft, val: string | number) {
    setTools(prev => prev.map((t, i) => i === idx ? { ...t, [field]: val } : t));
  }

  function addRow() {
    setTools(prev => [...prev, { ...emptyDraft, sort_order: prev.length }]);
  }

  async function removeRow(idx: number) {
    const t = tools[idx];
    if (t.id) await onDelete(t.id);
    setTools(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    for (let i = 0; i < tools.length; i++) {
      const t = tools[i];
      const payload = { name: t.name, description: t.description, tag: t.tag, system_name: t.system_name, sort_order: i, principle_id: t.principle_id || undefined, document_id: t.document_id || undefined };
      if (t.id) await onUpdate(t.id, payload);
      else await onAdd(payload);
    }
    setSaving(false);
    onClose();
  }

  const inputSt: React.CSSProperties = { padding: '5px 8px', borderRadius: '5px', border: '1px solid #E4E2D6', fontSize: '11px', fontFamily: 'Verdana,sans-serif', background: '#FAFAF7', color: '#1F1D1C', width: '100%', boxSizing: 'border-box' };
  const labelSt: React.CSSProperties = { fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#9C8878', display: 'block', marginBottom: '3px' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(31,29,28,.55)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(31,29,28,.25)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #E4E2D6', flexShrink: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#1F1D1C' }}>Edit What — {job.name}</div>
          <div style={{ fontSize: '11px', color: '#9C8878', marginTop: '2px' }}>Link each tool to a document so staff can open it directly from the tile.</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {tools.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: '#9C8878', fontSize: '12px' }}>No tools yet. Click "Add Tool" to create one.</div>
          )}
          {tools.map((t, i) => (
            <div key={i} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${job.color}30`, background: job.light, marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <GripVertical size={14} color="#9C8878" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '11px', fontWeight: 700, color: job.dark, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', flex: 1 }}>Tool {i + 1}</div>
                <button onClick={() => removeRow(i)} title="Remove" style={{ padding: '3px 6px', borderRadius: '4px', border: '1px solid #E4E2D6', background: '#fff', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={11} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label style={labelSt}>Name</label>
                  <input value={t.name} onChange={e => update(i, 'name', e.target.value)} placeholder="e.g. Skills Inventory" style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Tag</label>
                  <input value={t.tag} onChange={e => update(i, 'tag', e.target.value)} placeholder="e.g. Assessment" style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>System / Frequency</label>
                  <input value={t.system_name} onChange={e => update(i, 'system_name', e.target.value)} placeholder="e.g. Annual" style={inputSt} />
                </div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={labelSt}>Description</label>
                <input value={t.description} onChange={e => update(i, 'description', e.target.value)} placeholder="Brief description..." style={inputSt} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={labelSt}>Linked to How Principle (optional)</label>
                  <select value={t.principle_id} onChange={e => update(i, 'principle_id', e.target.value)} style={inputSt}>
                    <option value="">— Not linked —</option>
                    {job.howPrinciples.map((p, pi) => (
                      <option key={p.id} value={p.id}>{pi + 1}. {p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Linked Document (optional)</label>
                  <select value={t.document_id} onChange={e => update(i, 'document_id', e.target.value)} style={inputSt}>
                    <option value="">— No document —</option>
                    {allDocs.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.doc_type})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '7px', border: '1.5px dashed #C8C4B4', background: 'transparent', color: '#9C8878', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif', width: '100%', justifyContent: 'center', marginTop: '4px' }}>
            <Plus size={13} /> Add Tool
          </button>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #E4E2D6', display: 'flex', justifyContent: 'flex-end', gap: '8px', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: '7px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', borderRadius: '7px', border: 'none', background: '#1F1D1C', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif', display: 'flex', alignItems: 'center', gap: '5px', opacity: saving ? 0.6 : 1 }}>
            <Save size={12} />{saving ? 'Saving...' : 'Save Tools'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditModalProps {
  title: string;
  fields: { key: string; label: string; value: string; rows?: number }[];
  onSave: (values: Record<string, string>) => Promise<void>;
  onClose: () => void;
}

function EditModal({ title, fields, onSave, onClose }: EditModalProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(f => [f.key, f.value]))
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(values);
    setSaving(false);
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(31,29,28,.55)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', padding: '24px 28px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(31,29,28,.25)' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#1F1D1C', marginBottom: '3px' }}>{title}</div>
        <div style={{ fontSize: '11px', color: '#9C8878', marginBottom: '18px' }}>Changes update immediately after saving.</div>

        {fields.map(f => (
          <div key={f.key} style={{ marginBottom: '13px' }}>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9C8878', marginBottom: '5px', fontFamily: 'Verdana,sans-serif' }}>
              {f.label}
            </label>
            <textarea
              value={values[f.key]}
              onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
              rows={f.rows || 3}
              style={{ width: '100%', padding: '8px 11px', border: '1px solid #E4E2D6', borderRadius: '7px', fontSize: '12px', fontFamily: 'Verdana,sans-serif', color: '#1F1D1C', resize: 'vertical', lineHeight: 1.55 }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '18px' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: '7px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 18px', borderRadius: '7px', border: 'none', background: '#1F1D1C', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Save size={12} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

type AdminTab = 'content' | 'users' | 'documents' | 'network' | 'export';

const TABS: { id: AdminTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'content', label: 'Job Content', icon: Layers },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'network', label: 'Network Map', icon: Network },
  { id: 'export', label: 'Export', icon: Download },
];

interface AdminPanelProps {
  jobs: Job[];
  onClose: () => void;
  onGoToDocs: () => void;
  onSaved?: () => void;
}

export function AdminPanel({ jobs, onClose, onGoToDocs, onSaved }: AdminPanelProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { updateWhy, updatePrinciple, updateConnection, addTool, updateTool, deleteTool } = useJobs();
  const [editModal, setEditModal] = useState<React.ReactNode>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('content');

  function openWhyEditor(job: Job) {
    if (!job.why) return;
    const w = job.why;
    setEditModal(
      <EditModal
        title={`Edit Why — ${job.name}`}
        fields={[
          { key: 'statement', label: 'Opening statement (tile header)', value: w.statement, rows: 2 },
          { key: 'body', label: 'Body text', value: w.body, rows: 6 },
          { key: 'anchor', label: 'Anchor quote (italic callout)', value: w.anchor, rows: 3 },
          { key: 'values', label: 'Values (comma-separated)', value: w.values.join(', '), rows: 1 },
        ]}
        onSave={async vals => {
          const err = await updateWhy(job.id, {
            statement: vals.statement,
            body: vals.body,
            anchor: vals.anchor,
            values: vals.values.split(',').map(v => v.trim()).filter(Boolean),
          }, user!.id);
          if (err) showToast('Save failed: ' + err.message, 'error');
          else { showToast('Why content saved'); setEditModal(null); onSaved?.(); }
        }}
        onClose={() => setEditModal(null)}
      />
    );
  }

  function openHowEditor(job: Job) {
    const principles = job.howPrinciples || [];
    const connection = job.howConnection;
    const fields = principles.flatMap((p, i) => [
      { key: `t-${i}`, label: `Principle ${i + 1} — Title`, value: p.title, rows: 1 },
      { key: `b-${i}`, label: `Principle ${i + 1} — Body`, value: p.body, rows: 3 },
    ]);
    if (connection) fields.push({ key: 'connection', label: 'How this connects to other jobs', value: connection.body, rows: 3 });

    setEditModal(
      <EditModal
        title={`Edit How — ${job.name}`}
        fields={fields}
        onSave={async vals => {
          const errors = await Promise.all([
            ...principles.map((p, i) => updatePrinciple(p.id, { title: vals[`t-${i}`], body: vals[`b-${i}`] }, user!.id)),
            connection ? updateConnection(job.id, vals.connection, user!.id) : Promise.resolve(null),
          ]);
          const err = errors.find(Boolean);
          if (err) showToast('Save failed', 'error');
          else { showToast('How content saved'); setEditModal(null); onSaved?.(); }
        }}
        onClose={() => setEditModal(null)}
      />
    );
  }

  function openWhatEditor(job: Job) {
    setEditModal(
      <WhatToolEditor
        job={{ id: job.id, name: job.name, color: job.color, light: job.light, dark: job.dark, function_area: job.function_area, howPrinciples: job.howPrinciples || [], whatTools: job.whatTools || [] }}
        onAdd={async data => { const err = await addTool(job.id, data); if (err) showToast('Add failed: ' + err.message, 'error'); }}
        onUpdate={async (id, data) => { const err = await updateTool(id, data); if (err) showToast('Update failed: ' + err.message, 'error'); }}
        onDelete={async id => { const err = await deleteTool(id); if (err) showToast('Delete failed: ' + err.message, 'error'); }}
        onClose={() => { setEditModal(null); onSaved?.(); }}
      />
    );
  }

  function handleExport() {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      version: 'JSP-OS-v1-react',
      jobs: jobs.map(j => ({
        id: j.id, name: j.name,
        why: j.why,
        howPrinciples: j.howPrinciples,
        howConnection: j.howConnection,
        whatTools: j.whatTools,
      })),
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JSP_OS_Export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Content exported successfully');
  }

  return (
    <div style={{ position: 'fixed', top: '56px', left: 0, right: 0, bottom: 0, background: '#F2F1E9', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 28px 0', borderBottom: '1px solid #E4E2D6', background: '#F2F1E9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#1F1D1C', marginBottom: '2px' }}>Admin Panel</div>
            <div style={{ fontSize: '12px', color: '#9C8878' }}>Content editing, user management, and system configuration</div>
          </div>
          <button onClick={onClose} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #E4E2D6', background: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: '#6A453A', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <X size={12} /> Close
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2px' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '8px 8px 0 0',
                  border: isActive ? '1px solid #E4E2D6' : '1px solid transparent',
                  borderBottom: isActive ? '1px solid #fff' : '1px solid transparent',
                  background: isActive ? '#fff' : 'transparent',
                  color: isActive ? '#1F1D1C' : '#9C8878',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Verdana,sans-serif',
                  marginBottom: '-1px',
                  transition: 'all 0.12s',
                }}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {activeTab === 'content' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E4E2D6', padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '12px' }}>Edit Job Content</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {jobs.map(j => (
                <div key={j.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', padding: '10px', borderRadius: '8px', border: `1px solid ${j.color}40`, background: j.light }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: j.dark, gridColumn: '1/-1', marginBottom: '5px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>{j.name}</div>
                  <button onClick={() => openWhyEditor(j)} style={{ padding: '5px 8px', borderRadius: '6px', border: `1px solid ${j.color}60`, background: '#fff', color: j.dark, fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif' }}>Edit Why</button>
                  <button onClick={() => openHowEditor(j)} style={{ padding: '5px 8px', borderRadius: '6px', border: `1px solid ${j.color}60`, background: '#fff', color: j.dark, fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif' }}>Edit How</button>
                  <button onClick={() => openWhatEditor(j)} style={{ padding: '5px 8px', borderRadius: '6px', border: `1px solid ${j.color}60`, background: '#fff', color: j.dark, fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif', gridColumn: '1/-1' }}>Edit What (Tools)</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E4E2D6', padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '4px' }}>Users & Roles</div>
              <div style={{ fontSize: '12px', color: '#9C8878', lineHeight: 1.6 }}>
                Manage who has access to the system and what they can see. Employees see general content.
                Executives gain access to executive-only documents in the library.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {[
                { role: 'staff', label: 'Employee', desc: 'General content access', color: '#EDE0DC', tc: '#2E1710' },
                { role: 'executive', label: 'Executive', desc: '+ Executive documents', color: '#FEF3CC', tc: '#7A5500' },
                { role: 'admin', label: 'Admin', desc: '+ Full system control', color: '#FDE8E2', tc: '#7A2410' },
              ].map(r => (
                <div key={r.role} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: r.color, border: `1px solid ${r.color}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: r.tc, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '2px' }}>{r.label}</div>
                  <div style={{ fontSize: '10px', color: r.tc, opacity: 0.8, fontFamily: 'Verdana,sans-serif' }}>{r.desc}</div>
                </div>
              ))}
            </div>

            <UserManagement />
          </div>
        )}

        {activeTab === 'documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Quick access */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E4E2D6', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '6px' }}>Document Library</div>
              <div style={{ fontSize: '12px', color: '#9C8878', marginBottom: '14px', lineHeight: 1.6 }}>
                Add and manage documents linked from Dropbox. Set individual documents to "Executive Only" to restrict visibility.
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#F2F1E9', border: '1px solid #E4E2D6' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1F1D1C', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '2px' }}>All Staff</div>
                  <div style={{ fontSize: '10px', color: '#6A453A', fontFamily: 'Verdana,sans-serif' }}>Visible to all logged-in users</div>
                </div>
                <div style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#FEF3CC', border: '1px solid #FABE3D' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#7A5500', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '2px' }}>Executive Only</div>
                  <div style={{ fontSize: '10px', color: '#7A5500', fontFamily: 'Verdana,sans-serif' }}>Executive and Admin roles only</div>
                </div>
              </div>
              <button
                onClick={() => { onClose(); onGoToDocs(); }}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#1F1D1C', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Go to Document Library →
              </button>
            </div>

            {/* Dropdown config */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E4E2D6', padding: '20px' }}>
              <DocumentConfigEditor />
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E4E2D6', padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '4px' }}>Network Map Editor</div>
                <div style={{ fontSize: '12px', color: '#9C8878', lineHeight: 1.6 }}>
                  Add and connect nodes in the Field Catalyst diagram. Executive-only swimlanes are only visible to Executive and Admin users.
                </div>
              </div>
              <NetworkAdmin />
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E4E2D6', padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <div style={{ background: '#1F1D1C', borderRadius: '6px', padding: '4px 10px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#FABE3D', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>Field Catalyst</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>Why &amp; How Content</div>
                </div>
                <div style={{ fontSize: '12px', color: '#9C8878', lineHeight: 1.6 }}>
                  Edit the Why and How content shown when users click the Field Catalyst bar on the network map.
                </div>
              </div>
              <CatalystEditor />
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div style={{ background: '#FEF3CC', borderRadius: '12px', border: '1px solid #FABE3D', padding: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '4px', color: '#7A5500' }}>Export Content</div>
            <div style={{ fontSize: '12px', color: '#7A5500', marginBottom: '20px', lineHeight: 1.6 }}>
              Export all current job content (Why, How, What) as a JSON snapshot for record-keeping or migration.
            </div>
            <button onClick={handleExport} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#1F1D1C', color: '#FABE3D', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={14} />
              Export Content JSON
            </button>
          </div>
        )}
      </div>

      {editModal}
    </div>
  );
}
