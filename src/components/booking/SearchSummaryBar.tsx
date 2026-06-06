import { Plane, Hotel, Edit2 } from 'lucide-react';

interface FlightSummary {
  type: 'flight';
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  cabin: string;
  tripType: string;
}

interface HotelSummary {
  type: 'hotel';
  destination: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
}

type SummaryProps = (FlightSummary | HotelSummary) & { onEdit: () => void };

function fmtDate(d: string): string {
  if (!d) return '';
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SearchSummaryBar(props: SummaryProps) {
  if (props.type === 'flight') {
    const { from, to, departDate, returnDate, passengers, cabin, tripType } = props;
    return (
      <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
        <Plane size={16} className="text-accent shrink-0" />
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <span className="font-display font-semibold text-primary text-sm">{from} → {to}</span>
          <span className="font-mono text-xs text-muted">·</span>
          <span className="font-sans text-sm text-muted">{fmtDate(departDate)}</span>
          {tripType === 'roundtrip' && returnDate && (
            <>
              <span className="font-mono text-xs text-muted">–</span>
              <span className="font-sans text-sm text-muted">{fmtDate(returnDate)}</span>
            </>
          )}
          <span className="font-mono text-xs text-muted">·</span>
          <span className="font-sans text-sm text-muted">{passengers} {passengers === 1 ? 'passenger' : 'passengers'}</span>
          <span className="font-mono text-xs text-muted">·</span>
          <span className="font-sans text-sm text-muted">{cabin}</span>
        </div>
        <button
          onClick={props.onEdit}
          className="flex items-center gap-1.5 font-sans text-xs font-semibold text-accent hover:text-accent-dark transition-colors shrink-0"
        >
          <Edit2 size={13} />
          Edit
        </button>
      </div>
    );
  }

  const { destination, checkIn, checkOut, rooms, guests } = props;
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
      <Hotel size={16} className="text-accent shrink-0" />
      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
        <span className="font-display font-semibold text-primary text-sm">{destination}</span>
        <span className="font-mono text-xs text-muted">·</span>
        <span className="font-sans text-sm text-muted">{fmtDate(checkIn)} – {fmtDate(checkOut)}</span>
        <span className="font-mono text-xs text-muted">·</span>
        <span className="font-sans text-sm text-muted">{rooms} {rooms === 1 ? 'room' : 'rooms'}, {guests} {guests === 1 ? 'guest' : 'guests'}</span>
      </div>
      <button
        onClick={props.onEdit}
        className="flex items-center gap-1.5 font-sans text-xs font-semibold text-accent hover:text-accent-dark transition-colors shrink-0"
      >
        <Edit2 size={13} />
        Edit
      </button>
    </div>
  );
}
