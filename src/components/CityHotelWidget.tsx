import { useState } from 'react';
import { navigate } from '../lib/router';
import { Hotel, ArrowRight, Calendar, Users } from 'lucide-react';

interface Props {
  cityName: string;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function daysLater(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function Stepper({
  label, value, min, max, onChange,
}: {
  label: string; value: number; min: number; max: number; onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-sans text-sm text-text-main">{label}</span>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 h-7 rounded-full border border-border flex items-center justify-center font-bold text-base text-primary hover:bg-bg disabled:opacity-30 transition-colors leading-none"
        >
          −
        </button>
        <span className="font-mono text-sm font-semibold w-4 text-center text-primary">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-7 h-7 rounded-full border border-border flex items-center justify-center font-bold text-base text-primary hover:bg-bg disabled:opacity-30 transition-colors leading-none"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function CityHotelWidget({ cityName }: Props) {
  const cityDisplay = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  const [checkIn, setCheckIn] = useState(daysLater(7));
  const [checkOut, setCheckOut] = useState(daysLater(10));
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setError('Please select both check-in and check-out dates.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setError('Check-out must be after check-in.');
      return;
    }
    setError(null);

    // Save in the shape HotelResults.tsx expects
    sessionStorage.setItem(
      'wander_hotel_search',
      JSON.stringify({
        destination: { city: cityDisplay, code: '', name: cityDisplay, country: '' },
        checkIn,
        checkOut,
        rooms,
        guestsPerRoom: Math.ceil(guests / rooms),
      })
    );
    navigate('/hotels/results');
  }

  const inputCls =
    'w-full bg-bg border border-border rounded-xl px-3 py-2.5 font-sans text-sm text-text-main outline-none focus:border-accent transition-colors';

  return (
    <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-accent px-6 py-5">
        <div className="flex items-center gap-2 mb-1">
          <Hotel size={18} className="text-white/80" />
          <span className="font-mono text-xs text-white/60 uppercase tracking-widest">Hotels</span>
        </div>
        <h2 className="font-display font-semibold text-white text-xl">
          Stay in {cityDisplay}
        </h2>
        <p className="font-sans text-sm text-white/60 mt-0.5">
          Browse properties with filters, reviews and real pricing
        </p>
      </div>

      <form onSubmit={handleSearch} className="p-5 space-y-4">
        {/* Destination (read-only) */}
        <div>
          <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">Destination</label>
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2.5">
            <Hotel size={14} className="text-muted shrink-0" />
            <span className="font-sans text-sm text-primary font-semibold">{cityDisplay}</span>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wide flex items-center gap-1 mb-1.5">
              <Calendar size={11} />
              Check-in
            </label>
            <input
              type="date"
              min={today()}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wide flex items-center gap-1 mb-1.5">
              <Calendar size={11} />
              Check-out
            </label>
            <input
              type="date"
              min={checkIn || today()}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Rooms & Guests */}
        <div className="bg-bg border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Users size={13} className="text-muted" />
            <span className="font-mono text-xs text-muted uppercase tracking-wide">Rooms & Guests</span>
          </div>
          <Stepper label="Rooms" value={rooms} min={1} max={5} onChange={setRooms} />
          <div className="h-px bg-border" />
          <Stepper label="Guests" value={guests} min={1} max={rooms * 4} onChange={setGuests} />
        </div>

        {error && (
          <p className="font-sans text-xs text-red-500">{error}</p>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-sans font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98]"
        >
          Search Hotels in {cityDisplay}
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
