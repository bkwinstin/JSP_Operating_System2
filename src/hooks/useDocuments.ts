import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Document } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';

// Convert a Dropbox share link to a direct download URL (dl=1).
export function toDropboxEmbedUrl(url: string): string {
  return toDropboxDownloadUrl(url);
}

// Build a Dropbox preview URL (opens Dropbox's own preview UI).
export function toDropboxPreviewUrl(dropboxUrl: string): string {
  try {
    const u = new URL(dropboxUrl);
    u.searchParams.delete('dl');
    u.searchParams.delete('raw');
    return u.toString();
  } catch {
    return dropboxUrl;
  }
}

// Convert a Dropbox share link to a direct download URL (dl=1).
export function toDropboxDownloadUrl(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set('dl', '1');
    return u.toString();
  } catch {
    return url;
  }
}

export function useDocuments() {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('documents').select('*').order('name');
    setDocuments((data as Document[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  function canSeeDoc(doc: Document) {
    if (doc.security_level === 'all') return true;
    const role = profile?.role;
    if (doc.security_level === 'jsp_admin') {
      return role === 'jsp_admin' || role === 'executive' || role === 'admin';
    }
    // 'executive' level
    return role === 'executive' || role === 'admin';
  }

  async function getDownloadUrl(doc: Document): Promise<string | null> {
    // Prefer Dropbox link
    if (doc.dropbox_url) return toDropboxDownloadUrl(doc.dropbox_url);

    if (!doc.storage_url) return null;
    const marker = '/object/public/documents/';
    const markerSign = '/object/sign/documents/';
    let path = doc.storage_url;
    if (path.includes(marker)) {
      path = decodeURIComponent(path.split(marker)[1]);
    } else if (path.includes(markerSign)) {
      path = decodeURIComponent(path.split(markerSign)[1].split('?')[0]);
    }
    const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 60);
    if (error || !data) return null;
    return data.signedUrl;
  }

  async function addDropboxDocument(meta: {
    name: string;
    description: string;
    function_area: string;
    doc_type: string;
    security_level: 'all' | 'jsp_admin' | 'executive';
    dropbox_url?: string;
    canva_url?: string;
    asana_url?: string;
    node_key?: string;
    catalyst_key?: string;
  }) {
    const { error } = await supabase.from('documents').insert({
      ...meta,
      doc_date: new Date().getFullYear().toString(),
      is_default: false,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });
    if (!error) await fetchDocuments();
    return error;
  }

  async function deleteDocument(id: string) {
    const doc = documents.find(d => d.id === id);
    if (doc?.storage_url && !doc.storage_url.startsWith('http')) {
      const marker = '/object/public/documents/';
      let path = doc.storage_url;
      if (path.includes(marker)) {
        path = decodeURIComponent(path.split(marker)[1]);
      }
      await supabase.storage.from('documents').remove([path]);
    }
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (!error) await fetchDocuments();
    return error;
  }

  async function updateSecurityLevel(id: string, level: 'all' | 'jsp_admin' | 'executive') {
    const { error } = await supabase.from('documents').update({ security_level: level }).eq('id', id);
    if (!error) await fetchDocuments();
    return error;
  }

  async function updateDocument(id: string, fields: {
    name: string;
    description: string;
    function_area: string;
    doc_type: string;
    security_level: 'all' | 'jsp_admin' | 'executive';
    dropbox_url?: string;
    canva_url?: string;
    asana_url?: string;
    node_key?: string;
    catalyst_key?: string;
  }) {
    const { error } = await supabase.from('documents').update(fields).eq('id', id);
    if (!error) await fetchDocuments();
    return error;
  }

  return {
    documents,
    loading,
    canSeeDoc,
    getDownloadUrl,
    addDropboxDocument,
    deleteDocument,
    updateSecurityLevel,
    updateDocument,
    fetchDocuments,
  };
}
