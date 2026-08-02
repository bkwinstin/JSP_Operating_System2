import { useState, useEffect } from 'react';
import { Job, Document, JobHowPrinciple, JobWhatTool } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ChevronDown, Pencil, Download, Lock, FileText, ExternalLink } from 'lucide-react';

interface TileProps {
  layer: 'why' | 'how';
  job: Job;
  isOpen: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  onOpenFullMap: () => void;
}

function WhyBody({ job }: { job: Job }) {
  const why = job.why;
  if (!why) return null;
  return (
    <div>
      <p style={{ fontSize: '12px', color: '#6A453A', lineHeight: 1.75, marginBottom: '14px' }}>{why.body}</p>
      <div style={{ padding: '12px 15px', borderRadius: '8px', borderLeft: `4px solid ${job.color}`, background: job.light, fontSize: '12px', lineHeight: 1.65, marginBottom: '14px', fontStyle: 'italic', color: job.dark }}>
        {why.anchor}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {why.values.map(v => (
          <span key={v} style={{ fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '12px', background: job.light, color: job.dark, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

function DocAttachment({ doc, canSee }: { doc: Document; canSee: boolean }) {
  if (!canSee) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '6px', background: 'rgba(255,255,255,.5)', border: '1px solid #E4E2D6', opacity: 0.5 }}>
        <Lock size={11} color="#9C8878" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#9C8878', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', flex: 1 }}>{doc.name}</span>
        <span style={{ fontSize: '9px', color: '#9C8878' }}>Executive access</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '6px', background: 'rgba(255,255,255,.7)', border: '1px solid #E4E2D6', transition: 'background .12s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.7)'; }}
    >
      <FileText size={11} color="#9C8878" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#1F1D1C', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '1px' }}>{doc.name}</div>
        <div style={{ fontSize: '9px', color: '#9C8878', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.description}</div>
      </div>
      <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#E4E2D6', color: '#6A453A', flexShrink: 0 }}>{doc.doc_type}</span>
      {doc.canva_url && (
        <a
          href={doc.canva_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          title="Open in Canva"
          style={{ padding: '3px 7px', borderRadius: '4px', border: '1px solid #C4A3E8', background: '#F3EAFF', color: '#5B1AAA', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', flexShrink: 0, fontSize: '9px', fontWeight: 700, fontFamily: 'Verdana,sans-serif' }}
        >
          <ExternalLink size={10} /> Canva
        </a>
      )}
      {doc.asana_url && (
        <a
          href={doc.asana_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          title="Open in Asana"
          style={{ padding: '3px 7px', borderRadius: '4px', border: '1px solid #F0B59A', background: '#FDE9DC', color: '#B54218', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', flexShrink: 0, fontSize: '9px', fontWeight: 700, fontFamily: 'Verdana,sans-serif' }}
        >
          <ExternalLink size={10} /> Asana
        </a>
      )}
      {doc.storage_url && !doc.canva_url && !doc.asana_url && (
        <a
          href={doc.storage_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{ padding: '3px 7px', borderRadius: '4px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', flexShrink: 0 }}
        >
          <Download size={10} />
        </a>
      )}
    </div>
  );
}

function ToolAttachment({ tool, job, linkedDoc, canSeeDoc }: { tool: JobWhatTool; job: Job; linkedDoc?: Document; canSeeDoc?: (doc: Document) => boolean }) {
  const docUrl = linkedDoc?.asana_url || linkedDoc?.canva_url || linkedDoc?.dropbox_url || linkedDoc?.storage_url;
  const isCanva = !!(linkedDoc?.canva_url);
  const isAsana = !!(linkedDoc?.asana_url);
  const canAccess = linkedDoc ? (canSeeDoc ? canSeeDoc(linkedDoc) : true) : true;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '6px', background: job.light, border: `1px solid ${job.color}25` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: job.dark, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginBottom: '1px' }}>{tool.name}</div>
        <div style={{ fontSize: '9px', color: job.dark, opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tool.description}</div>
        {linkedDoc && (
          <div style={{ fontSize: '9px', color: job.dark, opacity: 0.55, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <FileText size={9} />
            {linkedDoc.name}
          </div>
        )}
      </div>
      <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: `${job.color}30`, color: job.dark, flexShrink: 0 }}>{tool.tag}</span>
      {tool.system_name && <span style={{ fontSize: '9px', color: job.dark, opacity: 0.5, flexShrink: 0 }}>{tool.system_name}</span>}
      {linkedDoc && !canAccess && (
        <span title="Executive access only" style={{ display: 'flex', alignItems: 'center', padding: '3px 6px', borderRadius: '4px', border: `1px solid ${job.color}30`, background: 'rgba(255,255,255,.4)', color: job.dark, opacity: 0.5 }}>
          <Lock size={10} />
        </span>
      )}
      {linkedDoc && canAccess && docUrl && (
        <a
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          title={`Open ${linkedDoc.name}`}
          style={{ padding: '3px 7px', borderRadius: '4px', border: isAsana ? '1px solid #F0B59A' : isCanva ? '1px solid #C4A3E8' : `1px solid ${job.color}40`, background: isAsana ? '#FDE9DC' : isCanva ? '#F3EAFF' : 'rgba(255,255,255,.6)', color: isAsana ? '#B54218' : isCanva ? '#5B1AAA' : job.dark, display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', flexShrink: 0, fontSize: '9px', fontWeight: 700, fontFamily: 'Verdana,sans-serif', transition: 'background .12s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = isAsana ? '#FBD3BC' : isCanva ? '#EBD9FF' : '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = isAsana ? '#FDE9DC' : isCanva ? '#F3EAFF' : 'rgba(255,255,255,.6)'; }}
        >
          <ExternalLink size={10} />
          {isAsana ? 'Asana' : isCanva ? 'Canva' : 'Open'}
        </a>
      )}
    </div>
  );
}

interface PrincipleRowProps {
  principle: JobHowPrinciple;
  index: number;
  job: Job;
  tool?: JobWhatTool;
  toolLinkedDoc?: Document;
  docs: Document[];
  canSeeDoc: (doc: Document) => boolean;
}

function PrincipleRow({ principle, index, job, tool, toolLinkedDoc, docs, canSeeDoc }: PrincipleRowProps) {
  const [expanded, setExpanded] = useState(true);
  const hasAttachments = !!tool || docs.length > 0;

  return (
    <div style={{ borderRadius: '8px', background: '#F2F1E9', overflow: 'hidden', border: '1px solid #E4E2D6' }}>
      {/* Principle header */}
      <div
        onClick={() => setExpanded(p => !p)}
        style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '11px 13px', cursor: hasAttachments ? 'pointer' : 'default', userSelect: 'none' }}
      >
        <div style={{ width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, background: job.light, color: job.dark, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', marginTop: '1px' }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, fontSize: '12px', color: '#6A453A', lineHeight: 1.6 }}>
          <b style={{ color: '#1F1D1C', display: 'block', marginBottom: '2px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', fontSize: '12px' }}>{principle.title}</b>
          {principle.body.split('\n\n').map((para, pi, arr) => (
            <p key={pi} style={{ marginBottom: pi < arr.length - 1 ? '8px' : 0 }}>{para}</p>
          ))}
        </div>
        {hasAttachments && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '2px', flexShrink: 0 }}>
            {tool && (
              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: job.light, color: job.dark, border: `1px solid ${job.color}30` }}>
                {tool.tag}
              </span>
            )}
            {docs.length > 0 && (
              <span style={{ fontSize: '9px', color: '#9C8878', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <FileText size={10} />
                {docs.length}
              </span>
            )}
            <ChevronDown
              size={14}
              color="#9C8878"
              style={{ transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'none' }}
            />
          </div>
        )}
      </div>

      {/* Attachments panel */}
      {hasAttachments && expanded && (
        <div style={{ padding: '0 13px 13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {tool && <ToolAttachment tool={tool} job={job} linkedDoc={toolLinkedDoc} canSeeDoc={canSeeDoc} />}
          {docs.map(doc => (
            <DocAttachment key={doc.id} doc={doc} canSee={canSeeDoc(doc)} />
          ))}
        </div>
      )}
    </div>
  );
}

function HowBody({ job }: { job: Job }) {
  const { profile } = useAuth();
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    if (!job.function_area) return;
    supabase
      .from('documents')
      .select('*')
      .eq('function_area', job.function_area)
      .order('name')
      .then(({ data }) => setDocs((data as Document[]) || []));
  }, [job.function_area]);

  function canSeeDoc(doc: Document) {
    if (doc.security_level === 'all') return true;
    return profile?.role === 'executive' || profile?.role === 'admin';
  }

  const principles = job.howPrinciples || [];
  const tools = job.whatTools || [];

  const toolByPrincipleId: Record<string, JobWhatTool> = {};
  tools.forEach(t => { if (t.principle_id) toolByPrincipleId[t.principle_id] = t; });

  const docById: Record<string, Document> = {};
  docs.forEach(d => { docById[d.id] = d; });

  const docsByPrincipleId: Record<string, Document[]> = {};
  docs.forEach(d => {
    if (d.principle_id) {
      if (!docsByPrincipleId[d.principle_id]) docsByPrincipleId[d.principle_id] = [];
      docsByPrincipleId[d.principle_id].push(d);
    }
  });

  const toolLinkedDocIds = new Set(tools.map(t => t.document_id).filter(Boolean));
  const unattachedDocs = docs.filter(d => !d.principle_id && !toolLinkedDocIds.has(d.id));

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        {principles.map((p, i) => {
          const tool = toolByPrincipleId[p.id];
          const linkedDocId = tool?.document_id;
          const principleDocs = (docsByPrincipleId[p.id] || []).filter(d => d.id !== linkedDocId);
          return (
            <PrincipleRow
              key={p.id}
              principle={p}
              index={i}
              job={job}
              tool={tool}
              toolLinkedDoc={linkedDocId ? docById[linkedDocId] : undefined}
              docs={principleDocs}
              canSeeDoc={canSeeDoc}
            />
          );
        })}
      </div>

      {/* Docs not linked to any principle */}
      {unattachedDocs.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9C8878', marginBottom: '6px', fontFamily: '"Century Gothic","Trebuchet MS",sans-serif' }}>
            Additional Documents
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {unattachedDocs.map(doc => (
              <DocAttachment key={doc.id} doc={doc} canSee={canSeeDoc(doc)} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export function TileAccordion({ layer, job, isOpen, onToggle, onEdit, onOpenFullMap }: TileProps) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const configs = {
    why: {
      label: 'Why it matters',
      title: `Why ${job.name} matters`,
      sub: job.why?.statement || '',
      headerBg: job.dark,
      pillBg: job.color,
      pillTc: job.dark,
      headerTc: '#fff',
    },
    how: {
      label: 'How &amp; What',
      title: 'How it works',
      sub: 'Principles, tools, and documents',
      headerBg: job.color,
      pillBg: job.dark,
      pillTc: '#fff',
      headerTc: '#fff',
    },
  };

  const c = configs[layer];

  return (
    <div style={{
      background: '#fff', borderRadius: '12px', border: '1px solid #E4E2D6',
      marginBottom: '10px', overflow: 'hidden',
      boxShadow: isOpen ? '0 2px 12px rgba(31,29,28,.10)' : '0 1px 4px rgba(31,29,28,.06)',
      transition: 'box-shadow .18s',
    }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '0', cursor: 'pointer', background: c.headerBg,
          borderRadius: isOpen ? '12px 12px 0 0' : '12px',
          transition: 'background .14s', userSelect: 'none',
        }}
      >
        <div style={{ padding: '14px 18px', flex: 1, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            style={{
              fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em',
              padding: '4px 11px', borderRadius: '10px',
              background: c.pillBg, color: c.pillTc,
              fontFamily: '"Century Gothic","Trebuchet MS",sans-serif',
              flexShrink: 0, whiteSpace: 'nowrap',
            }}
            dangerouslySetInnerHTML={{ __html: c.label }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: c.headerTc, lineHeight: 1.25, marginBottom: '2px' }}>
              {c.title}
            </div>
            <div style={{ fontSize: '11px', color: c.headerTc, opacity: 0.7, lineHeight: 1.35 }}>
              {c.sub}
            </div>
          </div>
          {isAdmin && onEdit && (
            <button
              onClick={e => { e.stopPropagation(); onEdit(); }}
              style={{ padding: '4px 8px', borderRadius: '5px', border: `1px solid ${c.pillBg}60`, background: 'rgba(255,255,255,.15)', color: c.headerTc, fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <Pencil size={10} />
              Edit
            </button>
          )}
        </div>
        <div style={{ padding: '14px 18px 14px 0', fontSize: '13px', color: c.headerTc, transition: 'transform .22s', transform: isOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
          <ChevronDown size={16} />
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: '2px 22px 22px' }}>
          <div style={{ paddingTop: '14px', borderTop: '1px solid #E4E2D6' }}>
            {layer === 'why' && <WhyBody job={job} />}
            {layer === 'how' && <HowBody job={job} />}
          </div>
        </div>
      )}
    </div>
  );
}
