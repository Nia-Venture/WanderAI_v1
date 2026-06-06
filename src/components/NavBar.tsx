import Logo from './Logo';
import UserMenu from './UserMenu';
import { useAuth } from '../lib/auth';
import { navigate } from '../lib/router';

interface NavBarProps {
  transparent?: boolean;
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
            onClick={() => navigate('/flights')}
            className={`font-sans text-sm font-medium transition-colors px-3 py-2 hidden sm:block ${
              transparent
                ? 'text-white/70 hover:text-white'
                : 'text-muted hover:text-primary'
            }`}
          >
            Flights & Hotels
          </button>
          {!authLoading && user && profile ? (
            <UserMenu profile={profile} inverted={transparent} />
          ) : !authLoading ? (
            <>
              <button
                onClick={() => navigate('/become-a-local')}
                className={`font-sans text-sm font-medium transition-colors px-3 py-2 ${
                  transparent
                    ? 'text-white/70 hover:text-white'
                    : 'text-muted hover:text-primary'
                }`}
              >
                For Locals
              </button>
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className={`font-sans text-sm font-medium transition-colors px-3 py-2 ${
                  transparent
                    ? 'text-white/70 hover:text-white'
                    : 'text-muted hover:text-primary'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => navigate('/auth')}
                className={`font-sans text-sm font-semibold transition-all px-4 py-2 rounded-lg border ${
                  transparent
                    ? 'border-white/30 text-white hover:bg-white hover:text-primary'
                    : 'border-primary/30 text-primary hover:border-primary hover:bg-primary hover:text-surface'
                }`}
              >
                Sign In
              </button>
            </>
          ) : (
            // Loading placeholder to prevent layout shift
            <div className="w-24 h-8 rounded-lg shimmer-bg" />
          )}
        </div>
      </div>
    </nav>
  );
}
