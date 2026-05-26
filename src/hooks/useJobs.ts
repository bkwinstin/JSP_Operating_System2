import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Job } from '../lib/types';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchJobs() {
    setLoading(true);
    const [jobsRes, whyRes, principlesRes, connectionRes, toolsRes] = await Promise.all([
      supabase.from('jobs').select('*').order('sort_order'),
      supabase.from('job_why').select('*'),
      supabase.from('job_how_principles').select('*').order('sort_order'),
      supabase.from('job_how_connection').select('*'),
      supabase.from('job_what_tools').select('*').order('sort_order'),
    ]);

    const whyMap: Record<string, typeof whyRes.data[0]> = {};
    whyRes.data?.forEach(w => { whyMap[w.job_id] = w; });

    const principlesMap: Record<string, typeof principlesRes.data> = {};
    principlesRes.data?.forEach(p => {
      if (!principlesMap[p.job_id]) principlesMap[p.job_id] = [];
      principlesMap[p.job_id].push(p);
    });

    const connectionMap: Record<string, typeof connectionRes.data[0]> = {};
    connectionRes.data?.forEach(c => { connectionMap[c.job_id] = c; });

    const toolsMap: Record<string, typeof toolsRes.data> = {};
    toolsRes.data?.forEach(t => {
      if (!toolsMap[t.job_id]) toolsMap[t.job_id] = [];
      toolsMap[t.job_id].push(t);
    });

    const combined: Job[] = (jobsRes.data || []).map(j => ({
      ...j,
      why: whyMap[j.id],
      howPrinciples: principlesMap[j.id] || [],
      howConnection: connectionMap[j.id],
      whatTools: toolsMap[j.id] || [],
    }));

    setJobs(combined);
    setLoading(false);
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  async function updateWhy(jobId: string, data: { statement: string; body: string; anchor: string; values: string[] }, userId: string) {
    const { error } = await supabase
      .from('job_why')
      .update({ ...data, updated_at: new Date().toISOString(), updated_by: userId })
      .eq('job_id', jobId);
    if (!error) await fetchJobs();
    return error;
  }

  async function updatePrinciple(principleId: string, data: { title: string; body: string }, userId: string) {
    const { error } = await supabase
      .from('job_how_principles')
      .update({ ...data, updated_at: new Date().toISOString(), updated_by: userId })
      .eq('id', principleId);
    if (!error) await fetchJobs();
    return error;
  }

  async function updateConnection(jobId: string, body: string, userId: string) {
    const { error } = await supabase
      .from('job_how_connection')
      .update({ body, updated_at: new Date().toISOString(), updated_by: userId })
      .eq('job_id', jobId);
    if (!error) await fetchJobs();
    return error;
  }

  async function addTool(jobId: string, data: { name: string; description: string; tag: string; system_name: string; sort_order: number; principle_id?: string; document_id?: string }) {
    const { error } = await supabase.from('job_what_tools').insert({ job_id: jobId, ...data });
    if (!error) await fetchJobs();
    return error;
  }

  async function updateTool(toolId: string, data: { name: string; description: string; tag: string; system_name: string; sort_order: number; principle_id?: string; document_id?: string }) {
    const { error } = await supabase.from('job_what_tools').update(data).eq('id', toolId);
    if (!error) await fetchJobs();
    return error;
  }

  async function deleteTool(toolId: string) {
    const { error } = await supabase.from('job_what_tools').delete().eq('id', toolId);
    if (!error) await fetchJobs();
    return error;
  }

  return { jobs, loading, fetchJobs, updateWhy, updatePrinciple, updateConnection, addTool, updateTool, deleteTool };
}
