import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface ConfigItem {
  value: string;
  label: string;
  color?: string;
  light?: string;
}

export interface DocumentConfig {
  function_areas: ConfigItem[];
  doc_types: ConfigItem[];
  access_levels: ConfigItem[];
}

const DEFAULT_CONFIG: DocumentConfig = {
  function_areas: [
    { value: 'staff-development',  label: 'Staff Dev',   color: '#90226C', light: '#F0D9E8' },
    { value: 'operations',         label: 'Operations',  color: '#1F1D1C', light: '#ECEAE5' },
    { value: 'project-delivery',   label: 'Delivery',    color: '#F3755E', light: '#FDE8E2' },
    { value: 'funder-development', label: 'Funder Dev',  color: '#FABE3D', light: '#FEF3CC' },
    { value: 'communications',     label: 'Comms',       color: '#6A453A', light: '#EDE0DC' },
  ],
  doc_types: [
    { value: 'Reference', label: 'Reference' },
    { value: 'Policy',    label: 'Policy' },
    { value: 'SOP',       label: 'SOP' },
    { value: 'Framework', label: 'Framework' },
    { value: 'Strategy',  label: 'Strategy' },
    { value: 'Data',      label: 'Data' },
    { value: 'Document',  label: 'Document' },
  ],
  access_levels: [
    { value: 'all',       label: 'All Staff' },
    { value: 'executive', label: 'Executive Only' },
  ],
};

export function useDocumentConfig() {
  const [config, setConfig] = useState<DocumentConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('document_config').select('config_key, items');
    if (data && data.length > 0) {
      const merged = { ...DEFAULT_CONFIG };
      for (const row of data) {
        if (row.config_key === 'function_areas') merged.function_areas = row.items as ConfigItem[];
        if (row.config_key === 'doc_types') merged.doc_types = row.items as ConfigItem[];
        if (row.config_key === 'access_levels') merged.access_levels = row.items as ConfigItem[];
      }
      setConfig(merged);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  async function saveConfigKey(key: keyof DocumentConfig, items: ConfigItem[]) {
    const { error } = await supabase
      .from('document_config')
      .upsert({ config_key: key, items, updated_at: new Date().toISOString() }, { onConflict: 'config_key' });
    if (!error) {
      setConfig(c => ({ ...c, [key]: items }));
    }
    return error;
  }

  return { config, loading, saveConfigKey, fetchConfig };
}
