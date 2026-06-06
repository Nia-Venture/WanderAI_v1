import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { navigate } from '../../lib/router';
import { type MockHotel } from '../../data/mockHotels';
import { ArrowLeft, ArrowRight, MapPin, Star, Wifi, Waves, Dumbbell, Coffee, Calendar } from 'lucide-react';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Free Wi-Fi': <Wifi size={13} />,
  'Pool': <Waves size={13} />,
  'Gym': <Dumbbell size={13} />,
  'Breakfast included': <Coffee size={13} />,
};

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: n }, (_, i) => (
        <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
      ))}
    </span>
  );
}

function scoreLabel(s: number): string {
  if (s >= 9) return 'Exceptional';
  if (s >= 8.5) return 'Excellent';
  if (s >= 8) return 'Very Good';
  if (s >= 7) return 'Good';
  return 'Fair';
}

function formatDate(d: string): string {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HotelBooking({ hotelId }: { hotelId: string }) {
  const [hotel, setHotel] = useState<MockHotel | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(1);

  useEffect(() => {
    const raw = sessionStorage.getItem('wander_selected_hotel');
    if (raw) {
      const h: MockHotel = JSON.parse(raw);
      if (h.id === hotelId) setHotel(h);
    }
    const searchRaw = sessionStorage.getItem('wander_hotel_search');
    if (searchRaw) {
      const p = JSON.parse(searchRaw);
      setCheckIn(p.checkIn ?? '');
      setCheckOut(p.checkOut ?? '');
      setRooms(p.rooms ?? 1);
    }
  }, [hotelId]);

  if (!hotel) {
    return (
      <div className="min-h-screen bg-bg">
        <NavBar />
        <div className="pt-20 max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="font-display font-semibold text-primary text-xl mb-4">Hotel not found</p>
          <button onClick={() => navigate('/hotels/results')} className="font-sans text-sm text-accent hover:underline">
            Back to results
          </button>
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1;
  const subtotal = hotel.pricePerNight * nights * rooms;
  const taxes = Math.round(subtotal * 0.10);
  const total = subtotal + taxes;

  function handleContinue() {
    navigate(`/booking/checkout?type=hotel&id=${encodeURIComponent(hotel!.id)}`);
  }

  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="pt-20 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate('/hotels/results')}
          className="flex items-center gap-1.5 font-sans text-sm text-muted hover:text-primary transition-colors mt-6 mb-6">
          <ArrowLeft size={15} /> Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Hotel details */}
          <div className="lg:col-span-3 space-y-4">
            {/* Hero image + header */}
            <div className="bg-surface border border-border rounded-card overflow-hidden shadow-card">
              <div className="relative w-full h-52 overflow-hidden">
                <img
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.style.backgroundColor = hotel.brandColor + '33';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div
                  className="absolute top-3 left-3 px-2.5 py-1 rounded text-white font-sans font-bold text-xs tracking-wide"
                  style={{ backgroundColor: hotel.brandColor }}
                >
                  {hotel.brand}
                </div>
                <div className="absolute bottom-3 left-3">
                  <Stars n={hotel.starRating} />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="font-display font-bold text-primary text-xl">{hotel.name}</h2>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-muted" />
                      <p className="font-sans text-sm text-muted">{hotel.neighbourhood} · {hotel.distanceFromCenter}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-white rounded-lg px-2.5 py-1.5 text-center" style={{ backgroundColor: hotel.brandColor }}>
                      <p className="font-mono font-bold text-base leading-none">{hotel.reviewScore}</p>
                    </div>
                    <div>
                      <p className="font-sans text-sm font-semibold text-primary">{scoreLabel(hotel.reviewScore)}</p>
                      <p className="font-sans text-xs text-muted">{hotel.reviewCount.toLocaleString()} reviews</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Room & Dates */}
            <div className="bg-surface border border-border rounded-card p-5 shadow-card space-y-4">
              <h3 className="font-display font-semibold text-primary text-sm">Your Stay</h3>

              <div className="flex items-start gap-3">
                <Calendar size={15} className="text-muted shrink-0 mt-0.5" />
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <p className="font-mono text-xs text-muted uppercase tracking-wide mb-0.5">Check-in</p>
                    <p className="font-sans text-sm font-semibold text-primary">{formatDate(checkIn) || '—'}</p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-muted uppercase tracking-wide mb-0.5">Check-out</p>
                    <p className="font-sans text-sm font-semibold text-primary">{formatDate(checkOut) || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-bg border border-border rounded-xl p-3">
                <p className="font-sans text-sm font-semibold text-primary">{hotel.roomType}</p>
                <p className="font-sans text-xs text-muted mt-0.5">{rooms} room{rooms !== 1 ? 's' : ''} · {nights} night{nights !== 1 ? 's' : ''}</p>
                <p className={`font-sans text-xs font-semibold mt-1 ${hotel.cancellationPolicy === 'Free cancellation' ? 'text-accent-2' : 'text-muted'}`}>
                  {hotel.cancellationPolicy}
                </p>
              </div>

              {hotel.amenities.length > 0 && (
                <div>
                  <p className="font-sans text-sm text-text-main mb-2">Included Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.map(a => (
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
              <h3 className="font-display font-semibold text-primary text-sm">Price Summary</h3>

              <div className="space-y-2">
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted">${hotel.pricePerNight}/night × {nights} nights{rooms > 1 ? ` × ${rooms} rooms` : ''}</span>
                  <span className="text-text-main">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted">Taxes (10%)</span>
                  <span className="text-text-main">${taxes.toLocaleString()}</span>
                </div>
                <div className="h-px bg-border my-1" />
                <div className="flex justify-between">
                  <span className="font-display font-semibold text-primary text-sm">Total</span>
                  <span className="font-display font-bold text-primary text-xl">${total.toLocaleString()}</span>
                </div>
                <p className="font-sans text-xs text-muted">
                  For {nights} night{nights !== 1 ? 's' : ''}, {rooms} room{rooms !== 1 ? 's' : ''}
                </p>
              </div>

              <button onClick={handleContinue}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-sans font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98]">
                Continue to Checkout <ArrowRight size={16} />
              </button>

              <p className="font-sans text-xs text-muted text-center">
                {hotel.cancellationPolicy}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
