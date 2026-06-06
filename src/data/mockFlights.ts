export interface MockFlight {
  id: string;
  airline: string;
  airlineCode: string;
  airlineColor: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  stopVia?: string;
  price: number;
  cabin: string;
  departureAirport: { iata: string; city: string };
  arrivalAirport: { iata: string; city: string };
  amenities: string[];
  baggageAllowance: string;
}

const AIRLINES = [
  { name: 'Emirates', code: 'EK', color: '#C60C30' },
  { name: 'Qatar Airways', code: 'QR', color: '#5C0632' },
  { name: 'Etihad Airways', code: 'EY', color: '#BD8B13' },
  { name: 'FlyDubai', code: 'FZ', color: '#FF6600' },
  { name: 'British Airways', code: 'BA', color: '#075AAA' },
  { name: 'Lufthansa', code: 'LH', color: '#05164D' },
  { name: 'Air France', code: 'AF', color: '#002157' },
  { name: 'Singapore Airlines', code: 'SQ', color: '#0066B3' },
  { name: 'Turkish Airlines', code: 'TK', color: '#C70A0A' },
  { name: 'KLM', code: 'KL', color: '#00A1DE' },
  { name: 'Swiss', code: 'LX', color: '#E4003A' },
  { name: 'Air Arabia', code: 'G9', color: '#E31837' },
];

const STOP_CITIES = ['DOH', 'DXB', 'AUH', 'IST', 'AMS', 'FRA', 'SIN', 'BKK', 'CDG', 'LHR'];

const AMENITIES_POOL = [
  'Wi-Fi', 'Meal included', 'USB charging', 'Power outlet',
  'In-flight entertainment', 'Extra legroom', 'Priority boarding',
];

const CABIN_MULTIPLIERS: Record<string, number> = {
  Economy: 1,
  'Premium Economy': 2.2,
  Business: 4.5,
  First: 7.8,
};

const BAGGAGE: Record<string, string> = {
  Economy: '23kg checked + 7kg cabin',
  'Premium Economy': '30kg checked + 10kg cabin',
  Business: '40kg checked + 15kg cabin',
  First: '50kg checked + 20kg cabin',
};

function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    return (h >>> 0) / 0xffffffff;
  };
}

function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return formatTime(Math.floor(total / 60) % 24, total % 60);
}

function pickAmenities(rand: () => number, count: number): string[] {
  const pool = [...AMENITIES_POOL];
  const result: string[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rand() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

export function generateFlights(
  fromIata: string,
  fromCity: string,
  toIata: string,
  toCity: string,
  cabin: string
): MockFlight[] {
  const rand = seededRandom(`${fromIata}-${toIata}-${cabin}`);
  const count = 8 + Math.floor(rand() * 5);
  const basePrice = 180 + Math.floor(rand() * 700);
  const multiplier = CABIN_MULTIPLIERS[cabin] ?? 1;

  return Array.from({ length: count }, (_, i) => {
    const airlineIdx = Math.floor(rand() * AIRLINES.length);
    const airline = AIRLINES[airlineIdx];
    const stopsRoll = rand();
    const stops = stopsRoll < 0.4 ? 0 : stopsRoll < 0.78 ? 1 : 2;
    const baseDuration = 90 + Math.floor(rand() * 580);
    const duration = baseDuration + stops * 85;
    const deptH = Math.floor(rand() * 24);
    const deptM = Math.floor(rand() * 4) * 15;
    const deptTime = formatTime(deptH, deptM);
    const arrTime = addMinutes(deptTime, duration);
    const priceVariance = 0.85 + rand() * 0.35;
    const price = Math.round(basePrice * multiplier * priceVariance * (1 + i * 0.04));
    const stopCity = STOP_CITIES[Math.floor(rand() * STOP_CITIES.length)];
    const amenities = pickAmenities(rand, 2 + Math.floor(rand() * 3));

    return {
      id: `${fromIata}-${toIata}-${i}`,
      airline: airline.name,
      airlineCode: airline.code,
      airlineColor: airline.color,
      flightNumber: `${airline.code}${100 + Math.floor(rand() * 900)}`,
      departureTime: deptTime,
      arrivalTime: arrTime,
      durationMinutes: duration,
      stops,
      stopVia: stops > 0 ? stopCity : undefined,
      price,
      cabin,
      departureAirport: { iata: fromIata, city: fromCity },
      arrivalAirport: { iata: toIata, city: toCity },
      amenities,
      baggageAllowance: BAGGAGE[cabin] ?? '23kg checked + 7kg cabin',
    };
  });
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
