export interface MockHotel {
  id: string;
  name: string;
  starRating: number;
  reviewScore: number;
  reviewCount: number;
  pricePerNight: number;
  distanceFromCenter: string;
  amenities: string[];
  neighbourhood: string;
  address: string;
  imageColor: string;
  roomType: string;
  cancellationPolicy: 'Free cancellation' | 'Non-refundable';
}

const HOTEL_BRANDS = [
  'Grand Hyatt', 'JW Marriott', 'Hilton', 'Westin', 'Sheraton',
  'InterContinental', 'Radisson Blu', 'Novotel', 'Sofitel', 'Pullman',
  'Le Méridien', 'W Hotel', 'Mövenpick', 'Crowne Plaza', 'Four Seasons',
  'Ritz-Carlton', 'St. Regis', 'Conrad', 'Renaissance', 'Kempinski',
];

const ROOM_TYPES = [
  'Deluxe Double', 'Superior King', 'Deluxe Twin', 'Junior Suite',
  'Club Room', 'Premier Room', 'Comfort Suite', 'Superior Queen',
];

const NEIGHBOURHOODS: Record<string, string[]> = {
  dubai: ['Downtown Dubai', 'Dubai Marina', 'Deira', 'Business Bay', 'Jumeirah', 'DIFC'],
  london: ['Mayfair', 'Kensington', 'City of London', 'Canary Wharf', 'Chelsea', 'Paddington'],
  paris: ['Le Marais', '8th Arrondissement', 'Saint-Germain', 'Montmartre', 'Opéra'],
  tokyo: ['Shinjuku', 'Shibuya', 'Ginza', 'Asakusa', 'Roppongi', 'Marunouchi'],
  singapore: ['Marina Bay', 'Orchard Road', 'Clarke Quay', 'Sentosa', 'Chinatown'],
  bangkok: ['Sukhumvit', 'Silom', 'Riverside', 'Siam', 'Old Town'],
  istanbul: ['Sultanahmet', 'Beyoğlu', 'Beşiktaş', 'Kadıköy', 'Levent'],
  new_york: ['Midtown', 'Lower Manhattan', 'Tribeca', 'Chelsea', 'Upper West Side'],
  barcelona: ['Eixample', 'Gothic Quarter', 'Barceloneta', 'Gràcia', 'Born'],
};

const GENERIC_NEIGHBOURHOODS = [
  'City Centre', 'Old Town', 'Business District', 'Waterfront',
  'Downtown', 'Airport Area', 'Financial District', 'Marina',
];

const AMENITIES_POOL = [
  'Free Wi-Fi', 'Pool', 'Gym', 'Breakfast included', 'Spa',
  'Parking', 'Restaurant', 'Bar', 'Room service', 'Airport shuttle',
  'Concierge', 'Business centre',
];

const HOTEL_COLORS = [
  '#B8CDD9', '#D4B896', '#A8C4B8', '#C4A8B8', '#B8B4A8',
  '#9AB8C4', '#C4BCA8', '#B4C4A8', '#C4A8A8', '#D4C4A8',
  '#A8C4D4', '#C8D4B8',
];

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

function pickItems<T>(rand: () => number, pool: T[], count: number): T[] {
  const arr = [...pool];
  const result: T[] = [];
  for (let i = 0; i < count && arr.length > 0; i++) {
    const idx = Math.floor(rand() * arr.length);
    result.push(arr.splice(idx, 1)[0]);
  }
  return result;
}

export function generateHotels(city: string): MockHotel[] {
  const rand = seededRandom(city.toLowerCase());
  const count = 8 + Math.floor(rand() * 5);
  const cityKey = city.toLowerCase().replace(/\s+/g, '_');
  const neighbourhoods = NEIGHBOURHOODS[cityKey] ?? GENERIC_NEIGHBOURHOODS;

  return Array.from({ length: count }, (_, i) => {
    const stars = 3 + Math.floor(rand() * 3);
    const brandIdx = Math.floor(rand() * HOTEL_BRANDS.length);
    const brand = HOTEL_BRANDS[brandIdx];
    const neighbourhood = neighbourhoods[Math.floor(rand() * neighbourhoods.length)];
    const basePrice = stars === 5 ? 250 + Math.floor(rand() * 350)
      : stars === 4 ? 120 + Math.floor(rand() * 180)
      : 60 + Math.floor(rand() * 90);
    const priceVariance = 0.9 + rand() * 0.25;
    const pricePerNight = Math.round(basePrice * priceVariance);
    const reviewBase = stars === 5 ? 8.0 : stars === 4 ? 7.2 : 6.5;
    const reviewScore = Math.round((reviewBase + rand() * 1.8) * 10) / 10;
    const reviewCount = 200 + Math.floor(rand() * 5800);
    const distKm = (0.2 + rand() * 4.8).toFixed(1);
    const amenities = pickItems(rand, AMENITIES_POOL, 4 + Math.floor(rand() * 4));
    const imageColor = HOTEL_COLORS[Math.floor(rand() * HOTEL_COLORS.length)];
    const roomType = ROOM_TYPES[Math.floor(rand() * ROOM_TYPES.length)];
    const isFree = rand() > 0.4;

    return {
      id: `${cityKey}-hotel-${i}`,
      name: `${brand} ${city.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}`,
      starRating: stars,
      reviewScore: Math.min(reviewScore, 9.8),
      reviewCount,
      pricePerNight,
      distanceFromCenter: `${distKm} km from centre`,
      amenities,
      neighbourhood,
      address: `${neighbourhood}, ${city}`,
      imageColor,
      roomType,
      cancellationPolicy: isFree ? 'Free cancellation' : 'Non-refundable',
    };
  });
}
