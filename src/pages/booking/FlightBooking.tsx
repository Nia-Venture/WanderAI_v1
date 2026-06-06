import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { navigate } from '../../lib/router';
import { type MockFlight, formatDuration } from '../../data/mockFlights';
import { ArrowLeft, ArrowRight, Plane, Briefcase, Clock, Wifi, Utensils, Zap, Monitor, Star } from 'lucide-react';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Wi-Fi': <Wifi size={13} />,
  'Meal included': <Utensils size={13} />,
  'USB charging': <Zap size={13} />,
  'Power outlet': <Zap size={13} />,
  'In-flight entertainment': <Monitor size={13} />,
  'Extra legroom': <Star size={13} />,
  'Priority boarding': <Star size={13} />,
};

export default function FlightBooking({ flightId }: { flightId: string }) {
  const [flight, setFlight] = useState<MockFlight | null>(null);
  const [passengers, setPassengers] = useState(1);

  useEffect(() => {
    const raw = sessionStorage.getItem('wander_selected_flight');
    if (raw) {
      const f: MockFlight = JSON.parse(raw);
      if (f.id === flightId) setFlight(f);
    }
    const searchRaw = sessionStorage.getItem('wander_flight_search');
    if (searchRaw) {
      const p = JSON.parse(searchRaw);
      setPassengers((p.passengers?.adults ?? 1) + (p.passengers?.children ?? 0) + (p.passengers?.infants ?? 0));
    }
  }, [flightId]);

  if (!flight) {
    return (
      <div className="min-h-screen bg-bg">
        <NavBar />
        <div className="pt-20 max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="font-display font-semibold text-primary text-xl mb-4">Flight not found</p>
          <button onClick={() => navigate('/flights/results')} className="font-sans text-sm text-accent hover:underline">
            Back to results
          </button>
        </div>
      </div>
    );
  }

  const baseFare = flight.price;
  const taxes = Math.round(baseFare * 0.18);
  const totalPerPax = baseFare + taxes;
  const grandTotal = totalPerPax * passengers;

  function handleContinue() {
    navigate(`/booking/checkout?type=flight&id=${encodeURIComponent(flight!.id)}`);
  }

  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="pt-20 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate('/flights/results')}
          className="flex items-center gap-1.5 font-sans text-sm text-muted hover:text-primary transition-colors mt-6 mb-6">
          <ArrowLeft size={15} /> Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Flight details */}
          <div className="lg:col-span-3 space-y-4">
            {/* Airline header */}
            <div className="bg-surface border border-border rounded-card p-5 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-mono font-bold text-sm"
                  style={{ backgroundColor: flight.airlineColor }}>
                  {flight.airlineCode}
                </div>
                <div>
                  <p className="font-display font-semibold text-primary text-base">{flight.airline}</p>
                  <p className="font-mono text-xs text-muted">{flight.flightNumber} · {flight.cabin}</p>
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="font-mono font-bold text-primary text-3xl">{flight.departureTime}</p>
                  <p className="font-mono text-sm font-semibold text-accent mt-0.5">{flight.departureAirport.iata}</p>
                  <p className="font-sans text-xs text-muted">{flight.departureAirport.city}</p>
                </div>

                <div className="flex-1 flex flex-col items-center gap-1">
                  <p className="font-mono text-xs text-muted">{formatDuration(flight.durationMinutes)}</p>
                  <div className="w-full flex items-center gap-1">
                    <div className="flex-1 h-px bg-border" />
                    {flight.stops === 0 ? (
                      <Plane size={14} className="text-accent-2" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="flex-1 h-px bg-border" />
                        <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <p className="font-sans text-xs text-muted">
                    {flight.stops === 0 ? 'Direct' : flight.stops === 1 ? `1 stop via ${flight.stopVia}` : `${flight.stops} stops`}
                  </p>
                </div>

                <div className="text-center">
                  <p className="font-mono font-bold text-primary text-3xl">{flight.arrivalTime}</p>
                  <p className="font-mono text-sm font-semibold text-accent mt-0.5">{flight.arrivalAirport.iata}</p>
                  <p className="font-sans text-xs text-muted">{flight.arrivalAirport.city}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-surface border border-border rounded-card p-5 shadow-card space-y-4">
              <h3 className="font-display font-semibold text-primary text-sm">Flight Details</h3>

              <div className="flex items-center gap-3 text-sm">
                <Clock size={15} className="text-muted shrink-0" />
                <div>
                  <span className="font-sans text-text-main">Duration: </span>
                  <span className="font-mono font-semibold text-primary">{formatDuration(flight.durationMinutes)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Briefcase size={15} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-text-main">Baggage Allowance</p>
                  <p className="font-mono text-xs text-muted mt-0.5">{flight.baggageAllowance}</p>
                </div>
              </div>

              {flight.amenities.length > 0 && (
                <div>
                  <p className="font-sans text-sm text-text-main mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {flight.amenities.map(a => (
                      <span key={a} className="inline-flex items-center gap-1.5 bg-bg border border-border rounded-full px-3 py-1 font-sans text-xs text-muted">
                        {AMENITY_ICONS[a]}
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Price summary */}
          <div className="lg:col-span-2">
            <div className="bg-surface border border-border rounded-card p-5 shadow-card sticky top-24 space-y-4">
              <h3 className="font-display font-semibold text-primary text-sm">Fare Summary</h3>

              <div className="space-y-2">
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted">Base fare × {passengers}</span>
                  <span className="text-text-main">${(baseFare * passengers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted">Taxes & fees (18%)</span>
                  <span className="text-text-main">${(taxes * passengers).toLocaleString()}</span>
                </div>
                <div className="h-px bg-border my-1" />
                <div className="flex justify-between">
                  <span className="font-display font-semibold text-primary text-sm">Total</span>
                  <span className="font-display font-bold text-primary text-xl">${grandTotal.toLocaleString()}</span>
                </div>
                <p className="font-sans text-xs text-muted">
                  ${totalPerPax.toLocaleString()} per passenger · {passengers} passenger{passengers !== 1 ? 's' : ''}
                </p>
              </div>

              <button onClick={handleContinue}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-sans font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98]">
                Continue to Checkout <ArrowRight size={16} />
              </button>

              <p className="font-sans text-xs text-muted text-center">
                {flight.stops === 0 ? 'Direct flight' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`} · {flight.cabin}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
