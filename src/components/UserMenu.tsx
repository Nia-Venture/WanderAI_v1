import { useState, useRef, useEffect } from 'react';
import { useAuth, type Profile } from '../lib/auth';
import { navigate } from '../lib/router';
import { ChevronDown, LogOut, MapPin, User } from 'lucide-react';

const AVATAR_PALETTE = ['#2AB8A8', '#1A3A4A', '#E8622A', '#C44E1E', '#178A7E', '#2A5A74'];

function avatarColor(name: string): string {
  const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface UserMenuProps {
  profile: Profile;
  inverted?: boolean;
}

export default function UserMenu({ profile, inverted = false }: UserMenuProps) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const color = avatarColor(profile.name);
  const ini = initials(profile.name);
  const firstName = profile.name.split(' ')[0];
  const isLocal = profile.account_type === 'local';

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    navigate('/');
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-sans font-semibold text-xs shrink-0 ring-2 ring-white/20"
          style={{ backgroundColor: color }}
        >
          {ini}
        </div>

        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className={`font-sans text-sm font-semibold leading-none ${inverted ? 'text-white' : 'text-primary'}`}>
            {firstName}
          </span>
          <span className={`font-mono text-xs capitalize leading-none mt-0.5 ${inverted ? 'text-white/60' : 'text-muted'}`}>
            {isLocal ? 'Local Guide' : 'Traveller'}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${inverted ? 'text-white/60' : 'text-muted'}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-2xl shadow-chat py-1.5 z-50 animate-fade-in">
          {/* Profile header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-sans font-semibold text-sm shrink-0"
                style={{ backgroundColor: color }}
              >
                {ini}
              </div>
              <div className="min-w-0">
                <p className="font-sans font-semibold text-primary text-sm truncate">{profile.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isLocal ? (
                    <>
                      <MapPin size={10} className="text-accent shrink-0" />
                      <span className="font-mono text-xs text-accent">Local Guide</span>
                    </>
                  ) : (
                    <>
                      <User size={10} className="text-accent-2 shrink-0" />
                      <span className="font-mono text-xs text-accent-2">Traveller</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isLocal && (
            <div className="px-4 py-2 border-b border-border">
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span className="font-sans text-xs text-yellow-700">Verification pending</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 font-sans text-sm text-text-main hover:bg-bg transition-colors rounded-b-2xl"
          >
            <LogOut size={15} className="text-muted" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
