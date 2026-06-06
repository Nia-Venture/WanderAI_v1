import { useState, useRef, useEffect } from 'react';
import { SUPPORTED_CITIES } from '../data/seededLocals';
import { navigate } from '../lib/router';
import { Search, ArrowRight, Plane, Building2 } from 'lucide-react';
import FlightSearchForm from './booking/FlightSearchForm';
import HotelSearchForm from './booking/HotelSearchForm';

type Tab = 'city' | 'flights' | 'hotels';

export default function HeroSearch() {
  const [tab, setTab] = useState<Tab>('city');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    setSuggestions(
      SUPPORTED_CITIES.filter((c) => c.toLowerCase().startsWith(q)).slice(0, 6)
    );
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSubmit(city?: string) {
    const destination = city ?? query;
    if (!destination.trim()) return;
    navigate(`/city/${encodeURIComponent(destination.trim().toLowerCase())}`);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }

  const showDropdown = tab === 'city' && focused && suggestions.length > 0;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'city', label: 'City Guide', icon: <Search size={13} /> },
    { id: 'flights', label: 'Flights', icon: <Plane size={13} /> },
    { id: 'hotels', label: 'Hotels', icon: <Building2 size={13} /> },
  ];

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Tab toggle */}
      <div className="flex bg-surface/80 backdrop-blur-sm rounded-2xl border border-border/60 p-1 mb-3 w-fit mx-auto gap-1 shadow-card">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 font-sans text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
              tab === t.id
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted hover:text-primary'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* City search */}
      {tab === 'city' && (
        <div>
          <div
            className={`flex items-center bg-surface rounded-2xl border-2 transition-all duration-200 ${
              focused ? 'border-accent shadow-card-hover' : 'border-border shadow-card'
            }`}
          >
            <Search className="ml-5 shrink-0 text-muted" size={22} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={handleKey}
              placeholder="Where are you going? e.g. Dubai, Tokyo, Nairobi..."
              className="flex-1 px-4 py-4 bg-transparent text-text-main placeholder-muted font-sans text-base outline-none"
            />
            <button
              onClick={() => handleSubmit()}
              className="mr-2 flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-150 active:scale-95 whitespace-nowrap"
            >
              Show Me the City
              <ArrowRight size={16} />
            </button>
          </div>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-chat overflow-hidden z-50 animate-fade-in" style={{ top: 'calc(100% - 4px)' }}>
              {suggestions.map((city) => (
                <button
                  key={city}
                  onMouseDown={() => handleSubmit(city)}
                  className="w-full text-left px-5 py-3 text-text-main hover:bg-bg font-sans text-sm transition-colors flex items-center gap-3"
                >
                  <Search size={14} className="text-muted" />
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flight search */}
      {tab === 'flights' && (
        <div className="bg-surface rounded-2xl border border-border shadow-card p-5">
          <FlightSearchForm />
        </div>
      )}

      {/* Hotel search */}
      {tab === 'hotels' && (
        <div className="bg-surface rounded-2xl border border-border shadow-card p-5">
          <HotelSearchForm />
        </div>
      )}
    </div>
  );
}
