import { useState, useRef, useEffect } from 'react';
import Logo from './Logo';
import UserMenu from './UserMenu';
import { useAuth } from '../lib/auth';
import { navigate } from '../lib/router';
import { ChevronDown, UserPlus, MapPin } from 'lucide-react';

interface NavBarProps {
  transparent?: boolean;
}

function AuthDropdown({ transparent }: { transparent: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const buttonCls = transparent
    ? 'border-white/30 text-white hover:bg-white/10'
    : 'border-primary/30 text-primary hover:border-primary hover:bg-primary/5';

  const options = [
    {
      icon: <UserPlus size={15} />,
      label: 'Join as Traveller',
      sub: 'Create your free account',
      action: () => { navigate('/auth?mode=signup'); setOpen(false); },
    },
    {
      icon: <MapPin size={15} />,
      label: 'Become a Local',
      sub: 'Share your city knowledge',
      action: () => { navigate('/become-a-local'); setOpen(false); },
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 font-sans text-sm font-semibold transition-all px-4 py-2 rounded-lg border ${buttonCls}`}
      >
        Join
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-chat overflow-hidden z-50 animate-fade-in">
          {options.map((opt, i) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-bg transition-colors ${i > 0 ? 'border-t border-border' : ''}`}
            >
              <span className="mt-0.5 text-accent shrink-0">{opt.icon}</span>
              <div>
                <p className="font-sans text-sm font-semibold text-primary">{opt.label}</p>
                <p className="font-sans text-xs text-muted">{opt.sub}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NavBar({ transparent = false }: NavBarProps) {
  const { user, profile, authLoading } = useAuth();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        transparent
          ? 'bg-transparent'
          : 'bg-bg/90 backdrop-blur-sm border-b border-border'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="group">
          <Logo size="sm" inverted={transparent} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/hotels')}
            className={`font-sans text-sm font-medium transition-colors px-3 py-2 hidden sm:block ${
              transparent
                ? 'text-white/70 hover:text-white'
                : 'text-muted hover:text-primary'
            }`}
          >
            Hotels
          </button>

          {!authLoading && user && profile ? (
            <UserMenu profile={profile} inverted={transparent} />
          ) : !authLoading ? (
            <AuthDropdown transparent={transparent} />
          ) : (
            <div className="w-32 h-9 rounded-lg shimmer-bg" />
          )}
        </div>
      </div>
    </nav>
  );
}
