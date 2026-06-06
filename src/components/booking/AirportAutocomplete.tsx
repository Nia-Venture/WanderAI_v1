import { useState, useEffect, useRef, useCallback } from 'react';
import { searchAirports, type Airport } from '../../data/airportsAndCities';
import { MapPin } from 'lucide-react';

interface Props {
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  placeholder?: string;
  error?: string;
  id?: string;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="text-accent">{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function AirportAutocomplete({ value, onChange, placeholder = 'City or airport', error, id }: Props) {
  const [inputVal, setInputVal] = useState(value?.label ?? '');
  const [results, setResults] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputVal(value?.label ?? '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const debounceSearch = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setResults(searchAirports(q));
      setOpen(q.length >= 2);
      setActiveIdx(-1);
    }, 150);
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputVal(val);
    setQuery(val);
    if (val !== value?.label) onChange(null);
    debounceSearch(val);
  }

  function handleSelect(airport: Airport) {
    onChange(airport);
    setInputVal(airport.label);
    setOpen(false);
    setActiveIdx(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex items-center bg-bg border rounded-xl transition-colors ${error ? 'border-red-400' : 'border-border focus-within:border-accent'}`}>
        <MapPin size={15} className="ml-3 text-muted shrink-0" />
        <input
          id={id}
          type="text"
          value={inputVal}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 px-3 py-3 bg-transparent font-sans text-sm text-text-main placeholder-muted outline-none"
        />
      </div>
      {error && <p className="font-sans text-xs text-red-500 mt-1">{error}</p>}

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-chat z-50 overflow-hidden animate-fade-in">
          {results.map((airport, i) => (
            <button
              key={airport.iata}
              type="button"
              onMouseDown={() => handleSelect(airport)}
              className={`w-full text-left px-4 py-2.5 font-sans text-sm transition-colors flex items-center gap-2 ${i === activeIdx ? 'bg-accent/10 text-primary' : 'text-text-main hover:bg-bg'}`}
            >
              <span className="font-mono text-xs font-bold text-accent shrink-0 w-8">{airport.iata}</span>
              <span className="flex-1 truncate">
                <Highlight text={`${airport.city}, ${airport.country}`} query={query} />
              </span>
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-chat z-50 px-4 py-3 animate-fade-in">
          <p className="font-sans text-sm text-muted">No airports found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
