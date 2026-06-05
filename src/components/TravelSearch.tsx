import { useState } from 'react';
import { searchTravel } from '../api/searchTravel';
import type { FlightResult, HotelResult } from '../types/travel';
import {
  Plane,
  Hotel,
  Search,
  ArrowRight,
  Clock,
  MapPin,
  Star,
  Wifi,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface TravelSearchProps {
  cityName: string;
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const AIRLINE_COLORS: Record<string, string> = {
  EK: '#C01C2C', BA: '#075AAA', QR: '#5C0632', EY: '#B18A40',
  LH: '#05164D', AF: '#002157', TK: '#C70000', SQ: '#003B6F',
  FR: '#003476', U2: '#FF6600', VS: '#EE0606', AA: '#0078D2',
  UA: '#003580', DL: '#E01933', WY: '#C8AA6E', AI: '#C8232C',
};

function airlineColor(code: string): string {
  return AIRLINE_COLORS[code?.toUpperCase()] ?? '#1A3A4A';
}

function FlightCard({ flight }: { flight: FlightResult }) {
  const color = airlineColor(flight.airline_code);
  return (
    <div className="bg-surface rounded-card border border-border shadow-card hover:shadow-card-hover transition-all duration-200 p-5 group">
      <div className="flex items-start gap-4">
        {/* Airline badge */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-mono font-bold text-sm shrink-0"
          style={{ backgroundColor: color }}
        >
          {flight.airline_code ?? '??'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-sans font-semibold text-primary text-sm">{flight.airline}</span>
            <span className="font-mono text-xs text-muted">{flight.flight_number}</span>
          </div>

          {/* Route timeline */}
          <div className="flex items-center gap-3 mt-3">
            <div className="text-center">
              <p className="font-display font-bold text-primary text-xl leading-none">{flight.departure_time}</p>
              <p className="font-mono text-xs text-muted mt-1 truncate max-w-[80px]">{flight.from_airport}</p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 w-full">
                <div className="flex-1 h-px bg-border" />
                <Plane size={12} className="text-accent shrink-0" />
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={10} className="text-muted" />
                <span className="font-mono text-xs text-muted">{flight.duration}</span>
              </div>
              {flight.stops > 0 && (
                <span className="font-mono text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                  {flight.stops} stop{flight.stops > 1 ? 's' : ''}{flight.stop_city ? ` · ${flight.stop_city}` : ''}
                </span>
              )}
              {flight.stops === 0 && (
                <span className="font-mono text-xs text-accent-2 bg-accent-2/10 px-2 py-0.5 rounded-full">
                  Direct
                </span>
              )}
            </div>

            <div className="text-center">
              <p className="font-display font-bold text-primary text-xl leading-none">{flight.arrival_time}</p>
              <p className="font-mono text-xs text-muted mt-1 truncate max-w-[80px]">{flight.to_airport}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div>
          <span className="font-mono text-xs text-muted">{flight.seat_class}</span>
          {flight.seats_left <= 4 && (
            <span className="ml-2 font-mono text-xs text-red-500">
              Only {flight.seats_left} left!
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-display font-bold text-accent text-2xl leading-none">
              ${flight.price_usd.toLocaleString()}
            </p>
            <p className="font-mono text-xs text-muted">per person</p>
          </div>
          <button className="flex items-center gap-1.5 bg-primary hover:bg-primary-light text-surface font-sans font-semibold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95">
            Select
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HotelCard({ hotel }: { hotel: HotelResult }) {
  return (
    <div className="bg-surface rounded-card border border-border shadow-card hover:shadow-card-hover transition-all duration-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-semibold text-primary text-base">{hotel.name}</h4>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star key={i} size={11} className="text-yellow-500 fill-yellow-500" />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={11} className="text-muted shrink-0" />
            <span className="font-sans text-xs text-muted truncate">{hotel.location}</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 bg-accent-2/10 px-2.5 py-1 rounded-lg">
              <span className="font-mono font-bold text-accent-2 text-sm">{hotel.rating}</span>
              <span className="font-sans text-xs text-muted">/ 10</span>
            </div>
            <span className="font-sans text-xs text-muted">{hotel.reviews_count.toLocaleString()} reviews</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="font-display font-bold text-accent text-2xl leading-none">
            ${hotel.price_per_night_usd.toLocaleString()}
          </p>
          <p className="font-mono text-xs text-muted">per night</p>
          <p className="font-sans text-xs text-primary font-semibold mt-0.5">
            ${hotel.total_price_usd.toLocaleString()} total
          </p>
        </div>
      </div>

      <p className="font-sans text-sm text-text-main mt-3 leading-relaxed italic">
        "{hotel.highlights}"
      </p>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {hotel.amenities.slice(0, 5).map((a) => (
          <span key={a} className="flex items-center gap-1 font-mono text-xs bg-primary/5 text-primary px-2 py-0.5 rounded-md">
            {a === 'Free WiFi' && <Wifi size={10} />}
            {a}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="font-sans text-xs text-muted">{hotel.booking_class}</span>
        <button className="flex items-center gap-1.5 bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95">
          Book Now
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

export default function TravelSearch({ cityName }: TravelSearchProps) {
  const [tab, setTab] = useState<'flights' | 'hotels'>('flights');

  // Flight form
  const [from, setFrom] = useState('London');
  const [departDate, setDepartDate] = useState(todayPlus(7));
  const [returnDate, setReturnDate] = useState(todayPlus(14));
  const [passengers, setPassengers] = useState(1);
  const [seatClass, setSeatClass] = useState('Economy');

  // Hotel form
  const [checkIn, setCheckIn] = useState(todayPlus(7));
  const [checkOut, setCheckOut] = useState(todayPlus(10));
  const [guests, setGuests] = useState(2);

  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const cityDisplay = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  async function handleSearch() {
    setLoading(true);
    setError(null);
    try {
      const result = await searchTravel(
        tab === 'flights'
          ? { type: 'flights', city: cityName, from, depart_date: departDate, return_date: returnDate, passengers, seat_class: seatClass }
          : { type: 'hotels', city: cityName, check_in: checkIn, check_out: checkOut, guests }
      );
      if (result.type === 'flights') setFlights(result.flights ?? []);
      else setHotels(result.hotels ?? []);
      setSearched(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full bg-bg border border-border rounded-xl px-3 py-2.5 font-sans text-sm text-text-main placeholder-muted outline-none focus:border-accent transition-colors';
  const labelClass = 'font-mono text-xs text-muted uppercase tracking-wide block mb-1.5';

  return (
    <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-primary px-6 py-5">
        <h2 className="font-display font-semibold text-white text-xl mb-0.5">
          Flights & Hotels to {cityDisplay}
        </h2>
        <p className="font-sans text-sm text-white/60">
          AI-powered travel search — real routes, real prices
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(['flights', 'hotels'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearched(false); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-sans font-semibold text-sm transition-all ${
              tab === t
                ? 'text-accent border-b-2 border-accent bg-accent/5'
                : 'text-muted hover:text-primary'
            }`}
          >
            {t === 'flights' ? <Plane size={15} /> : <Hotel size={15} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Search form */}
      <div className="p-6">
        {tab === 'flights' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className={labelClass}>From</label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="City or airport"
                className={inputClass}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className={labelClass}>To</label>
              <input
                type="text"
                value={cityDisplay}
                readOnly
                className={`${inputClass} opacity-60 cursor-default`}
              />
            </div>
            <div>
              <label className={labelClass}>Depart</label>
              <input
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Return</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Passengers</label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className={inputClass}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Class</label>
              <select
                value={seatClass}
                onChange={(e) => setSeatClass(e.target.value)}
                className={inputClass}
              >
                {['Economy', 'Premium Economy', 'Business', 'First'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-sans font-semibold text-sm py-2.5 rounded-xl transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                ) : (
                  <>
                    <Search size={15} />
                    Search Flights
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Destination</label>
              <input
                type="text"
                value={cityDisplay}
                readOnly
                className={`${inputClass} opacity-60 cursor-default`}
              />
            </div>
            <div>
              <label className={labelClass}>Check-in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Check-out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className={inputClass}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 md:col-span-3 flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-sans font-semibold text-sm py-2.5 rounded-xl transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                ) : (
                  <>
                    <Search size={15} />
                    Search Hotels
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="font-sans text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Results */}
        {searched && !loading && !error && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-primary">
                {tab === 'flights'
                  ? `${flights.length} flights found`
                  : `${hotels.length} hotels found`}
              </h3>
              <span className="font-mono text-xs text-muted">
                {tab === 'flights' ? `${from} → ${cityDisplay}` : cityDisplay}
              </span>
            </div>

            <div className="space-y-4">
              {tab === 'flights' && flights.map((f, i) => (
                <FlightCard key={i} flight={f} />
              ))}
              {tab === 'hotels' && hotels.map((h, i) => (
                <HotelCard key={i} hotel={h} />
              ))}
            </div>

            <p className="font-sans text-xs text-muted text-center mt-5">
              Prices are AI-estimated for planning purposes. Book via airline/hotel websites for confirmed rates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
