import { useState } from 'react';
import { navigate } from '../../lib/router';
import AirportAutocomplete from './AirportAutocomplete';
import type { Airport } from '../../data/airportsAndCities';
import { ArrowRight } from 'lucide-react';

export interface HotelSearchParams {
  destination: Airport | null;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guestsPerRoom: number;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function Stepper({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-sans text-sm text-text-main">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-primary hover:bg-bg disabled:opacity-40 transition-colors font-bold text-lg leading-none"
          disabled={value <= min}>−</button>
        <span className="font-mono text-sm font-semibold w-4 text-center">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-primary hover:bg-bg disabled:opacity-40 transition-colors font-bold text-lg leading-none"
          disabled={value >= max}>+</button>
      </div>
    </div>
  );
}

interface Props {
  initialValues?: Partial<HotelSearchParams>;
}

export default function HotelSearchForm({ initialValues }: Props) {
  const [destination, setDestination] = useState<Airport | null>(initialValues?.destination ?? null);
  const [checkIn, setCheckIn] = useState(initialValues?.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(initialValues?.checkOut ?? '');
  const [rooms, setRooms] = useState(initialValues?.rooms ?? 1);
  const [guestsPerRoom, setGuestsPerRoom] = useState(initialValues?.guestsPerRoom ?? 2);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!destination) e.destination = 'Required';
    if (!checkIn) e.checkIn = 'Required';
    if (!checkOut) e.checkOut = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const params: HotelSearchParams = { destination, checkIn, checkOut, rooms, guestsPerRoom };
    sessionStorage.setItem('wander_hotel_search', JSON.stringify(params));
    navigate('/hotels/results');
  }

  const inputCls = (err?: string) =>
    `w-full bg-bg border rounded-xl px-4 py-3 font-sans text-sm text-text-main outline-none transition-colors ${err ? 'border-red-400' : 'border-border focus:border-accent'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">Destination</label>
        <AirportAutocomplete
          value={destination}
          onChange={setDestination}
          placeholder="City, country or destination"
          error={errors.destination}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">Check-in</label>
          <input type="date" min={today()} value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={inputCls(errors.checkIn)} />
          {errors.checkIn && <p className="font-sans text-xs text-red-500 mt-1">{errors.checkIn}</p>}
        </div>
        <div>
          <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">Check-out</label>
          <input type="date" min={checkIn || today()} value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={inputCls(errors.checkOut)} />
          {errors.checkOut && <p className="font-sans text-xs text-red-500 mt-1">{errors.checkOut}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-bg border border-border rounded-xl p-4">
        <Stepper label="Rooms" value={rooms} min={1} max={5} onChange={setRooms} />
        <Stepper label="Guests/room" value={guestsPerRoom} min={1} max={4} onChange={setGuestsPerRoom} />
      </div>

      <button type="submit"
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-sans font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98]">
        Search Hotels <ArrowRight size={16} />
      </button>
    </form>
  );
}
