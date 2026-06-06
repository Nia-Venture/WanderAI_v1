import { useState, useEffect, useRef } from 'react';
import { useAuth, type LocalSignUpData } from '../lib/auth';
import { LogoMark } from '../components/Logo';
import { navigate } from '../lib/router';
import { Eye, EyeOff, ArrowRight, CheckCircle2, Globe, Clock, Star } from 'lucide-react';
import { SUPPORTED_CITIES } from '../data/seededLocals';
import { sendPin } from '../api/sendPin';
import { verifyPin } from '../api/verifyPin';

type Mode = 'signin' | 'traveller' | 'local' | 'forgot';

const HERO_IMAGE =
  'https://images.pexels.com/photos/11811982/pexels-photo-11811982.jpeg?auto=compress&cs=tinysrgb&w=1200';

const LEFT_BENEFITS = [
  { icon: <Globe size={16} />, text: 'AI briefings for 38+ cities, updated in real time' },
  { icon: <CheckCircle2 size={16} />, text: 'Chat with verified locals before you land' },
  { icon: <Clock size={16} />, text: 'Go from clueless to confident in under 60 seconds' },
  { icon: <Star size={16} />, text: 'Earn from your local knowledge as a guide' },
];


function PasswordInput({
  value,
  onChange,
  placeholder = 'Password',
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div
        className={`flex items-center bg-bg border rounded-xl transition-colors ${
          error ? 'border-red-400' : 'border-border focus-within:border-accent'
        }`}
      >
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 bg-transparent font-sans text-sm text-text-main placeholder-muted outline-none"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="px-3 text-muted hover:text-primary transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="font-sans text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function FieldInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder: string;
  type?: string;
  error?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full bg-bg border rounded-xl px-4 py-3 font-sans text-sm text-text-main placeholder-muted outline-none transition-colors ${
          error ? 'border-red-400' : 'border-border focus:border-accent'
        } ${readOnly ? 'opacity-60 cursor-default' : ''}`}
      />
      {error && <p className="font-sans text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Sign In Form ──────────────────────────────────────────────────────────
function SignInForm({ onSwitch }: { onSwitch: (m: Mode) => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed.';
      setError(msg.includes('Invalid') ? 'Incorrect email or password.' : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldInput value={email} onChange={setEmail} placeholder="Email address" type="email" />
        <PasswordInput value={password} onChange={setPassword} />

        {error && (
          <p className="font-sans text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-sans font-semibold text-sm py-3.5 rounded-xl transition-all active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </span>
          ) : (
            <><ArrowRight size={16} /> Sign In with Email</>
          )}
        </button>

        <div className="flex items-center justify-between">
          <p className="font-sans text-sm text-muted">
            New to WanderAI?{' '}
            <button type="button" onClick={() => onSwitch('traveller')} className="text-accent hover:underline font-medium">
              Create a free account
            </button>
          </p>
          <button type="button" onClick={() => onSwitch('forgot')} className="font-sans text-sm text-muted hover:text-accent transition-colors">
            Forgot password?
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Forgot Password Form (PIN-based) ─────────────────────────────────────
function ForgotPasswordForm({ onSwitch }: { onSwitch: (m: Mode) => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const pinString = pin.join('');

  async function handleSendPin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setLoading(true);
    setError('');
    try {
      await sendPin(email.trim());
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send PIN.');
    } finally {
      setLoading(false);
    }
  }

  function handlePinChange(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...pin];
    next[i] = digit;
    setPin(next);
    if (digit && i < 5) pinRefs.current[i + 1]?.focus();
  }

  function handlePinKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !pin[i] && i > 0) {
      pinRefs.current[i - 1]?.focus();
    }
  }

  function handlePinPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...pin];
    for (let i = 0; i < 6; i++) next[i] = digits[i] ?? '';
    setPin(next);
    const lastIdx = Math.min(digits.length, 5);
    pinRefs.current[lastIdx]?.focus();
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (pinString.length !== 6) { setError('Please enter the 6-digit PIN.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await verifyPin(email.trim(), pinString, newPassword);
      setSuccessMsg('Password reset! Please sign in with your new password.');
      onSwitch('signin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  if (!sent) {
    return (
      <form onSubmit={handleSendPin} className="space-y-4">
        <FieldInput value={email} onChange={setEmail} placeholder="Email address" type="email" />
        {error && <p className="font-sans text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-sans font-semibold text-sm py-3.5 rounded-xl transition-all active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</span>
          ) : (
            <><ArrowRight size={16} /> Send PIN</>
          )}
        </button>
        <p className="font-sans text-sm text-center text-muted">
          <button type="button" onClick={() => onSwitch('signin')} className="text-accent hover:underline font-medium">← Back to sign in</button>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <p className="font-sans text-sm text-green-700">PIN sent! Check your inbox for a 6-digit code.</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="font-sans text-sm text-green-700">{successMsg}</p>
        </div>
      )}

      {/* 6-box PIN input */}
      <div>
        <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Enter your PIN</p>
        <div className="flex gap-2">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={el => { pinRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={e => handlePinChange(i, e.target.value)}
              onKeyDown={e => handlePinKeyDown(i, e)}
              onPaste={i === 0 ? handlePinPaste : undefined}
              className="w-11 h-11 text-center font-mono text-lg border border-border rounded-xl bg-bg text-text-main outline-none focus:border-accent transition-colors"
            />
          ))}
        </div>
      </div>

      <PasswordInput value={newPassword} onChange={setNewPassword} placeholder="New password" />
      <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" />

      {error && <p className="font-sans text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-sans font-semibold text-sm py-3.5 rounded-xl transition-all active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</span>
        ) : (
          <><CheckCircle2 size={16} /> Reset Password</>
        )}
      </button>

      <p className="font-sans text-xs text-center text-muted">
        Didn't get a PIN?{' '}
        <button type="button" onClick={() => setSent(false)} className="text-accent hover:underline">Resend PIN</button>
      </p>
    </form>
  );
}

// ─── Traveller Sign Up Form ────────────────────────────────────────────────
function TravellerForm({ onSwitch }: { onSwitch: (m: Mode) => void }) {
  const { signUpTraveller } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Required';
    if (!email.trim()) e.email = 'Required';
    if (password.length < 6) e.password = 'At least 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setGlobalError('');
    try {
      await signUpTraveller(name.trim(), email.trim(), password);
      navigate('/welcome?name=' + encodeURIComponent(name.trim().split(' ')[0]));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setGlobalError(msg.includes('already') ? 'Email already registered. Try signing in.' : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <FieldInput value={name} onChange={v => { setName(v); setErrors(p => ({ ...p, name: '' })); }} placeholder="Full name" error={errors.name} />
        <FieldInput value={email} onChange={v => { setEmail(v); setErrors(p => ({ ...p, email: '' })); }} placeholder="Email address" type="email" error={errors.email} />
        <PasswordInput value={password} onChange={v => { setPassword(v); setErrors(p => ({ ...p, password: '' })); }} error={errors.password} />
        <PasswordInput value={confirm} onChange={v => { setConfirm(v); setErrors(p => ({ ...p, confirm: '' })); }} placeholder="Confirm password" error={errors.confirm} />

        {globalError && (
          <p className="font-sans text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{globalError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-sans font-semibold text-sm py-3.5 rounded-xl transition-all active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>
          ) : (
            <><CheckCircle2 size={16} /> Create My Account</>
          )}
        </button>

        <p className="font-sans text-xs text-muted text-center">By joining, you agree to our terms of use.</p>
        <p className="font-sans text-sm text-center text-muted">
          Already have an account?{' '}
          <button type="button" onClick={() => onSwitch('signin')} className="text-accent hover:underline font-medium">Sign in</button>
        </p>
      </form>
    </div>
  );
}

// ─── Local Guide Sign Up Form ──────────────────────────────────────────────
function LocalForm({ onSwitch }: { onSwitch: (m: Mode) => void }) {
  const { signUpLocal } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', city: '', years: '', languages: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!form.city.trim()) e.city = 'Required';
    else if (!SUPPORTED_CITIES.some(c => c.toLowerCase() === form.city.trim().toLowerCase())) {
      e.city = 'Please choose a city from the supported list.';
    }
    if (!form.years.trim() || isNaN(Number(form.years))) e.years = 'Enter a number';
    if (!form.languages.trim()) e.languages = 'Required';
    if (!form.bio.trim()) e.bio = 'Required';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setGlobalError('');
    const data: LocalSignUpData = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      city: form.city.trim(),
      years_local: parseInt(form.years, 10),
      languages: form.languages.trim(),
      bio: form.bio.trim(),
    };
    try {
      await signUpLocal(data);
      navigate('/local-pending');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setGlobalError(msg.includes('already') ? 'Email already registered. Try signing in.' : msg);
    } finally {
      setLoading(false);
    }
  }

  const lc = 'font-mono text-xs text-muted uppercase tracking-wide block mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lc}>Full name</label>
          <FieldInput value={form.name} onChange={v => set('name', v)} placeholder="Your name" error={errors.name} />
        </div>
        <div>
          <label className={lc}>City you live in</label>
          <>
            <datalist id="city-list">
              {SUPPORTED_CITIES.map(c => <option key={c} value={c} />)}
            </datalist>
            <input
              list="city-list"
              value={form.city}
              onChange={e => set('city', e.target.value)}
              placeholder="e.g. Dubai"
              className={`w-full bg-bg border rounded-xl px-4 py-3 font-sans text-sm text-text-main placeholder-muted outline-none transition-colors ${errors.city ? 'border-red-400' : 'border-border focus:border-accent'}`}
            />
            {errors.city && <p className="font-sans text-xs text-red-500 mt-1">{errors.city}</p>}
          </>
        </div>
      </div>

      <div>
        <label className={lc}>Email</label>
        <FieldInput value={form.email} onChange={v => set('email', v)} placeholder="Your email" type="email" error={errors.email} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lc}>Password</label>
          <PasswordInput value={form.password} onChange={v => set('password', v)} error={errors.password} />
        </div>
        <div>
          <label className={lc}>Confirm password</label>
          <PasswordInput value={form.confirm} onChange={v => set('confirm', v)} placeholder="Confirm password" error={errors.confirm} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lc}>Years lived there</label>
          <FieldInput value={form.years} onChange={v => set('years', v)} placeholder="e.g. 8" type="number" error={errors.years} />
        </div>
        <div>
          <label className={lc}>Languages spoken</label>
          <FieldInput value={form.languages} onChange={v => set('languages', v)} placeholder="English, Arabic..." error={errors.languages} />
        </div>
      </div>

      <div>
        <label className={lc}>Why should travellers trust your advice?</label>
        <textarea
          value={form.bio}
          onChange={e => set('bio', e.target.value)}
          placeholder="Share what makes your local knowledge special..."
          rows={3}
          className={`w-full bg-bg border rounded-xl px-4 py-3 font-sans text-sm text-text-main placeholder-muted outline-none resize-none transition-colors ${errors.bio ? 'border-red-400' : 'border-border focus:border-accent'}`}
        />
        {errors.bio && <p className="font-sans text-xs text-red-500 mt-1">{errors.bio}</p>}
      </div>

      {globalError && (
        <p className="font-sans text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{globalError}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-sans font-semibold text-sm py-3.5 rounded-xl transition-all active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>
        ) : (
          <><ArrowRight size={16} /> Apply as Local Guide</>
        )}
      </button>

      <p className="font-sans text-sm text-center text-muted">
        Already have an account?{' '}
        <button type="button" onClick={() => onSwitch('signin')} className="text-accent hover:underline font-medium">Sign in</button>
      </p>
    </form>
  );
}

// ─── Main Auth Page ────────────────────────────────────────────────────────
export default function Auth() {
  const { user } = useAuth();
  const initialMode: Mode = (() => {
    const p = new URLSearchParams(window.location.search).get('mode');
    if (p === 'local') return 'local';
    if (p === 'signup') return 'traveller';
    if (p === 'forgot') return 'forgot';
    return 'signin';
  })();
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    if (user) navigate('/');
  }, [user]);

  const TABS: { key: Mode; label: string }[] = [
    { key: 'signin', label: 'Sign In' },
    { key: 'traveller', label: 'Join as Traveller' },
    { key: 'local', label: 'Join as Local' },
  ];

  const formTitle: Record<Mode, string> = {
    signin: 'Welcome back',
    traveller: 'Start exploring like a local',
    local: 'Share your city with the world',
    forgot: 'Reset your password',
  };

  const formSub: Record<Mode, string> = {
    signin: 'Sign in to your WanderAI account.',
    traveller: 'Create your free traveller account.',
    local: 'Apply to become a verified WanderAI local guide.',
    forgot: "Enter your email and we'll send a 6-digit PIN.",
  };

  return (
    <div className="min-h-screen flex">
      {/* ─── Left brand panel (desktop only) ─── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 relative flex-col justify-between p-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/95" />

        <div className="relative">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <LogoMark size={36} />
            <div className="flex items-baseline">
              <span className="font-display font-bold text-xl text-white">Wander</span>
              <span className="font-display font-bold text-xl text-accent">AI</span>
            </div>
          </button>
        </div>

        <div className="relative space-y-6">
          <div>
            <h2 className="font-display font-bold text-white text-4xl leading-tight mb-3">
              Travel Like a{' '}
              <span className="italic text-accent">Native.</span>
            </h2>
            <p className="font-sans text-white/70 leading-relaxed">
              The knowledge every local carries — now accessible to you, before you even land.
            </p>
          </div>

          <div className="space-y-3">
            {LEFT_BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-accent">
                  {b.icon}
                </div>
                <span className="font-sans text-sm text-white/80">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="border-t border-white/15 pt-6">
            <p className="font-sans text-xs text-white/40">© 2026 WanderAI · MVP v0.1</p>
          </div>
        </div>
      </div>

      {/* ─── Right form panel ─── */}
      <div className="flex-1 flex flex-col bg-bg overflow-y-auto">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-surface border-b border-border">
          <button onClick={() => navigate('/')}>
            <div className="flex items-center gap-2">
              <LogoMark size={28} />
              <div className="flex items-baseline">
                <span className="font-display font-bold text-base text-primary">Wander</span>
                <span className="font-display font-bold text-base text-accent">AI</span>
              </div>
            </div>
          </button>
          <button onClick={() => navigate('/')} className="font-sans text-sm text-muted hover:text-primary">
            ← Back
          </button>
        </div>

        <div className="flex-1 flex items-start lg:items-center justify-center px-6 py-10">
          <div className="w-full max-w-lg">
            {/* Tabs — hidden for forgot */}
            {mode !== 'forgot' && (
              <div className="flex bg-surface border border-border rounded-2xl p-1 mb-8 gap-1">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setMode(t.key)}
                    className={`flex-1 font-sans text-xs font-semibold py-2.5 rounded-xl transition-all ${
                      mode === t.key
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted hover:text-primary'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* Heading */}
            <div className="mb-6">
              <h1 className="font-display font-bold text-primary text-2xl mb-1">{formTitle[mode]}</h1>
              <p className="font-sans text-sm text-muted">{formSub[mode]}</p>
            </div>

            {/* Form */}
            <div className="animate-fade-in">
              {mode === 'signin' && <SignInForm onSwitch={setMode} />}
              {mode === 'traveller' && <TravellerForm onSwitch={setMode} />}
              {mode === 'local' && <LocalForm onSwitch={setMode} />}
              {mode === 'forgot' && <ForgotPasswordForm onSwitch={setMode} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
