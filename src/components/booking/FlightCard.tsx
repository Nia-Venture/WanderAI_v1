import { type MockFlight, formatDuration } from '../../data/mockFlights';
import { navigate } from '../../lib/router';
import { ArrowRight, Wifi, Utensils, Zap, ChevronRight } from 'lucide-react';

interface Props {
  flight: MockFlight;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Wi-Fi': <Wifi size={12} />,
  'Meal included': <Utensils size={12} />,
  'USB charging': <Zap size={12} />,
  'Power outlet': <Zap size={12} />,
};

export default function FlightCard({ flight }: Props) {
  function handleSelect() {
    sessionStorage.setItem('wander_selected_flight', JSON.stringify(flight));
    navigate(`/booking/flight/${encodeURIComponent(flight.id)}`);
  }

  const stopLabel = flight.stops === 0
    ? 'Direct'
    : flight.stops === 1
    ? `1 stop${flight.stopVia ? ` via ${flight.stopVia}` : ''}`
    : `${flight.stops} stops`;

  return (
    <div className="bg-surface border border-border rounded-card p-4 shadow-card hover:shadow-card-hover transition-all animate-fade-in">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Airline badge */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-mono font-bold text-xs"
          style={{ backgroundColor: flight.airlineColor }}
        >
          {flight.airlineCode}
        </div>

        {/* Route + times */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-display font-bold text-primary text-lg">{flight.departureTime}</span>
            <ArrowRight size={14} className="text-muted" />
            <span className="font-display font-bold text-primary text-lg">{flight.arrivalTime}</span>
          </div>
          <p className="font-sans text-xs text-muted truncate">
            {flight.departureAirport.iata} → {flight.arrivalAirport.iata} · {flight.airline}
          </p>
        </div>

        {/* Duration + stops */}
        <div className="text-center shrink-0">
          <p className="font-sans text-sm font-medium text-text-main">{formatDuration(flight.durationMinutes)}</p>
          <p className={`font-sans text-xs ${flight.stops === 0 ? 'text-accent-2 font-semibold' : 'text-muted'}`}>
            {stopLabel}
          </p>
        </div>

        {/* Amenities */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          {flight.amenities.slice(0, 3).map((a) => (
            <span key={a} title={a} className="w-6 h-6 rounded-lg bg-bg flex items-center justify-center text-muted">
              {AMENITY_ICONS[a] ?? <span className="text-xs">·</span>}
            </span>
          ))}
        </div>

        {/* Price + select */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="text-right">
            <p className="font-display font-bold text-primary text-xl">${flight.price.toLocaleString()}</p>
            <p className="font-sans text-xs text-muted">per person</p>
          </div>
          <button
            onClick={handleSelect}
            className="flex items-center gap-1.5 bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-95 whitespace-nowrap"
          >
            Select <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
