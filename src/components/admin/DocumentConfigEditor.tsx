import { useState } from 'react';
import { useDocumentConfig, ConfigItem } from '../../hooks/useDocumentConfig';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2, GripVertical, Save, ChevronDown, ChevronRight } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  padding: '6px 9px', borderRadius: '6px', border: '1px solid #E4E2D6',
  fontSize: '11px', fontFamily: 'Verdana,sans-serif', background: '#FAFAF7', color: '#1F1D1C',
};

const labelStyle: React.CSSProperties = {
  fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em',
  color: '#9C8878', display: 'block', marginBottom: '3px',
};

// A single editable row for a config item
function ItemRow({ item, showColor, onChange, onDelete }: {
  item: ConfigItem;
  showColor: boolean;
  onChange: (updated: ConfigItem) => void;
  onDelete: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 0', borderBottom: '1px solid #F2F1E9' }}>
      <GripVertical size={13} color="#C8C4B4" style={{ flexShrink: 0, cursor: 'grab' }} />

      <div style={{ flex: '2 1 120px' }}>
        <input
          value={item.label}
          onChange={e => onChange({ ...item, label: e.target.value })}
          placeholder="Label shown to users"
          style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ flex: '2 1 120px' }}>
        <input
          value={item.value}
          onChange={e => onChange({ ...item, value: e.target.value })}
          placeholder="Internal value (no spaces)"
          style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', fontFamily: 'monospace' }}
        />
      </div>

      {showColor && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="color"
              value={item.color || '#888888'}
              onChange={e => onChange({ ...item, color: e.target.value })}
              style={{ width: '28px', height: '28px', padding: '1px', border: '1px solid #E4E2D6', borderRadius: '5px', cursor: 'pointer', background: 'none' }}
              title="Tag color"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="color"
              value={item.light || '#F0F0F0'}
              onChange={e => onChange({ ...item, light: e.target.value })}
              style={{ width: '28px', height: '28px', padding: '1px', border: '1px solid #E4E2D6', borderRadius: '5px', cursor: 'pointer', background: 'none' }}
              title="Light background color"
            />
          </div>
        </>
      )}

      <button
        onClick={onDelete}
        style={{ padding: '5px', borderRadius: '5px', border: '1px solid #E4E2D6', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
        title="Remove item"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

// A collapsible section for one config key
function ConfigSection({ title, description, configKey, items, showColor, onSave }: {
  title: string;
  description: string;
  configKey: 'function_areas' | 'doc_types' | 'access_levels';
  items: ConfigItem[];
  showColor: boolean;
  onSave: (key: 'function_areas' | 'doc_types' | 'access_levels', items: ConfigItem[]) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ConfigItem[]>(items);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Sync if parent items change (e.g. after save)
  // Only reset if not mid-edit
  function update(updated: ConfigItem[]) {
    setDraft(updated);
    setDirty(true);
  }

  function addItem() {
    update([...draft, { value: '', label: '', color: '#888888', light: '#F0F0F0' }]);
  }

  function deleteItem(idx: number) {
    update(draft.filter((_, i) => i !== idx));
  }

  function changeItem(idx: number, updated: ConfigItem) {
    update(draft.map((item, i) => (i === idx ? updated : item)));
  }

  async function handleSave() {
    const cleaned = draft.filter(i => i.value.trim() && i.label.trim());
    if (cleaned.length === 0) { showToast('Add at least one item before saving', 'error'); return; }
    setSaving(true);
    await onSave(configKey, cleaned);
    setDirty(false);
    setSaving(false);
    showToast(`${title} saved`);
  }

  return (
    <div style={{ border: '1px solid #E4E2D6', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '13px 16px', background: open ? '#fff' : '#FAFAF7', border: 'none', borderBottom: open ? '1px solid #E4E2D6' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {open ? <ChevronDown size={13} color="#9C8878" /> : <ChevronRight size={13} color="#9C8878" />}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#1F1D1C' }}>{title}</div>
            <div style={{ fontSize: '10px', color: '#9C8878' }}>{description}</div>
          </div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#F2F1E9', color: '#9C8878' }}>{draft.length} items</span>
      </button>

      {open && (
        <div style={{ padding: '14px 16px', background: '#fff' }}>
          {/* Column headers */}
          <div style={{ display: 'flex', gap: '6px', paddingBottom: '4px', paddingLeft: '19px' }}>
            <div style={{ flex: '2 1 120px' }}><span style={labelStyle}>Label</span></div>
            <div style={{ flex: '2 1 120px' }}><span style={labelStyle}>Value (internal key)</span></div>
            {showColor && (
              <>
                <div style={{ width: '28px' }}><span style={{ ...labelStyle, textAlign: 'center' }}>Color</span></div>
                <div style={{ width: '28px' }}><span style={{ ...labelStyle, textAlign: 'center' }}>Light</span></div>
              </>
            )}
            <div style={{ width: '28px' }} />
          </div>

          {draft.map((item, idx) => (
            <ItemRow
              key={idx}
              item={item}
              showColor={showColor}
              onChange={updated => changeItem(idx, updated)}
              onDelete={() => deleteItem(idx)}
            />
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <button
              onClick={addItem}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px dashed #C8C4B4', background: 'transparent', color: '#9C8878', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all .14s' }}
            >
              <Plus size={11} /> Add item
            </button>

            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '7px 16px', borderRadius: '7px', border: 'none', background: '#1F1D1C', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Verdana,sans-serif', display: 'flex', alignItems: 'center', gap: '5px', opacity: saving ? 0.6 : 1 }}
              >
                <Save size={11} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function DocumentConfigEditor() {
  const { config, saveConfigKey } = useDocumentConfig();

  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '4px' }}>Dropdown Options</div>
      <div style={{ fontSize: '11px', color: '#9C8878', marginBottom: '14px', lineHeight: 1.6 }}>
        Customize the choices that appear in document dropdowns. Changes take effect immediately.
      </div>

      <ConfigSection
        title="Function Areas"
        description="Categories shown as filter tabs in the Document Library"
        configKey="function_areas"
        items={config.function_areas}
        showColor={true}
        onSave={saveConfigKey}
      />
      <ConfigSection
        title="Document Types"
        description="Types available when adding or editing a document"
        configKey="doc_types"
        items={config.doc_types}
        showColor={false}
        onSave={saveConfigKey}
      />
      <ConfigSection
        title="Access Levels"
        description="Access level options for controlling document visibility"
        configKey="access_levels"
        items={config.access_levels}
        showColor={false}
        onSave={saveConfigKey}
      />
    </div>
  );
}
