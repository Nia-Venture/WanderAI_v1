import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import NavBar from '../components/NavBar';
import { navigate } from '../lib/router';
import { Save, Lock, LogOut, CheckCircle2 } from 'lucide-react';

function FieldInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-bg border rounded-xl px-4 py-3 font-sans text-sm text-text-main placeholder-muted outline-none transition-colors ${
          error ? 'border-red-400' : 'border-border focus:border-accent'
        }`}
      />
      {error && <p className="font-sans text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function Settings() {
  const { profile, user, signOut, authLoading } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.name ?? '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');

  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) { setNameError('Name cannot be empty.'); return; }
    setNameSaving(true);
    setNameError('');
    const { error } = await supabase
      .from('profiles')
      .update({ name: displayName.trim() })
      .eq('id', user!.id);
    setNameSaving(false);
    if (error) { setNameError(error.message); return; }
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 3000);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return; }
    setPwSaving(true);
    setPwError('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) { setPwError(error.message); return; }
    setPwSaved(true);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPwSaved(false), 3000);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-1">Account</p>
            <h1 className="font-display font-bold text-2xl text-primary">Settings</h1>
            <p className="font-sans text-sm text-muted">Manage your profile and security settings.</p>
          </div>

          {/* Display Name */}
          <section className="bg-surface border border-border rounded-2xl p-6 mb-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Save size={16} className="text-primary" />
              </div>
              <h2 className="font-display font-semibold text-primary text-lg">Profile</h2>
            </div>
            <form onSubmit={handleSaveName} className="space-y-4">
              <FieldInput label="Display Name" value={displayName} onChange={setDisplayName} placeholder="Your name" error={nameError} />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={nameSaving}
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-sans font-semibold text-sm py-2.5 px-5 rounded-xl transition-all"
                >
                  {nameSaving ? (
                    <span className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</span>
                  ) : (
                    <><Save size={14} /> Save Name</>
                  )}
                </button>
                {nameSaved && (
                  <span className="flex items-center gap-1.5 font-sans text-sm text-success">
                    <CheckCircle2 size={15} /> Saved!
                  </span>
                )}
              </div>
            </form>
          </section>

          {/* Change Password */}
          <section className="bg-surface border border-border rounded-2xl p-6 mb-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <Lock size={16} className="text-accent" />
              </div>
              <h2 className="font-display font-semibold text-primary text-lg">Change Password</h2>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <FieldInput label="New Password" value={newPassword} onChange={setNewPassword} type="password" placeholder="At least 8 characters" />
              <FieldInput label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="Repeat new password" error={pwError} />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-sans font-semibold text-sm py-2.5 px-5 rounded-xl transition-all"
                >
                  {pwSaving ? (
                    <span className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</span>
                  ) : (
                    <><Lock size={14} /> Update Password</>
                  )}
                </button>
                {pwSaved && (
                  <span className="flex items-center gap-1.5 font-sans text-sm text-success">
                    <CheckCircle2 size={15} /> Password updated!
                  </span>
                )}
              </div>
            </form>
          </section>

          {/* Danger Zone */}
          <section className="bg-surface border border-red-200 rounded-2xl p-6">
            <h2 className="font-display font-semibold text-red-600 text-lg mb-4">Danger Zone</h2>
            <p className="font-sans text-sm text-muted mb-4">Sign out of your current session.</p>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 font-sans font-semibold text-sm py-2.5 px-5 rounded-xl transition-all"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
