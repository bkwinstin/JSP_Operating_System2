import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0 4px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,.1)' }} />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.3)', whiteSpace: 'nowrap' }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,.1)' }} />
          </div>

          <button
            type="button"
   onClick={() => {
  window.location.href = 'https://supabase.co';
}}

            style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.07)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            Sign in with Google
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
