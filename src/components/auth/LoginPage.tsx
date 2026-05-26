import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          showToast('Please check your email and click the confirmation link first.', 'error');
        } else if (error.message.toLowerCase().includes('invalid login')) {
          showToast('Incorrect email or password.', 'error');
        } else {
          showToast(error.message, 'error');
        }
      }
    } else {
      const { error, needsConfirmation } = await signUp(email, password, displayName);
      if (error) {
        showToast(error.message, 'error');
      } else if (needsConfirmation) {
        setAwaitingConfirmation(true);
      } else {
        showToast('Account created! Welcome to JSP OS.');
      }
    }
    setLoading(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#1F1D1C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <svg width="52" height="62" viewBox="0 0 60 74" fill="none" style={{ margin: '0 auto 12px' }}>
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8427A" />
                <stop offset="100%" stopColor="#F3755E" />
              </linearGradient>
            </defs>
            <circle cx="44" cy="15" r="12" stroke="url(#lg)" strokeWidth="7" fill="none" />
            <circle cx="44" cy="15" r="4" fill="url(#lg)" />
            <path d="M44 27 Q44 54 12 56" stroke="url(#lg)" strokeWidth="8.5" strokeLinecap="round" fill="none" />
            <rect x="8" y="60" width="40" height="9" rx="2.5" fill="url(#lg)" />
          </svg>
          <div style={{ fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', fontSize: '11px', fontWeight: 700, color: '#FABE3D', letterSpacing: '.1em', textTransform: 'uppercase' }}>Justice System Partners</div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', color: '#fff', marginTop: '12px', marginBottom: '4px' }}>
            JSP Operating System
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.45)' }}>
            {mode === 'login' ? 'Sign in to your account to continue' : 'Create your account to get started'}
          </div>
        </div>

        {awaitingConfirmation && (
          <div style={{ background: 'rgba(250,190,61,.1)', border: '1px solid rgba(250,190,61,.3)', borderRadius: '10px', padding: '16px 18px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#FABE3D', marginBottom: '4px' }}>Check your email</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>
              A confirmation link has been sent to <strong style={{ color: 'rgba(255,255,255,.85)' }}>{email}</strong>. Click it to activate your account, then sign in.
            </div>
            <button type="button" onClick={() => { setAwaitingConfirmation(false); setMode('login'); }} style={{ marginTop: '10px', fontSize: '11px', color: '#FABE3D', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Back to sign in
            </button>
          </div>
        )}

        {!awaitingConfirmation && (
        <div style={{ background: 'rgba(250,190,61,.07)', border: '1px solid rgba(250,190,61,.18)', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(250,190,61,.7)', marginBottom: '4px' }}>Initial Admin Account</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.5)', lineHeight: 1.7 }}>
            Email: <span style={{ color: 'rgba(255,255,255,.8)' }}>admin@jsp.org</span><br />
            Password: <span style={{ color: 'rgba(255,255,255,.8)' }}>JSPAdmin2024!</span>
          </div>
        </div>
        )}

        {!awaitingConfirmation && <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,.05)', borderRadius: '14px', padding: '28px', border: '1px solid rgba(255,255,255,.1)' }}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.5)', marginBottom: '6px' }}>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required={mode === 'signup'}
                placeholder="Your full name"
                style={{ width: '100%', padding: '10px 13px', borderRadius: '8px', border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.08)', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.5)', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@justicepartners.org"
              style={{ width: '100%', padding: '10px 13px', borderRadius: '8px', border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.08)', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.5)', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 13px', borderRadius: '8px', border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.08)', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#FABE3D', color: '#1F1D1C', fontSize: '13px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: '"Century Gothic","Trebuchet MS",sans-serif', letterSpacing: '.04em' }}
          >
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.45)', fontSize: '11px', cursor: 'pointer', fontFamily: 'Verdana,sans-serif' }}
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>}


        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', color: 'rgba(255,255,255,.2)', fontStyle: 'italic' }}>
          Better systems. Brighter futures.
        </div>
      </div>
    </div>
  );
}
