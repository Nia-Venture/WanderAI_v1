import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { LogoMark } from '../components/Logo';
import { navigate } from '../lib/router';
import { LogOut, User, MapPin, Calendar, Bell } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, signOut, authLoading } = useAuth();
  const [tripsPlanned, setTripsPlanned] = useState(0);
  const [citiesExplored, setCitiesExplored] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('city_visits')
      .select('city', { count: 'exact' })
      .eq('user_id', user.id)
      .then(({ data, count }) => {
        setTripsPlanned(count ?? 0);
        const distinct = new Set((data ?? []).map((r: { city: string }) => r.city)).size;
        setCitiesExplored(distinct);
      });
  }, [user]);

  // Redirect to login if no auth
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user]);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <LogoMark size={48} className="animate-pulse" />
          <p className="font-sans text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // No auth - don't render anything (will redirect)
  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <LogoMark size={32} />
            <div className="flex items-baseline">
              <span className="font-display font-bold text-lg text-primary">Wander</span>
              <span className="font-display font-bold text-lg text-accent">AI</span>
            </div>
          </button>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted hover:text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={18} className="text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className="font-sans text-sm font-medium text-text-main">
                  {profile?.name || 'User'}
                </p>
                <p className="font-sans text-xs text-muted">
                  {profile?.account_type || 'traveller'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-2 text-muted hover:text-red-500 transition-colors"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-primary mb-1">
            Welcome back, {profile?.name?.split(' ')[0] || 'Traveler'}
          </h1>
          <p className="font-sans text-sm text-muted">
            Here's your travel dashboard overview.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <MapPin size={20} className="text-accent" />
              </div>
              <p className="font-sans text-xs text-muted uppercase tracking-wide">Trips Planned</p>
            </div>
            <p className="font-display font-bold text-3xl text-primary">{tripsPlanned}</p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar size={20} className="text-primary" />
              </div>
              <p className="font-sans text-xs text-muted uppercase tracking-wide">Upcoming</p>
            </div>
            <p className="font-display font-bold text-3xl text-primary">0</p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <MapPin size={20} className="text-success" />
              </div>
              <p className="font-sans text-xs text-muted uppercase tracking-wide">Cities Explored</p>
            </div>
            <p className="font-display font-bold text-3xl text-primary">{citiesExplored}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border rounded-xl p-8 text-center">
          <h2 className="font-display font-bold text-lg text-primary mb-2">
            Ready for your next adventure?
          </h2>
          <p className="font-sans text-sm text-muted mb-4">
            Search for a city to get instant local briefings and insider tips.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-sm py-3 px-6 rounded-xl transition-all"
          >
            Explore Cities
          </button>
        </div>
      </main>
    </div>
  );
}
