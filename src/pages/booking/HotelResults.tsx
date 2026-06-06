import { useState, useEffect, useMemo } from 'react';
import NavBar from '../../components/NavBar';
import HotelCard from '../../components/booking/HotelCard';
import HotelSearchForm from '../../components/booking/HotelSearchForm';
import SearchSummaryBar from '../../components/booking/SearchSummaryBar';
import { generateHotels, type MockHotel } from '../../data/mockHotels';
import type { HotelSearchParams } from '../../components/booking/HotelSearchForm';
import { navigate } from '../../lib/router';

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden shadow-card flex flex-col sm:flex-row animate-fade-in">
      <div className="w-full sm:w-36 h-32 shrink-0 shimmer-bg" />
      <div className="p-4 flex-1 space-y-3">
        <div className="h-5 w-48 rounded shimmer-bg" />
        <div className="h-3.5 w-32 rounded shimmer-bg" />
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full shimmer-bg" />
          <div className="h-6 w-16 rounded-full shimmer-bg" />
        </div>
        <div className="h-8 w-28 rounded-xl shimmer-bg ml-auto" />
      </div>
    </div>
  );
}

type Sort = 'Price' | 'Review score' | 'Distance';

export default function HotelResults() {
  const [params, setParams] = useState<HotelSearchParams | null>(null);
  const [allHotels, setAllHotels] = useState<MockHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  const [filterStars, setFilterStars] = useState<number[]>([]);
  const [filterMaxPrice, setFilterMaxPrice] = useState(99999);
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);
  const [filterFreeCancellation, setFilterFreeCancellation] = useState(false);
  const [sort, setSort] = useState<Sort>('Price');

  useEffect(() => {
    const raw = sessionStorage.getItem('wander_hotel_search');
    if (raw) {
      const p: HotelSearchParams = JSON.parse(raw);
      setParams(p);
      const hotels = generateHotels(p.destination?.city ?? 'Dubai');
      setTimeout(() => {
        setAllHotels(hotels);
        setFilterMaxPrice(Math.max(...hotels.map(h => h.pricePerNight)) + 1);
        setLoading(false);
      }, 1200);
    } else {
      navigate('/hotels');
    }
  }, []);

  function getNights(): number {
    if (!params?.checkIn || !params?.checkOut) return 1;
    return Math.max(1, Math.round((new Date(params.checkOut).getTime() - new Date(params.checkIn).getTime()) / 86400000));
  }

  const minPrice = useMemo(() => Math.min(...allHotels.map(h => h.pricePerNight)), [allHotels]);
  const maxPriceRaw = useMemo(() => Math.max(...allHotels.map(h => h.pricePerNight)), [allHotels]);

  function toggleStar(n: number) {
    setFilterStars(prev => prev.includes(n) ? prev.filter(s => s !== n) : [...prev, n]);
  }
  function toggleAmenity(a: string) {
    setFilterAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  const filtered = useMemo(() => {
    let result = allHotels.filter(h => {
      if (filterStars.length > 0 && !filterStars.includes(h.starRating)) return false;
      if (h.pricePerNight > filterMaxPrice) return false;
      if (filterAmenities.length > 0 && !filterAmenities.every(a => h.amenities.includes(a))) return false;
      if (filterFreeCancellation && h.cancellationPolicy !== 'Free cancellation') return false;
      return true;
    });
    if (sort === 'Price') result = [...result].sort((a, b) => a.pricePerNight - b.pricePerNight);
    else if (sort === 'Review score') result = [...result].sort((a, b) => b.reviewScore - a.reviewScore);
    else result = [...result].sort((a, b) => parseFloat(a.distanceFromCenter) - parseFloat(b.distanceFromCenter));
    return result;
  }, [allHotels, filterStars, filterMaxPrice, filterAmenities, filterFreeCancellation, sort]);

  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6">

        {params && !showEditForm && (
          <div className="my-4">
            <SearchSummaryBar
              type="hotel"
              destination={params.destination?.city ?? ''}
              checkIn={params.checkIn}
              checkOut={params.checkOut}
              rooms={params.rooms}
              guests={params.rooms * params.guestsPerRoom}
              onEdit={() => setShowEditForm(true)}
            />
          </div>
        )}

        {showEditForm && params && (
          <div className="my-4 bg-surface border border-border rounded-card p-6 shadow-card animate-fade-in">
            <HotelSearchForm initialValues={params} />
            <button onClick={() => setShowEditForm(false)}
              className="mt-3 font-sans text-sm text-muted hover:text-primary transition-colors">Cancel</button>
          </div>
        )}

        <div className="flex gap-6 mt-2">
          {/* Filter sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-surface border border-border rounded-card p-4 shadow-card sticky top-20 space-y-5">
              <h3 className="font-display font-semibold text-primary text-sm">Filters</h3>

              {/* Stars */}
              <div>
                <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Star Rating</p>
                {[5, 4, 3].map(n => (
                  <label key={n} className="flex items-center gap-2 font-sans text-sm text-text-main py-1 cursor-pointer hover:text-primary">
                    <input type="checkbox" checked={filterStars.includes(n)}
                      onChange={() => toggleStar(n)} className="accent-accent rounded" />
                    {'★'.repeat(n)}
                  </label>
                ))}
              </div>

              {/* Price */}
              {allHotels.length > 0 && (
                <div>
                  <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Max Price/Night</p>
                  <input type="range" min={minPrice} max={maxPriceRaw} value={filterMaxPrice}
                    onChange={e => setFilterMaxPrice(+e.target.value)}
                    className="w-full accent-accent" />
                  <div className="flex justify-between font-mono text-xs text-muted mt-1">
                    <span>${minPrice}</span><span>${filterMaxPrice}</span>
                  </div>
                </div>
              )}

              {/* Amenities */}
              <div>
                <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Amenities</p>
                {['Free Wi-Fi', 'Pool', 'Gym', 'Breakfast included'].map(a => (
                  <label key={a} className="flex items-center gap-2 font-sans text-sm text-text-main py-1 cursor-pointer hover:text-primary">
                    <input type="checkbox" checked={filterAmenities.includes(a)}
                      onChange={() => toggleAmenity(a)} className="accent-accent rounded" />
                    {a}
                  </label>
                ))}
              </div>

              {/* Cancellation */}
              <label className="flex items-center gap-2 font-sans text-sm text-text-main cursor-pointer hover:text-primary">
                <input type="checkbox" checked={filterFreeCancellation}
                  onChange={e => setFilterFreeCancellation(e.target.checked)} className="accent-accent rounded" />
                Free cancellation only
              </label>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {!loading && allHotels.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="font-sans text-sm text-muted mr-2">{filtered.length} hotels · {getNights()} nights</span>
                {(['Price', 'Review score', 'Distance'] as Sort[]).map(s => (
                  <button key={s} onClick={() => setSort(s)}
                    className={`font-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${sort === s ? 'bg-primary text-white' : 'bg-surface border border-border text-muted hover:text-primary'}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-surface border border-border rounded-card p-10 text-center">
                <p className="font-display font-semibold text-primary text-lg mb-2">No hotels found</p>
                <p className="font-sans text-sm text-muted">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(h => <HotelCard key={h.id} hotel={h} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
