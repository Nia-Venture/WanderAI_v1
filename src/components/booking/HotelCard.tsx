import { useState } from 'react';
import { type MockHotel } from '../../data/mockHotels';
import { navigate } from '../../lib/router';
import { Star, MapPin, ChevronRight, Wifi, Waves, Dumbbell, Coffee, Utensils, Dumbbell as Spa, Car, UtensilsCrossed } from 'lucide-react';

interface Props {
  hotel: MockHotel;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Free Wi-Fi':         <Wifi size={10} />,
  'Pool':               <Waves size={10} />,
  'Gym':                <Dumbbell size={10} />,
  'Breakfast included': <Coffee size={10} />,
  'Restaurant':         <Utensils size={10} />,
  'Spa':                <Spa size={10} />,
  'Parking':            <Car size={10} />,
  'Bar':                <UtensilsCrossed size={10} />,
};

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: n }, (_, i) => (
        <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
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

export default function HotelCard({ hotel }: Props) {
  const [imgError, setImgError] = useState(false);

  function handleSelect() {
    sessionStorage.setItem('wander_selected_hotel', JSON.stringify(hotel));
    navigate(`/booking/hotel/${encodeURIComponent(hotel.id)}`);
  }

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 animate-fade-in flex flex-col sm:flex-row group">
      {/* Hotel image with brand overlay */}
      <div className="relative w-full sm:w-44 h-44 sm:h-auto shrink-0 overflow-hidden">
        {!imgError ? (
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: hotel.brandColor + '33' }} />
        )}
        {/* Dark gradient for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        {/* Brand badge — top left */}
        <div
          className="absolute top-2.5 left-2.5 px-2 py-1 rounded text-white font-sans font-bold text-xs tracking-wide shadow-sm"
          style={{ backgroundColor: hotel.brandColor }}
        >
          {hotel.brand}
        </div>
        {/* Stars — bottom left */}
        <div className="absolute bottom-2.5 left-2.5">
          <Stars n={hotel.starRating} />
        </div>
      </div>

      {/* Hotel info */}
      <div className="p-4 flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-primary text-base leading-tight truncate">{hotel.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-muted shrink-0" />
              <p className="font-sans text-xs text-muted truncate">
                {hotel.neighbourhood} · {hotel.distanceFromCenter}
              </p>
            </div>
          </div>
          {/* Review score badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-mono font-bold text-sm shrink-0"
              style={{ backgroundColor: hotel.brandColor }}
            >
              {hotel.reviewScore}
            </div>
            <div className="text-right hidden sm:block">
              <p className="font-sans text-xs font-semibold text-primary leading-tight">{scoreLabel(hotel.reviewScore)}</p>
              <p className="font-sans text-xs text-muted">{hotel.reviewCount.toLocaleString()} reviews</p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {hotel.amenities.slice(0, 4).map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 bg-bg border border-border rounded-full px-2 py-0.5 font-sans text-xs text-muted"
            >
              {AMENITY_ICONS[a] ?? null}
              {a}
            </span>
          ))}
        </div>

        {/* Footer: policy + price + CTA */}
        <div className="flex items-end justify-between gap-3 flex-wrap mt-auto pt-1 border-t border-border">
          <div>
            <span
              className={`font-sans text-xs font-semibold ${
                hotel.cancellationPolicy === 'Free cancellation' ? 'text-emerald-600' : 'text-muted'
              }`}
            >
              {hotel.cancellationPolicy}
            </span>
            <p className="font-sans text-xs text-muted mt-0.5">{hotel.roomType}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-sans text-xs text-muted">From</p>
              <p className="font-display font-bold text-primary text-xl leading-tight">
                ${hotel.pricePerNight}
                <span className="font-sans font-normal text-xs text-muted">/night</span>
              </p>
            </div>
            <button
              onClick={handleSelect}
              className="flex items-center gap-1.5 text-white font-sans font-semibold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-95 whitespace-nowrap hover:opacity-90"
              style={{ backgroundColor: hotel.brandColor }}
            >
              See Rooms <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
