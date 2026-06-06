import { useState, useEffect, useRef } from 'react';
import { navigate } from '../lib/router';
import NavBar from '../components/NavBar';
import BriefingPanel from '../components/BriefingPanel';
import LoadingSkeleton from '../components/LoadingSkeleton';
import LocalsPanel from '../components/LocalsPanel';
import ChatPanel from '../components/ChatPanel';
import TravelSearch from '../components/TravelSearch';
import ErrorBoundary from '../components/ErrorBoundary';
import { getCityLocals } from '../data/seededLocals';
import { generateBriefing } from '../api/generateBriefing';
import { trackCityVisit, useAuth } from '../lib/auth';
import type { CityBriefing } from '../types/briefing';
import type { LocalProfile } from '../data/seededLocals';
import { ArrowLeft, ArrowUp } from 'lucide-react';

const CITY_PHOTO_IDS: Record<string, string> = {
  dubai:           '1534560/pexels-photo-1534560',
  tokyo:           '2506923/pexels-photo-2506923',
  london:          '460672/pexels-photo-460672',
  bangkok:         '1031659/pexels-photo-1031659',
  paris:           '739407/pexels-photo-739407',
  nairobi:         '3992953/pexels-photo-3992953',
  'new york':      '2224935/pexels-photo-2224935',
  singapore:       '2265876/pexels-photo-2265876',
  amsterdam:       '1414467/pexels-photo-1414467',
  istanbul:        '2044434/pexels-photo-2044434',
  'mexico city':   '2168974/pexels-photo-2168974',
  mumbai:          '2846217/pexels-photo-2846217',
  sydney:          '1878293/pexels-photo-1878293',
  'cape town':     '2473183/pexels-photo-2473183',
  barcelona:       '1388030/pexels-photo-1388030',
  lisbon:          '2246476/pexels-photo-2246476',
  seoul:           '2149468/pexels-photo-2149468',
  berlin:          '109629/pexels-photo-109629',
  rome:            '1797161/pexels-photo-1797161',
  cairo:           '3689885/pexels-photo-3689885',
  'buenos aires':  '2993370/pexels-photo-2993370',
  toronto:         '1486222/pexels-photo-1486222',
  marrakech:       '2611249/pexels-photo-2611249',
  bali:            '1802183/pexels-photo-1802183',
  colombo:         '3997385/pexels-photo-3997385',
};

function getCityHero(city: string): string {
  const key = city.toLowerCase().trim();
  const path = CITY_PHOTO_IDS[key];
  if (path) return `https://images.pexels.com/photos/${path}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
  const query = encodeURIComponent(city + ' city skyline');
  return `https://source.unsplash.com/1200x600/?${query}`;
}

interface CityProps {
  cityName: string;
}

export default function City({ cityName }: CityProps) {
  const { user } = useAuth();
  const [briefing, setBriefing] = useState<CityBriefing | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLocal, setActiveLocal] = useState<LocalProfile | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const briefingRef = useRef<AbortController | null>(null);

  const locals = getCityLocals(cityName);
  const cityDisplay = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  useEffect(() => {
    briefingRef.current?.abort();
    const ctrl = new AbortController();
    briefingRef.current = ctrl;

    setLoading(true);
    setError(null);
    setBriefing(null);
    setGeneratedAt(null);

    generateBriefing(cityName)
      .then((data) => {
        if (!ctrl.signal.aborted) {
          setBriefing(data);
          setGeneratedAt(new Date());
          setLoading(false);
          if (user?.id) trackCityVisit(user.id, cityName);
        }
      })
      .catch((err) => {
        if (!ctrl.signal.aborted) {
          setError(err.message ?? 'Failed to load briefing.');
          setLoading(false);
        }
      });

    return () => ctrl.abort();
  }, [cityName]);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function openChat(local: LocalProfile) {
    setActiveLocal(local);
    setChatOpen(true);
  }

  function closeChat() {
    setChatOpen(false);
    setTimeout(() => setActiveLocal(null), 300);
  }

  const heroImage = getCityHero(cityName);

  return (
    <div className="min-h-screen bg-bg">
      <NavBar />

      {/* City hero header */}
      <div className="pt-16 relative overflow-hidden" style={{ minHeight: '220px' }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative max-w-7xl mx-auto px-6 py-10 flex flex-col gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-sans text-sm text-white/70 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft size={15} />
            Back to search
          </button>
          <h1 className="font-display font-semibold text-3xl md:text-4xl text-white">
            {cityDisplay}
          </h1>
          <p className="font-sans text-sm text-white/70">
            Your local insider briefing — AI-powered, human-verified
          </p>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Briefing */}
          <div className="flex-1 min-w-0">
            <ErrorBoundary>
              {loading && <LoadingSkeleton />}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-card p-6 text-center">
                  <p className="font-sans text-sm text-red-600 mb-3">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="font-sans text-sm text-accent hover:underline"
                  >
                    Try again
                  </button>
                </div>
              )}
              {briefing && <BriefingPanel briefing={briefing} cityName={cityName} generatedAt={generatedAt ?? undefined} />}
            </ErrorBoundary>
          </div>

          {/* Right: Locals sidebar — desktop only */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24">
              <LocalsPanel cityName={cityName} locals={locals} onChat={openChat} />
            </div>
          </div>
        </div>

        {/* Mobile: Locals horizontal scroll */}
        <div className="lg:hidden mt-10">
          <div className="mb-4">
            <h2 className="font-display font-semibold text-primary text-xl">Chat with a Local</h2>
            <p className="font-sans text-sm text-muted">Real people in {cityDisplay}, ready to help.</p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory">
            {locals.map((local) => (
              <div key={local.id} className="snap-start shrink-0 w-72">
                <div className="bg-surface rounded-card border border-border shadow-card p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-sans font-semibold text-sm shrink-0"
                      style={{ backgroundColor: local.avatar_color }}
                    >
                      {local.initials}
                    </div>
                    <div>
                      <p className="font-sans font-semibold text-primary text-sm">{local.name}</p>
                      <p className="font-sans text-xs text-muted leading-relaxed">{local.tagline}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {local.topics.map((t) => (
                      <span key={t} className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => openChat(local)}
                    className="w-full bg-primary text-surface font-sans font-semibold text-sm py-2.5 rounded-xl hover:bg-primary-light transition-colors"
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Travel Search — full width below briefing */}
        <div className="mt-10">
          <TravelSearch cityName={cityName} />
        </div>
      </div>

      {/* Chat overlay */}
      {chatOpen && activeLocal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={closeChat}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col shadow-chat animate-slide-up lg:animate-none">
            <ChatPanel city={cityName} local={activeLocal} onClose={closeChat} />
          </div>
        </>
      )}

      {/* Scroll-to-top FAB */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-30 bg-primary text-white rounded-full p-3 shadow-card-hover hover:bg-primary-light transition-all active:scale-90"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
