import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { LogoMark } from '../components/Logo';
import { navigate } from '../lib/router';

const WEBHOOK_URL = 'https://honppoa1.app.n8n.cloud/webhook/login';

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || data?.error || 'Login failed. Please try again.');
        return;
      }

      // Success - store token if returned
      if (data?.token) {
        localStorage.setItem('authToken', data.token);
      }

      setSuccess(true);

      // Redirect to dashboard after brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 mb-8 mx-auto"
        >
          <LogoMark size={40} />
          <div className="flex items-baseline">
            <span className="font-display font-bold text-2xl text-primary">Wander</span>
            <span className="font-display font-bold text-2xl text-accent">AI</span>
          </div>
        </button>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-card">
          <h1 className="font-display font-bold text-xl text-primary text-center mb-2">
            Welcome Back
          </h1>
          <p className="font-sans text-sm text-muted text-center mb-6">
            Sign in to your account to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="font-sans text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 font-sans text-sm text-text-main placeholder-muted outline-none focus:border-accent transition-colors disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-sans text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 pr-12 font-sans text-sm text-text-main placeholder-muted outline-none focus:border-accent transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="font-sans text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <p className="font-sans text-sm text-green-600">Login successful! Redirecting...</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-sans font-semibold text-sm py-3.5 rounded-xl transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <ArrowRight size={18} />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="font-sans text-sm text-muted text-center mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="text-accent hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
