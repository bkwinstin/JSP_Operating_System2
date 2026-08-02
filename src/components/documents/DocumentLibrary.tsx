import { useState, useEffect } from 'react';
import { useDocuments, toDropboxDownloadUrl, toDropboxPreviewUrl } from '../../hooks/useDocuments';
import { useDocumentConfig, ConfigItem } from '../../hooks/useDocumentConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Document } from '../../lib/types';
import { supabase } from '../../lib/supabase';
import { X, Download, Lock, Pencil, ExternalLink, Eye, Link, FileText, Palette, CheckSquare } from 'lucide-react';

interface NetworkNode { node_key: string; label: string; }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: '7px', border: '1px solid #E4E2D6',
  fontSize: '12px', fontFamily: 'Verdana,sans-serif', boxSizing: 'border-box',
  background: '#FAFAF7', color: '#1F1D1C',
};
const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em',
  color: '#9C8878', marginBottom: '4px', display: 'block',
};

interface DocumentLibraryProps {
  onClose: () => void;
}

function getFnMeta(functionAreas: ConfigItem[], value: string) {
  const fa = functionAreas.find(f => f.value === value);
  return { c: fa?.color || '#888', l: fa?.light || '#F1EFE8', label: fa?.label || value };
}

// ── Preview Modal ──────────────────────────────────────────────────────────────
function PreviewModal({ doc, onClose }: { doc: Document; onClose: () => void }) {
  const previewUrl = doc.dropbox_url ? toDropboxPreviewUrl(doc.dropbox_url) : null;
  const downloadUrl = doc.dropbox_url ? toDropboxDownloadUrl(doc.dropbox_url) : null;
  const hasAny = previewUrl || downloadUrl || doc.canva_url || doc.asana_url;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(31,29,28,.65)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(31,29,28,.32)', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #E4E2D6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F2F1E9', border: '1px solid #E4E2D6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={18} color="#9C8878" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#1F1D1C', lineHeight: 1.25, marginBottom: '3px' }}>{doc.name}</div>
              {doc.description && <div style={{ fontSize: '11px', color: '#9C8878', lineHeight: 1.4 }}>{doc.description}</div>}
            </div>
          </div>
          <button onClick={onClose} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        {/* Actions */}
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {doc.canva_url && (
            <a
              href={doc.canva_url}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', borderRadius: '9px', background: '#7D2AE8', color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'Verdana,sans-serif', textDecoration: 'none', transition: 'opacity .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
            >
              <Palette size={15} /> Open in Canva
            </a>
          )}
          {doc.asana_url && (
            <a
              href={doc.asana_url}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', borderRadius: '9px', background: '#F06A37', color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'Verdana,sans-serif', textDecoration: 'none', transition: 'opacity .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
            >
              <CheckSquare size={15} /> Open in Asana
            </a>
          )}
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', borderRadius: '9px', background: '#0061FF', color: '#fff', fontSize: '13px', fontWeight: 700, fontFamily: 'Verdana,sans-serif', textDecoration: 'none', transition: 'opacity .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
            >
              <Eye size={15} /> Preview in Dropbox
            </a>
          )}
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', borderRadius: '9px', background: '#F2F1E9', border: '1px solid #E4E2D6', color: '#1F1D1C', fontSize: '13px', fontWeight: 700, fontFamily: 'Verdana,sans-serif', textDecoration: 'none', transition: 'background .15s' }}
            >
              <Download size={15} /> Download File
            </a>
          )}
          {!hasAny && (
            <div style={{ textAlign: 'center', padding: '16px', color: '#9C8878', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Link size={20} color="#C8C4B4" />
              No file linked to this document
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────────
function EditDocModal({ doc, functionAreas, docTypes, accessLevels, networkNodes, onSave, onClose }: {
  doc: Document;
  functionAreas: ConfigItem[];
  docTypes: ConfigItem[];
  accessLevels: ConfigItem[];
  networkNodes: NetworkNode[];
  onSave: (fields: { name: string; description: string; function_area: string; doc_type: string; security_level: 'all' | 'jsp_admin' | 'executive'; dropbox_url?: string; canva_url?: string; asana_url?: string; node_key?: string; catalyst_key?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const linkedValue = doc.catalyst_key ? '__catalyst__' : (doc.node_key || '');
  const [fields, setFields] = useState({
    name: doc.name,
    description: doc.description || '',
    function_area: doc.function_area,
    doc_type: doc.doc_type,
    security_level: doc.security_level,
    dropbox_url: doc.dropbox_url || '',
    canva_url: doc.canva_url || '',
    asana_url: doc.asana_url || '',
    linked: linkedValue,
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!fields.name.trim()) return;
    setSaving(true);
    await onSave({
      name: fields.name,
      description: fields.description,
      function_area: fields.function_area,
      doc_type: fields.doc_type,
      security_level: fields.security_level,
      dropbox_url: fields.dropbox_url.trim() || undefined,
      canva_url: fields.canva_url.trim() || undefined,
      asana_url: fields.asana_url.trim() || undefined,
      node_key: fields.linked && fields.linked !== '__catalyst__' ? fields.linked : undefined,
      catalyst_key: fields.linked === '__catalyst__' ? 'field-catalyst' : undefined,
    });
    setSaving(false);
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(31,29,28,.55)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', padding: '24px 28px', width: '100%', maxWidth: '500px', boxShadow: '0 8px 32px rgba(31,29,28,.18)' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '18px' }}>Edit Document</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input value={fields.name} onChange={e => setFields(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={fields.description} onChange={e => setFields(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>
          <div>
            <label style={labelStyle}>Dropbox Shared Link</label>
            <input value={fields.dropbox_url} onChange={e => setFields(f => ({ ...f, dropbox_url: e.target.value }))} placeholder="https://www.dropbox.com/s/..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Canva Link</label>
            <input value={fields.canva_url} onChange={e => setFields(f => ({ ...f, canva_url: e.target.value }))} placeholder="https://www.canva.com/design/..." style={inputStyle} />
            <div style={{ fontSize: '9.5px', color: '#9C8878', marginTop: '3px' }}>In Canva, click Share → Copy link. Use a view-only or public link.</div>
          </div>
          <div>
            <label style={labelStyle}>Asana Link</label>
            <input value={fields.asana_url} onChange={e => setFields(f => ({ ...f, asana_url: e.target.value }))} placeholder="https://app.asana.com/..." style={inputStyle} />
            <div style={{ fontSize: '9.5px', color: '#9C8878', marginTop: '3px' }}>In Asana, copy the link to the project, task, or board.</div>
          </div>
          <div>
            <label style={labelStyle}>Link to Network Map (optional)</label>
            <select value={fields.linked} onChange={e => setFields(f => ({ ...f, linked: e.target.value }))} style={inputStyle}>
              <option value="">— Not linked —</option>
              <option value="__catalyst__">Field Catalyst (right bar)</option>
              {networkNodes.map(n => <option key={n.node_key} value={n.node_key}>{n.label.replace(/\n/g, ' ')} ({n.node_key})</option>)}
            </select>
            <div style={{ fontSize: '9.5px', color: '#9C8878', marginTop: '3px' }}>When linked, this document appears in the panel for that node or section on the Network Map.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Function Area</label>
              <select value={fields.function_area} onChange={e => setFields(f => ({ ...f, function_area: e.target.value }))} style={inputStyle}>
                <option value="">Select area</option>
                {functionAreas.map(fa => <option key={fa.value} value={fa.value}>{fa.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Document Type</label>
              <select value={fields.doc_type} onChange={e => setFields(f => ({ ...f, doc_type: e.target.value }))} style={inputStyle}>
                {docTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Access Level</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {accessLevels.map(level => (
                <button key={level.value} onClick={() => setFields(f => ({ ...f, security_level: level.value as 'all' | 'jsp_admin' | 'executive' }))} style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Verdana,sans-serif', fontWeight: 700, fontSize: '11px', border: `2px solid ${fields.security_level === level.value ? (level.value === 'all' ? '#1D9E75' : level.value === 'jsp_admin' ? '#7BB8D4' : '#FABE3D') : '#E4E2D6'}`, background: fields.security_level === level.value ? (level.value === 'all' ? '#E1F5EE' : level.value === 'jsp_admin' ? '#D6EAF3' : '#FEF3CC') : '#F2F1E9', color: fields.security_level === level.value ? (level.value === 'all' ? '#085041' : level.value === 'jsp_admin' ? '#1A4F66' : '#7A5500') : '#6A453A', transition: 'all .14s' }}>
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: '7px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !fields.name.trim()} style={{ padding: '8px 20px', borderRadius: '7px', border: 'none', background: '#1F1D1C', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Doc Card ───────────────────────────────────────────────────────────────────
function DocCard({ doc, functionAreas, canSee, isAdmin, onPreview, onEdit, onDelete }: {
  doc: Document;
  functionAreas: ConfigItem[];
  canSee: boolean;
  isAdmin: boolean;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const fc = getFnMeta(functionAreas, doc.function_area);
  const hasDropbox = !!doc.dropbox_url;
  const hasCanva = !!doc.canva_url;
  const hasAsana = !!doc.asana_url;
  const downloadUrl = hasDropbox ? toDropboxDownloadUrl(doc.dropbox_url!) : null;

  if (!canSee) {
    return (
      <div style={{ position: 'relative', background: '#fff', borderRadius: '10px', border: '1px solid #E4E2D6', padding: '14px 16px' }}>
        <div style={{ opacity: 0.3 }}>
          <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: fc.c, marginBottom: '6px' }}>{doc.doc_type}</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1F1D1C', lineHeight: 1.3 }}>{doc.name}</div>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(242,241,233,.88)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
          <Lock size={16} color="#9C8878" />
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#9C8878', fontFamily: 'Verdana,sans-serif' }}>Restricted access</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #E4E2D6', padding: '14px 16px', boxShadow: '0 1px 4px rgba(31,29,28,.06)', transition: 'box-shadow .15s', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: fc.c }}>{doc.doc_type}</div>
        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
          background: doc.security_level === 'executive' ? '#FEF3CC' : doc.security_level === 'jsp_admin' ? '#D6EAF3' : '#E1F5EE',
          color: doc.security_level === 'executive' ? '#7A5500' : doc.security_level === 'jsp_admin' ? '#1A4F66' : '#085041' }}>
          {doc.security_level === 'executive' ? 'Executive' : doc.security_level === 'jsp_admin' ? 'JSP Admin+' : 'All Staff'}
        </span>
      </div>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1F1D1C', marginBottom: '3px', lineHeight: 1.3, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>{doc.name}</div>
      <div style={{ fontSize: '10px', color: '#9C8878', lineHeight: 1.45, marginBottom: doc.catalyst_key ? '6px' : '10px', flex: 1 }}>{doc.description}</div>
      {doc.catalyst_key && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '8px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: '#1F1D1C', color: '#FABE3D', marginBottom: '8px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          Field Catalyst
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {hasCanva && (
            <a href={doc.canva_url!} target="_blank" rel="noreferrer" style={{ padding: '4px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', border: '1px solid #C4A3E8', background: '#F3EAFF', color: '#5B1AAA', fontFamily: 'Verdana,sans-serif', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all .14s' }}>
              <Palette size={11} /> Canva
            </a>
          )}
          {hasAsana && (
            <a href={doc.asana_url!} target="_blank" rel="noreferrer" style={{ padding: '4px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', border: '1px solid #F0B59A', background: '#FDE9DC', color: '#B54218', fontFamily: 'Verdana,sans-serif', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all .14s' }}>
              <CheckSquare size={11} /> Asana
            </a>
          )}
          {hasDropbox && (
            <button onClick={onPreview} style={{ padding: '4px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', fontFamily: 'Verdana,sans-serif', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all .14s' }}>
              <Eye size={11} /> View
            </button>
          )}
          {downloadUrl && (
            <a href={downloadUrl} target="_blank" rel="noreferrer" style={{ padding: '4px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', fontFamily: 'Verdana,sans-serif', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all .14s' }}>
              <Download size={11} /> Download
            </a>
          )}
          {!hasDropbox && !hasCanva && !hasAsana && <span style={{ fontSize: '10px', color: '#C8C4B4', fontStyle: 'italic', padding: '4px 0' }}>No file linked</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '8px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: fc.l, color: fc.c }}>{fc.label}</span>
          {isAdmin && (
            <>
              <button onClick={onEdit} title="Edit" style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#9C8878', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Pencil size={10} /></button>
              <button onClick={onDelete} title="Delete" style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={10} /></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function DocumentLibrary({ onClose }: DocumentLibraryProps) {
  const { documents, loading, canSeeDoc, addDropboxDocument, deleteDocument, updateDocument } = useDocuments();
  const { config } = useDocumentConfig();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [filter, setFilter] = useState('all');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [editModal, setEditModal] = useState<Document | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Document | null>(null);
  const [adding, setAdding] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', description: '', dropbox_url: '', canva_url: '', asana_url: '', linked: '', function_area: '', doc_type: '', security_level: 'all' as 'all' | 'jsp_admin' | 'executive' });
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    supabase.from('network_nodes').select('node_key, label').order('label').then(({ data }) => {
      setNetworkNodes((data || []) as NetworkNode[]);
    });
  }, []);

  const { function_areas, doc_types, access_levels } = config;
  const defaultDocType = doc_types[0]?.value || '';

  const filtered = documents.filter(d => filter === 'all' || d.function_area === filter);
  const visible = filtered.filter(d => canSeeDoc(d));
  const locked = filtered.filter(d => !canSeeDoc(d));

  async function handleAdd() {
    if (!newDoc.name.trim()) { showToast('Please enter a document name', 'error'); return; }
    if (!newDoc.dropbox_url.trim() && !newDoc.canva_url.trim() && !newDoc.asana_url.trim()) { showToast('Please add a Dropbox, Canva, or Asana link', 'error'); return; }
    if (!newDoc.function_area) { showToast('Please select a function area', 'error'); return; }
    setAdding(true);
    const err = await addDropboxDocument({
      name: newDoc.name,
      description: newDoc.description,
      dropbox_url: newDoc.dropbox_url.trim() || undefined,
      canva_url: newDoc.canva_url.trim() || undefined,
      asana_url: newDoc.asana_url.trim() || undefined,
      function_area: newDoc.function_area,
      doc_type: newDoc.doc_type || defaultDocType,
      security_level: newDoc.security_level,
      node_key: newDoc.linked && newDoc.linked !== '__catalyst__' ? newDoc.linked : undefined,
      catalyst_key: newDoc.linked === '__catalyst__' ? 'field-catalyst' : undefined,
    });
    if (err) showToast('Failed to add document: ' + err.message, 'error');
    else {
      showToast('Document added');
      setNewDoc({ name: '', description: '', dropbox_url: '', canva_url: '', asana_url: '', linked: '', function_area: '', doc_type: '', security_level: 'all' });
    }
    setAdding(false);
  }

  async function handleEdit(doc: Document, fields: { name: string; description: string; function_area: string; doc_type: string; security_level: 'all' | 'jsp_admin' | 'executive'; dropbox_url?: string; canva_url?: string; asana_url?: string; node_key?: string; catalyst_key?: string }) {
    const err = await updateDocument(doc.id, fields);
    if (err) showToast('Save failed: ' + err.message, 'error');
    else { showToast('Document updated'); setEditModal(null); }
  }

  async function confirmDelete(id: string) {
    setDeleteConfirm(null);
    const err = await deleteDocument(id);
    if (err) showToast('Delete failed: ' + err.message, 'error');
    else showToast('Document deleted');
  }

  return (
    <div style={{ position: 'fixed', top: '56px', left: 0, right: 0, bottom: 0, background: '#F2F1E9', zIndex: 50, overflowY: 'auto', padding: '24px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#1F1D1C', marginBottom: '2px' }}>Document Library</div>
          <div style={{ fontSize: '12px', color: '#9C8878' }}>Reference documents, policies, frameworks, and SOPs</div>
        </div>
        <button onClick={onClose} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #E4E2D6', background: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: '#6A453A', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <X size={12} /> Close
        </button>
      </div>

      {/* Admin: Add Dropbox Document */}
      {isAdmin && (
        <div style={{ border: '1.5px solid #E4E2D6', borderRadius: '12px', padding: '20px', marginBottom: '16px', background: '#fff' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link size={14} /> Add Document
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Dropbox Shared Link</label>
                <input value={newDoc.dropbox_url} onChange={e => setNewDoc(m => ({ ...m, dropbox_url: e.target.value }))} placeholder="https://www.dropbox.com/s/..." style={inputStyle} />
                <div style={{ fontSize: '9.5px', color: '#9C8878', marginTop: '3px' }}>Right-click file in Dropbox → Share → Copy link</div>
              </div>
              <div>
                <label style={labelStyle}>Canva Link</label>
                <input value={newDoc.canva_url} onChange={e => setNewDoc(m => ({ ...m, canva_url: e.target.value }))} placeholder="https://www.canva.com/design/..." style={inputStyle} />
                <div style={{ fontSize: '9.5px', color: '#9C8878', marginTop: '3px' }}>In Canva: Share → Copy link (view-only or public)</div>
              </div>
              <div>
                <label style={labelStyle}>Asana Link</label>
                <input value={newDoc.asana_url} onChange={e => setNewDoc(m => ({ ...m, asana_url: e.target.value }))} placeholder="https://app.asana.com/..." style={inputStyle} />
                <div style={{ fontSize: '9.5px', color: '#9C8878', marginTop: '3px' }}>Copy the link to the Asana project, task, or board</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 200px' }}>
                <label style={labelStyle}>Document Name</label>
                <input value={newDoc.name} onChange={e => setNewDoc(m => ({ ...m, name: e.target.value }))} placeholder="e.g. Staff Handbook 2025" style={inputStyle} />
              </div>
              <div style={{ flex: '3 1 260px' }}>
                <label style={labelStyle}>Description (optional)</label>
                <input value={newDoc.description} onChange={e => setNewDoc(m => ({ ...m, description: e.target.value }))} placeholder="Brief description..." style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Link to Network Map (optional)</label>
              <select value={newDoc.linked} onChange={e => setNewDoc(m => ({ ...m, linked: e.target.value }))} style={inputStyle}>
                <option value="">— Not linked —</option>
                <option value="__catalyst__">Field Catalyst (right bar)</option>
                {networkNodes.map(n => <option key={n.node_key} value={n.node_key}>{n.label.replace(/\n/g, ' ')} ({n.node_key})</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 150px' }}>
                <label style={labelStyle}>Function Area</label>
                <select value={newDoc.function_area} onChange={e => setNewDoc(m => ({ ...m, function_area: e.target.value }))} style={inputStyle}>
                  <option value="">Select area</option>
                  {function_areas.map(fa => <option key={fa.value} value={fa.value}>{fa.label}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 130px' }}>
                <label style={labelStyle}>Document Type</label>
                <select value={newDoc.doc_type || defaultDocType} onChange={e => setNewDoc(m => ({ ...m, doc_type: e.target.value }))} style={inputStyle}>
                  {doc_types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 130px' }}>
                <label style={labelStyle}>Access Level</label>
                <select value={newDoc.security_level} onChange={e => setNewDoc(m => ({ ...m, security_level: e.target.value as 'all' | 'jsp_admin' | 'executive' }))} style={inputStyle}>
                  {access_levels.map(al => <option key={al.value} value={al.value}>{al.label}</option>)}
                </select>
              </div>
              <button onClick={handleAdd} disabled={adding} style={{ padding: '8px 20px', background: '#1F1D1C', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif', whiteSpace: 'nowrap', opacity: adding ? 0.6 : 1 }}>
                {adding ? 'Adding...' : 'Add Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button onClick={() => setFilter('all')} style={{ padding: '5px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', border: '1px solid #E4E2D6', background: filter === 'all' ? '#1F1D1C' : '#fff', color: filter === 'all' ? '#fff' : '#9C8878', fontFamily: 'Verdana,sans-serif', transition: 'all .14s' }}>
          All Documents
        </button>
        {function_areas.map(fa => (
          <button key={fa.value} onClick={() => setFilter(fa.value)} style={{ padding: '5px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', border: '1px solid #E4E2D6', background: filter === fa.value ? '#1F1D1C' : '#fff', color: filter === fa.value ? '#fff' : '#9C8878', fontFamily: 'Verdana,sans-serif', transition: 'all .14s' }}>
            {fa.label}
          </button>
        ))}
      </div>

      {/* Document grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9C8878', fontSize: '12px' }}>Loading documents...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {[...visible, ...locked].map(doc => (
            <DocCard
              key={doc.id}
              doc={doc}
              functionAreas={function_areas}
              canSee={canSeeDoc(doc)}
              isAdmin={isAdmin}
              onPreview={() => setPreviewDoc(doc)}
              onEdit={() => setEditModal(doc)}
              onDelete={() => setDeleteConfirm(doc)}
            />
          ))}
        </div>
      )}

      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}

      {editModal && (
        <EditDocModal
          doc={editModal}
          functionAreas={function_areas}
          docTypes={doc_types}
          accessLevels={access_levels}
          networkNodes={networkNodes}
          onSave={fields => handleEdit(editModal, fields)}
          onClose={() => setEditModal(null)}
        />
      )}

      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(31,29,28,.55)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', padding: '24px 28px', width: '100%', maxWidth: '380px', boxShadow: '0 8px 32px rgba(31,29,28,.18)' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '6px' }}>Delete Document?</div>
            <div style={{ fontSize: '12px', color: '#9C8878', marginBottom: '20px', lineHeight: 1.5 }}>
              <strong style={{ color: '#1F1D1C' }}>{deleteConfirm.name}</strong> will be permanently removed from the library. The original file in Dropbox will not be affected.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '8px 18px', borderRadius: '7px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif' }}>Cancel</button>
              <button onClick={() => confirmDelete(deleteConfirm.id)} style={{ padding: '8px 18px', borderRadius: '7px', border: 'none', background: '#DC2626', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
