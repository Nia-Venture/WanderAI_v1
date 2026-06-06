import { useState, useEffect, useMemo } from 'react';
import NavBar from '../../components/NavBar';
import FlightCard from '../../components/booking/FlightCard';
import FlightSearchForm from '../../components/booking/FlightSearchForm';
import SearchSummaryBar from '../../components/booking/SearchSummaryBar';
import { generateFlights, type MockFlight } from '../../data/mockFlights';
import type { FlightSearchParams } from '../../components/booking/FlightSearchForm';

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-card p-4 shadow-card animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl shimmer-bg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 rounded shimmer-bg" />
          <div className="h-3.5 w-28 rounded shimmer-bg" />
        </div>
        <div className="w-16 h-10 rounded shimmer-bg" />
        <div className="w-20 h-10 rounded-xl shimmer-bg" />
      </div>
    </div>
  );
}

const SORT_OPTIONS = ['Cheapest', 'Fastest', 'Best'] as const;
type Sort = typeof SORT_OPTIONS[number];

export default function FlightResults() {
  const [params, setParams] = useState<FlightSearchParams | null>(null);
  const [allFlights, setAllFlights] = useState<MockFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  const [filterStops, setFilterStops] = useState<'all' | '0' | '1' | '2'>('all');
  const [filterMaxPrice, setFilterMaxPrice] = useState(99999);
  const [filterTimeSlot, setFilterTimeSlot] = useState<string>('');
  const [filterAirlines, setFilterAirlines] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>('Cheapest');

  useEffect(() => {
    const raw = sessionStorage.getItem('wander_flight_search');
    if (raw) {
      const p: FlightSearchParams = JSON.parse(raw);
      setParams(p);
      const flights = generateFlights(
        p.from?.iata ?? 'DXB', p.from?.city ?? 'Dubai',
        p.to?.iata ?? 'LHR', p.to?.city ?? 'London',
        p.cabin
      );
      setTimeout(() => {
        setAllFlights(flights);
        setFilterMaxPrice(Math.max(...flights.map(f => f.price)) + 1);
        setLoading(false);
      }, 1200);
    } else {
      navigate('/flights');
    }
  }, []);

  const airlines = useMemo(() => [...new Set(allFlights.map(f => f.airline))], [allFlights]);
  const minPrice = useMemo(() => Math.min(...allFlights.map(f => f.price)), [allFlights]);
  const maxPrice = useMemo(() => Math.max(...allFlights.map(f => f.price)), [allFlights]);

  function getTimeSlot(time: string): string {
    const h = parseInt(time.split(':')[0], 10);
    if (h >= 6 && h < 12) return 'Morning';
    if (h >= 12 && h < 18) return 'Afternoon';
    if (h >= 18 && h < 24) return 'Evening';
    return 'Night';
  }

  const filtered = useMemo(() => {
    let result = allFlights.filter(f => {
      if (filterStops === '0' && f.stops !== 0) return false;
      if (filterStops === '1' && f.stops !== 1) return false;
      if (filterStops === '2' && f.stops < 2) return false;
      if (f.price > filterMaxPrice) return false;
      if (filterTimeSlot && getTimeSlot(f.departureTime) !== filterTimeSlot) return false;
      if (filterAirlines.length > 0 && !filterAirlines.includes(f.airline)) return false;
      return true;
    });

    if (sort === 'Cheapest') result = [...result].sort((a, b) => a.price - b.price);
    else if (sort === 'Fastest') result = [...result].sort((a, b) => a.durationMinutes - b.durationMinutes);
    else result = [...result].sort((a, b) => (a.price / 100 + a.durationMinutes / 60) - (b.price / 100 + b.durationMinutes / 60));

    return result;
  }, [allFlights, filterStops, filterMaxPrice, filterTimeSlot, filterAirlines, sort]);

  function toggleAirline(name: string) {
    setFilterAirlines(prev => prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]);
  }

  const totalPax = params ? params.passengers.adults + params.passengers.children + params.passengers.infants : 1;

  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <div className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Summary bar */}
        {params && !showEditForm && (
          <div className="my-4">
            <SearchSummaryBar
              type="flight"
              from={params.from?.iata ?? ''}
              to={params.to?.iata ?? ''}
              departDate={params.departDate}
              returnDate={params.returnDate}
              passengers={totalPax}
              cabin={params.cabin}
              tripType={params.tripType}
              onEdit={() => setShowEditForm(true)}
            />
          </div>
        )}

        {/* Edit form */}
        {showEditForm && params && (
          <div className="my-4 bg-surface border border-border rounded-card p-6 shadow-card animate-fade-in">
            <FlightSearchForm
              initialValues={params}
            />
            <button onClick={() => setShowEditForm(false)}
              className="mt-3 font-sans text-sm text-muted hover:text-primary transition-colors">Cancel</button>
          </div>
        )}

        <div className="flex gap-6 mt-2">
          {/* Filter sidebar */}
          <aside className="hidden lg:block w-56 shrink-0 space-y-5">
            <div className="bg-surface border border-border rounded-card p-4 shadow-card sticky top-20">
              <h3 className="font-display font-semibold text-primary text-sm mb-4">Filters</h3>

              {/* Stops */}
              <div className="mb-4">
                <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Stops</p>
                {([['all', 'All'], ['0', 'Direct only'], ['1', '1 stop'], ['2', '2+ stops']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setFilterStops(val)}
                    className={`block w-full text-left font-sans text-sm px-2 py-1.5 rounded-lg transition-colors mb-0.5 ${filterStops === val ? 'bg-accent/10 text-accent font-semibold' : 'text-text-main hover:bg-bg'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Price */}
              {allFlights.length > 0 && (
                <div className="mb-4">
                  <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Max Price</p>
                  <input type="range" min={minPrice} max={maxPrice} value={filterMaxPrice}
                    onChange={e => setFilterMaxPrice(+e.target.value)}
                    className="w-full accent-accent" />
                  <div className="flex justify-between font-mono text-xs text-muted mt-1">
                    <span>${minPrice}</span><span>${filterMaxPrice}</span>
                  </div>
                </div>
              )}

              {/* Departure time */}
              <div className="mb-4">
                <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Departure</p>
                {['Morning', 'Afternoon', 'Evening', 'Night'].map(slot => (
                  <button key={slot} onClick={() => setFilterTimeSlot(prev => prev === slot ? '' : slot)}
                    className={`block w-full text-left font-sans text-sm px-2 py-1.5 rounded-lg transition-colors mb-0.5 ${filterTimeSlot === slot ? 'bg-accent/10 text-accent font-semibold' : 'text-text-main hover:bg-bg'}`}>
                    {slot}
                  </button>
                ))}
              </div>

              {/* Airlines */}
              {airlines.length > 0 && (
                <div>
                  <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Airlines</p>
                  {airlines.map(name => (
                    <label key={name} className="flex items-center gap-2 font-sans text-sm text-text-main py-1 cursor-pointer hover:text-primary">
                      <input type="checkbox" checked={filterAirlines.includes(name)}
                        onChange={() => toggleAirline(name)}
                        className="accent-accent rounded" />
                      {name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            {!loading && allFlights.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="font-sans text-sm text-muted mr-2">{filtered.length} results</span>
                {SORT_OPTIONS.map(s => (
                  <button key={s} onClick={() => setSort(s)}
                    className={`font-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${sort === s ? 'bg-primary text-white' : 'bg-surface border border-border text-muted hover:text-primary'}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-surface border border-border rounded-card p-10 text-center">
                <p className="font-display font-semibold text-primary text-lg mb-2">No flights found</p>
                <p className="font-sans text-sm text-muted">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(f => <FlightCard key={f.id} flight={f} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
