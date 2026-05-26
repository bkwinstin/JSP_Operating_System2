import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessage } from '../../lib/types';

interface AIChatProps {
  onClose: () => void;
}

export function AIChat({ onClose }: AIChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadHistory() {
    if (!user) return;
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);
    if (data) setMessages(data as ChatMessage[]);
    setInitialLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || loading || !user) return;
    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    const userChatMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userChatMsg]);

    await supabase.from('chat_messages').insert({ user_id: user.id, role: 'user', content: userMsg });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            message: userMsg,
            history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          }),
        }
      );

      const data = await response.json();
      const assistantContent = data.response || data.error || data.message || (!response.ok ? `Error ${response.status}: Something went wrong. Please try again.` : 'I encountered an issue. Please try again.');

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      await supabase.from('chat_messages').insert({ user_id: user.id, role: 'assistant', content: assistantContent });
    } catch {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m unable to connect right now. Please check your connection and try again.',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    }

    setLoading(false);
  }

  async function clearHistory() {
    if (!user) return;
    await supabase.from('chat_messages').delete().eq('user_id', user.id);
    setMessages([]);
  }

  const SUGGESTED = [
    'What are JSP\'s four Jobs to Be Done?',
    'How does the Employee Investment Plan work?',
    'What is the CRMC methodology?',
    'How does JSP approach system change?',
  ];

  return (
    <div style={{
      position: 'fixed', top: '56px', right: 0, bottom: 0, width: '380px',
      background: '#fff', zIndex: 100,
      borderLeft: '1px solid #E4E2D6',
      display: 'flex', flexDirection: 'column',
      boxShadow: '-4px 0 20px rgba(31,29,28,.1)',
    }}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid #E4E2D6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1F1D1C' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#90226C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={15} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#fff' }}>JSP AI Assistant</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.5)' }}>Powered by AI · Ask anything about JSP</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {messages.length > 0 && (
            <button onClick={clearHistory} style={{ fontSize: '9px', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,.15)', background: 'transparent', color: 'rgba(255,255,255,.5)', cursor: 'pointer' }}>
              Clear
            </button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {initialLoading ? (
          <div style={{ textAlign: 'center', color: '#9C8878', fontSize: '12px', padding: '20px' }}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0D9E8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Bot size={24} color="#90226C" />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#1F1D1C', marginBottom: '4px', textAlign: 'center' }}>Hi! I'm the JSP AI Assistant</div>
            <div style={{ fontSize: '11px', color: '#9C8878', textAlign: 'center', lineHeight: 1.6, marginBottom: '20px' }}>
              I know all about JSP's Operating System — our jobs, principles, tools, and methodology. Ask me anything.
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SUGGESTED.map(q => (
                <button key={q} onClick={() => { setInput(q); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E4E2D6', background: '#F2F1E9', color: '#6A453A', fontSize: '11px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Verdana,sans-serif', lineHeight: 1.4, transition: 'all .14s' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: msg.role === 'user' ? '#FABE3D' : '#90226C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {msg.role === 'user' ? <User size={13} color="#7A5500" /> : <Bot size={13} color="#fff" />}
                </div>
                <div style={{
                  maxWidth: '78%', padding: '10px 13px', borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                  background: msg.role === 'user' ? '#FEF3CC' : '#F2F1E9',
                  color: '#1F1D1C', fontSize: '12px', lineHeight: 1.65,
                  border: `1px solid ${msg.role === 'user' ? '#FABE3D30' : '#E4E2D6'}`,
                }}>
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: '#90226C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={13} color="#fff" />
                </div>
                <div style={{ padding: '10px 13px', borderRadius: '4px 12px 12px 12px', background: '#F2F1E9', border: '1px solid #E4E2D6' }}>
                  <Loader size={14} color="#9C8878" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #E4E2D6', background: '#FAFAF7' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask about JSP's mission, tools, or processes..."
            style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #E4E2D6', fontSize: '12px', fontFamily: 'Verdana,sans-serif', outline: 'none', background: '#fff' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{ padding: '9px 13px', borderRadius: '8px', border: 'none', background: loading || !input.trim() ? '#E4E2D6' : '#90226C', color: loading || !input.trim() ? '#9C8878' : '#fff', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Send size={14} />
          </button>
        </div>
        <div style={{ fontSize: '9px', color: '#9C8878', marginTop: '6px', textAlign: 'center' }}>
          AI responses are generated and may not always be accurate. Verify important information.
        </div>
      </div>
    </div>
  );
}
