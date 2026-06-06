import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { navigate } from '../../lib/router';
import { type MockFlight, formatDuration } from '../../data/mockFlights';
import { type MockHotel } from '../../data/mockHotels';
import { AlertTriangle, Home, Search } from 'lucide-react';

function seededRef(): string {
  const n = 10000 + Math.floor(Math.random() * 90000);
  return `WA-2026-${n}`;
}

function CheckmarkSVG() {
  return (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
      <circle
        cx="40" cy="40" r="36"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-accent-2"
        style={{
          strokeDasharray: '226',
          strokeDashoffset: '0',
          animation: 'dash-circle 0.6s ease-out forwards',
        }}
      />
      <polyline
        points="22,42 34,54 58,28"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent-2"
        style={{
          strokeDasharray: '60',
          strokeDashoffset: '60',
          animation: 'dash-check 0.4s ease-out 0.5s forwards',
        }}
      />
    </svg>
  );
}

export default function BookingConfirmation() {
  const [ref] = useState(() => seededRef());
  const [flight, setFlight] = useState<MockFlight | null>(null);
  const [hotel, setHotel] = useState<MockHotel | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [nights, setNights] = useState(1);
  const [rooms, setRooms] = useState(1);

  useEffect(() => {
    const fRaw = sessionStorage.getItem('wander_selected_flight');
    if (fRaw) setFlight(JSON.parse(fRaw));
    const hRaw = sessionStorage.getItem('wander_selected_hotel');
    if (hRaw) setHotel(JSON.parse(hRaw));
    const fsRaw = sessionStorage.getItem('wander_flight_search');
    if (fsRaw) {
      const p = JSON.parse(fsRaw);
      setPassengers((p.passengers?.adults ?? 1) + (p.passengers?.children ?? 0) + (p.passengers?.infants ?? 0));
    }
    const hsRaw = sessionStorage.getItem('wander_hotel_search');
    if (hsRaw) {
      const p = JSON.parse(hsRaw);
      setRooms(p.rooms ?? 1);
      if (p.checkIn && p.checkOut) {
        setNights(Math.max(1, Math.round((new Date(p.checkOut).getTime() - new Date(p.checkIn).getTime()) / 86400000)));
      }
    }
  }, []);

  const rawType = new URLSearchParams(window.location.search).get('type');
  const type = rawType ?? (flight ? 'flight' : hotel ? 'hotel' : 'flight');

  return (
    <>
      <style>{`
        @keyframes dash-circle {
          from { stroke-dashoffset: 226; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes dash-check {
          from { stroke-dashoffset: 60; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

      <div className="min-h-screen bg-bg">
        <NavBar />
        <div className="pt-20 pb-16 max-w-2xl mx-auto px-4 sm:px-6">
          <div className="mt-12 text-center space-y-6">
            {/* Animated checkmark */}
            <div className="flex justify-center animate-pop-in">
              <CheckmarkSVG />
            </div>

            <div>
              <h1 className="font-display font-bold text-primary text-3xl mb-2">Booking Confirmed!</h1>
              <p className="font-sans text-muted text-base">
                Your booking is confirmed. A confirmation email would be sent in a real booking.
              </p>
            </div>

            {/* Ref */}
            <div className="inline-block bg-surface border border-border rounded-card px-6 py-3 shadow-card">
              <p className="font-mono text-xs text-muted uppercase tracking-wide mb-1">Booking Reference</p>
              <p className="font-mono font-bold text-primary text-2xl tracking-widest">{ref}</p>
            </div>

            {/* Summary card */}
            {(flight || hotel) && (
              <div className="bg-surface border border-border rounded-card p-5 shadow-card text-left space-y-3">
                <h3 className="font-display font-semibold text-primary text-sm">Booking Summary</h3>

                {flight && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-mono font-bold text-xs shrink-0"
                      style={{ backgroundColor: flight.airlineColor }}>
                      {flight.airlineCode}
                    </div>
                    <div>
                      <p className="font-sans text-sm font-semibold text-primary">
                        {flight.departureAirport.city} → {flight.arrivalAirport.city}
                      </p>
                      <p className="font-mono text-xs text-muted">
                        {flight.flightNumber} · {flight.cabin} · {formatDuration(flight.durationMinutes)} · {passengers} pax
                      </p>
                      <p className="font-sans text-xs text-muted mt-0.5">
                        {flight.departureTime} → {flight.arrivalTime}
                        {flight.stops === 0 ? ' · Direct' : ` · ${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                )}

                {hotel && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg shrink-0"
                      style={{ backgroundColor: hotel.imageColor }} />
                    <div>
                      <p className="font-sans text-sm font-semibold text-primary">{hotel.name}</p>
                      <p className="font-mono text-xs text-muted">
                        {hotel.roomType} · {nights} night{nights !== 1 ? 's' : ''} · {rooms} room{rooms !== 1 ? 's' : ''}
                      </p>
                      <p className="font-sans text-xs text-muted mt-0.5">{hotel.neighbourhood}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Test mode note */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
              <p className="font-sans text-xs text-amber-700">
                <span className="font-semibold">Test mode</span> — This is a simulated booking. No real payment was charged.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 bg-surface border border-border text-primary font-sans font-semibold text-sm px-6 py-3 rounded-xl hover:border-primary transition-colors">
                <Home size={15} /> Back to Home
              </button>
              <button onClick={() => navigate(type === 'hotel' ? '/hotels' : '/flights')}
                className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-sm px-6 py-3 rounded-xl transition-all active:scale-[0.98]">
                <Search size={15} /> Search Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
