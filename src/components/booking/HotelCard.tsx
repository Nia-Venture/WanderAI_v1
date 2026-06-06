import { type MockHotel } from '../../data/mockHotels';
import { navigate } from '../../lib/router';
import { Star, MapPin, ChevronRight, Wifi, Waves, Dumbbell, Coffee } from 'lucide-react';

interface Props {
  hotel: MockHotel;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Free Wi-Fi': <Wifi size={11} />,
  'Pool': <Waves size={11} />,
  'Gym': <Dumbbell size={11} />,
  'Breakfast included': <Coffee size={11} />,
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

export default function HotelCard({ hotel }: Props) {
  function handleSelect() {
    sessionStorage.setItem('wander_selected_hotel', JSON.stringify(hotel));
    navigate(`/booking/hotel/${encodeURIComponent(hotel.id)}`);
  }

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all animate-fade-in flex flex-col sm:flex-row">
      {/* Image placeholder */}
      <div
        className="w-full sm:w-36 h-32 sm:h-auto shrink-0"
        style={{ backgroundColor: hotel.imageColor }}
      />

      <div className="p-4 flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Stars n={hotel.starRating} />
            </div>
            <h3 className="font-display font-semibold text-primary text-base leading-tight">{hotel.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-muted" />
              <p className="font-sans text-xs text-muted">{hotel.neighbourhood} · {hotel.distanceFromCenter}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-primary text-white rounded-lg px-2 py-1 text-center">
              <p className="font-mono font-bold text-sm leading-none">{hotel.reviewScore}</p>
            </div>
            <div>
              <p className="font-sans text-xs font-semibold text-primary">{scoreLabel(hotel.reviewScore)}</p>
              <p className="font-sans text-xs text-muted">{hotel.reviewCount.toLocaleString()} reviews</p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {hotel.amenities.slice(0, 3).map((a) => (
            <span key={a} className="inline-flex items-center gap-1 bg-bg border border-border rounded-full px-2 py-0.5 font-sans text-xs text-muted">
              {AMENITY_ICONS[a] ?? null}
              {a}
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between gap-3 flex-wrap mt-auto pt-1">
          <div>
            <span className={`font-sans text-xs font-semibold ${hotel.cancellationPolicy === 'Free cancellation' ? 'text-accent-2' : 'text-muted'}`}>
              {hotel.cancellationPolicy}
            </span>
            <p className="font-sans text-xs text-muted">{hotel.roomType}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-display font-bold text-primary text-lg">${hotel.pricePerNight}<span className="font-sans font-normal text-xs text-muted">/night</span></p>
            </div>
            <button
              onClick={handleSelect}
              className="flex items-center gap-1.5 bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-95 whitespace-nowrap"
            >
              Select Room <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
