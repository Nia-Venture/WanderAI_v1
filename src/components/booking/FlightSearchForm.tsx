import { useState } from 'react';
import { navigate } from '../../lib/router';
import AirportAutocomplete from './AirportAutocomplete';
import type { Airport } from '../../data/airportsAndCities';
import { ArrowRight, ArrowLeftRight } from 'lucide-react';

export interface FlightSearchParams {
  tripType: 'oneway' | 'roundtrip';
  from: Airport | null;
  to: Airport | null;
  departDate: string;
  returnDate: string;
  passengers: { adults: number; children: number; infants: number };
  cabin: string;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function Stepper({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="font-sans text-sm text-text-main">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-primary hover:bg-bg disabled:opacity-40 transition-colors font-bold text-lg leading-none"
          disabled={value <= min}>−</button>
        <span className="font-mono text-sm font-semibold w-5 text-center">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-primary hover:bg-bg disabled:opacity-40 transition-colors font-bold text-lg leading-none"
          disabled={value >= max}>+</button>
      </div>
    </div>
  );
}

interface Props {
  compact?: boolean;
  initialValues?: Partial<FlightSearchParams>;
}

export default function FlightSearchForm({ compact, initialValues }: Props) {
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>(initialValues?.tripType ?? 'roundtrip');
  const [from, setFrom] = useState<Airport | null>(initialValues?.from ?? null);
  const [to, setTo] = useState<Airport | null>(initialValues?.to ?? null);
  const [departDate, setDepartDate] = useState(initialValues?.departDate ?? '');
  const [returnDate, setReturnDate] = useState(initialValues?.returnDate ?? '');
  const [passengers, setPassengers] = useState(initialValues?.passengers ?? { adults: 1, children: 0, infants: 0 });
  const [cabin, setCabin] = useState(initialValues?.cabin ?? 'Economy');
  const [showPax, setShowPax] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function swapAirports() {
    setFrom(to);
    setTo(from);
  }

  function setPax(field: keyof typeof passengers, val: number) {
    setPassengers((p) => ({ ...p, [field]: val }));
  }

  const totalPax = passengers.adults + passengers.children + passengers.infants;
  const paxLabel = `${totalPax} passenger${totalPax !== 1 ? 's' : ''}`;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!from) e.from = 'Required';
    if (!to) e.to = 'Required';
    if (!departDate) e.departDate = 'Required';
    if (tripType === 'roundtrip' && !returnDate) e.returnDate = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const params: FlightSearchParams = { tripType, from, to, departDate, returnDate, passengers, cabin };
    sessionStorage.setItem('wander_flight_search', JSON.stringify(params));
    navigate('/flights/results');
  }

  const inputCls = (err?: string) =>
    `w-full bg-bg border rounded-xl px-4 py-3 font-sans text-sm text-text-main outline-none transition-colors ${err ? 'border-red-400' : 'border-border focus:border-accent'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Trip type toggle */}
      <div className="flex bg-bg rounded-xl border border-border p-0.5 w-fit gap-0.5">
        {(['roundtrip', 'oneway'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTripType(t)}
            className={`font-sans text-xs font-semibold px-4 py-2 rounded-lg transition-all ${tripType === t ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-primary'}`}>
            {t === 'roundtrip' ? 'Round Trip' : 'One Way'}
          </button>
        ))}
      </div>

      {/* From / To */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
        <div>
          <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">From</label>
          <AirportAutocomplete value={from} onChange={setFrom} placeholder="Departure city or airport" error={errors.from} />
        </div>
        <button type="button" onClick={swapAirports}
          className="absolute left-1/2 top-7 -translate-x-1/2 z-10 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-border shadow-card hover:bg-bg transition-colors text-muted hover:text-primary">
          <ArrowLeftRight size={14} />
        </button>
        <div>
          <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">To</label>
          <AirportAutocomplete value={to} onChange={setTo} placeholder="Destination city or airport" error={errors.to} />
        </div>
      </div>

      {/* Dates */}
      <div className={`grid gap-3 ${tripType === 'roundtrip' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div>
          <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">Depart</label>
          <input type="date" min={today()} value={departDate}
            onChange={(e) => setDepartDate(e.target.value)}
            className={inputCls(errors.departDate)} />
          {errors.departDate && <p className="font-sans text-xs text-red-500 mt-1">{errors.departDate}</p>}
        </div>
        {tripType === 'roundtrip' && (
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">Return</label>
            <input type="date" min={departDate || today()} value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className={inputCls(errors.returnDate)} />
            {errors.returnDate && <p className="font-sans text-xs text-red-500 mt-1">{errors.returnDate}</p>}
          </div>
        )}
      </div>

      {/* Passengers + Cabin */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">Passengers</label>
          <button type="button" onClick={() => setShowPax(!showPax)}
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 font-sans text-sm text-text-main text-left hover:border-accent transition-colors">
            {paxLabel}
          </button>
          {showPax && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-chat z-20 px-4 py-2">
              <Stepper label="Adults" value={passengers.adults} min={1} max={9} onChange={(v) => setPax('adults', v)} />
              <Stepper label="Children (2–11)" value={passengers.children} min={0} max={8} onChange={(v) => setPax('children', v)} />
              <Stepper label="Infants (< 2)" value={passengers.infants} min={0} max={4} onChange={(v) => setPax('infants', v)} />
              <button type="button" onClick={() => setShowPax(false)}
                className="w-full mt-2 text-center font-sans text-xs font-semibold text-accent hover:underline py-1">Done</button>
            </div>
          )}
        </div>
        <div>
          <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1">Cabin</label>
          <select value={cabin} onChange={(e) => setCabin(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 font-sans text-sm text-text-main outline-none focus:border-accent transition-colors appearance-none">
            {['Economy', 'Premium Economy', 'Business', 'First'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit"
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-sans font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98]">
        Search Flights <ArrowRight size={16} />
      </button>
    </form>
  );
}
