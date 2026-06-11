import { useState, Component, ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#1F1D1C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '480px', background: 'rgba(255,255,255,.06)', borderRadius: '12px', padding: '28px', border: '1px solid rgba(255,255,255,.1)' }}>
            <div style={{ fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', fontSize: '14px', fontWeight: 700, color: '#FABE3D', marginBottom: '10px' }}>Something went wrong</div>
            <pre style={{ fontSize: '11px', color: 'rgba(255,255,255,.6)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
              {(this.state.error as Error).message}
            </pre>
            <button onClick={() => window.location.reload()} style={{ marginTop: '18px', padding: '8px 18px', borderRadius: '6px', background: '#FABE3D', color: '#1F1D1C', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import { useJobs } from './hooks/useJobs';
import { Job } from './lib/types';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { TileAccordion } from './components/tiles/TileAccordion';
import { EmptyState } from './components/common/EmptyState';
import { DocumentLibrary } from './components/documents/DocumentLibrary';
import { NetworkMap } from './components/network/NetworkMap';
import { AdminPanel } from './components/admin/AdminPanel';
import { AIChat } from './components/chat/AIChat';

type View = 'home' | 'documents' | 'network' | 'admin';

function MainApp() {
  const { user, profile, loading: authLoading, passwordRecoveryMode } = useAuth();
  const { jobs, loading: jobsLoading, fetchJobs } = useJobs();

  const [view, setView] = useState<View>('home');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const activeJob = activeJobId ? (jobs.find(j => j.id === activeJobId) ?? null) : null;
  const [openTile, setOpenTile] = useState<'why' | 'how' | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showChat, setShowChat] = useState(false);

  if (authLoading || (user && !profile)) {
    return (
      <div style={{ minHeight: '100vh', background: '#F2F1E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', fontSize: '13px', color: '#9C8878' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!user || !profile || passwordRecoveryMode) {
    return <LoginPage />;
  }

  function handleJobSelect(job: Job) {
    setActiveJobId(prev => prev === job.id ? null : job.id);
    setOpenTile(null);
    setView('home');
  }

  function handleTileToggle(tile: 'why' | 'how') {
    setOpenTile(prev => prev === tile ? null : tile);
  }

  function handleViewChange(v: string) {
    setView(v as View);
    if (v !== 'home') {
      setActiveJobId(null);
      setOpenTile(null);
    }
  }

  function handleNetworkClick() {
    setView('network');
    setActiveJobId(null);
    setOpenTile(null);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F2F1E9', fontFamily: 'Verdana,sans-serif' }}>
      <Header
        activeView={view}
        onViewChange={handleViewChange}
        onAdminClick={() => setShowAdmin(true)}
        onChatClick={() => setShowChat(p => !p)}
      />

      <div style={{ paddingTop: '56px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {view === 'home' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
            {jobsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <span style={{ fontSize: '11px', color: '#9C8878' }}>Loading...</span>
              </div>
            ) : activeJob ? (
              <div style={{ maxWidth: '820px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#1F1D1C', marginBottom: '4px' }}>
                      {activeJob.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9C8878', lineHeight: 1.6 }}>
                      {activeJob.why?.statement || 'Explore why this matters, how it works, and what we do.'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '4px' }}>
                    {jobs.filter(j => j.id !== activeJob.id).map(j => (
                      <button
                        key={j.id}
                        onClick={() => handleJobSelect(j)}
                        style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${j.color}40`, background: j.light, cursor: 'pointer', fontSize: '10px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: j.dark, transition: 'all .15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
                      >
                        {j.name}
                      </button>
                    ))}
                    <button
                      onClick={handleNetworkClick}
                      style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(31,29,28,.18)', background: '#1F1D1C', cursor: 'pointer', fontSize: '10px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#FABE3D', transition: 'all .15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                    >
                      Field Catalyst
                    </button>
                  </div>
                </div>

                <TileAccordion
                  layer="why"
                  job={activeJob}
                  isOpen={openTile === 'why'}
                  onToggle={() => handleTileToggle('why')}
                  onEdit={() => setShowAdmin(true)}
                  onOpenFullMap={handleNetworkClick}
                />
                <TileAccordion
                  layer="how"
                  job={activeJob}
                  isOpen={openTile === 'how'}
                  onToggle={() => handleTileToggle('how')}
                  onEdit={() => setShowAdmin(true)}
                  onOpenFullMap={handleNetworkClick}
                />
              </div>
            ) : (
              <EmptyState jobs={jobs} onJobSelect={handleJobSelect} onNetworkClick={handleNetworkClick} />
            )}
          </div>
        )}

        {view === 'documents' && (
          <DocumentLibrary onClose={() => setView('home')} />
        )}

        {view === 'network' && (
          <NetworkMap onClose={() => setView('home')} />
        )}
      </div>

      {showAdmin && (
        <AdminPanel
          jobs={jobs}
          onClose={() => setShowAdmin(false)}
          onGoToDocs={() => { setShowAdmin(false); setView('documents'); }}
          onSaved={fetchJobs}
        />
      )}

      {showChat && (
        <AIChat onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
