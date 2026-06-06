export interface MockHotel {
  id: string;
  name: string;
  brand: string;
  starRating: number;
  reviewScore: number;
  reviewCount: number;
  pricePerNight: number;
  distanceFromCenter: string;
  amenities: string[];
  neighbourhood: string;
  address: string;
  imageUrl: string;
  brandColor: string;
  roomType: string;
  cancellationPolicy: 'Free cancellation' | 'Non-refundable';
}

const HOTEL_BRANDS = [
  'Grand Hyatt', 'JW Marriott', 'Hilton', 'Westin', 'Sheraton',
  'InterContinental', 'Radisson Blu', 'Novotel', 'Sofitel', 'Pullman',
  'Le Méridien', 'W Hotel', 'Mövenpick', 'Crowne Plaza', 'Four Seasons',
  'Ritz-Carlton', 'St. Regis', 'Conrad', 'Renaissance', 'Kempinski',
];

// Approximate real brand identity colours
const BRAND_COLORS: Record<string, string> = {
  'Grand Hyatt':      '#003580',
  'JW Marriott':      '#8B1A1A',
  'Hilton':           '#003087',
  'Westin':           '#1A5276',
  'Sheraton':         '#C8232C',
  'InterContinental': '#005596',
  'Radisson Blu':     '#002B5C',
  'Novotel':          '#004899',
  'Sofitel':          '#B8962E',
  'Pullman':          '#1B3A6B',
  'Le Méridien':      '#1D2A4A',
  'W Hotel':          '#1A1A1A',
  'Mövenpick':        '#C8792A',
  'Crowne Plaza':     '#004B87',
  'Four Seasons':     '#C9A84C',
  'Ritz-Carlton':     '#8B0000',
  'St. Regis':        '#1B3A6B',
  'Conrad':           '#2C5F8A',
  'Renaissance':      '#5C3317',
  'Kempinski':        '#002147',
};

// Curated Pexels photo IDs — hotel rooms, lobbies, pools (confirmed valid)
const HOTEL_PHOTO_IDS = [
  37748240,   // luxury hotel room — modern decor, abstract art
  5860693,    // hotel luxury room interior — Doha
  28247932,   // hotel room with gold accents
  37526148,   // luxurious modern hotel room — king bed
  16655683,   // interior design of hotel room — armchairs
  30898458,   // modern luxury hotel room in London
  33881123,   // outdoor hotel pool area
  4023386,    // hotel exterior with pool
  271624,     // classic hotel bed / room
  1579253,    // hotel room with large window
  262047,     // hotel bedroom — white bedding
  164595,     // bright hotel room interior
  279746,     // hotel bed close-up
  210604,     // hotel room — warm lighting
  2029719,    // hotel room — city view
  1838554,    // grand hotel lobby
  2631614,    // infinity pool at hotel
  1743231,    // resort pool with loungers
];

function pexelsUrl(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop`;
}

const ROOM_TYPES = [
  'Deluxe Double', 'Superior King', 'Deluxe Twin', 'Junior Suite',
  'Club Room', 'Premier Room', 'Comfort Suite', 'Superior Queen',
];

const NEIGHBOURHOODS: Record<string, string[]> = {
  dubai:        ['Downtown Dubai', 'Dubai Marina', 'Deira', 'Business Bay', 'Jumeirah', 'DIFC'],
  london:       ['Mayfair', 'Kensington', 'City of London', 'Canary Wharf', 'Chelsea', 'Paddington'],
  paris:        ['Le Marais', '8th Arrondissement', 'Saint-Germain', 'Montmartre', 'Opéra'],
  tokyo:        ['Shinjuku', 'Shibuya', 'Ginza', 'Asakusa', 'Roppongi', 'Marunouchi'],
  singapore:    ['Marina Bay', 'Orchard Road', 'Clarke Quay', 'Sentosa', 'Chinatown'],
  bangkok:      ['Sukhumvit', 'Silom', 'Riverside', 'Siam', 'Old Town'],
  istanbul:     ['Sultanahmet', 'Beyoğlu', 'Beşiktaş', 'Kadıköy', 'Levent'],
  new_york:     ['Midtown', 'Lower Manhattan', 'Tribeca', 'Chelsea', 'Upper West Side'],
  barcelona:    ['Eixample', 'Gothic Quarter', 'Barceloneta', 'Gràcia', 'Born'],
  nairobi:      ['Westlands', 'Karen', 'Kilimani', 'Upper Hill', 'CBD'],
  amsterdam:    ['Canal Ring', 'Museum Quarter', 'Jordaan', 'De Pijp', 'Leidseplein'],
  rome:         ['Trastevere', 'Vatican Area', 'Termini', 'Colosseum Area', 'Parioli'],
  sydney:       ['CBD', 'The Rocks', 'Darling Harbour', 'Bondi', 'Surry Hills'],
  'cape_town':  ['Waterfront', 'Gardens', 'Sea Point', 'Green Point', 'Bo-Kaap'],
};

const GENERIC_NEIGHBOURHOODS = [
  'City Centre', 'Old Town', 'Business District', 'Waterfront',
  'Downtown', 'Financial District', 'Marina', 'Historic Quarter',
];

const AMENITIES_POOL = [
  'Free Wi-Fi', 'Pool', 'Gym', 'Breakfast included', 'Spa',
  'Parking', 'Restaurant', 'Bar', 'Room service', 'Airport shuttle',
  'Concierge', 'Business centre',
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
  const cityDisplay = city.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

  return Array.from({ length: count }, (_, i) => {
    const stars = 3 + Math.floor(rand() * 3);
    const brand = HOTEL_BRANDS[Math.floor(rand() * HOTEL_BRANDS.length)];
    const neighbourhood = neighbourhoods[Math.floor(rand() * neighbourhoods.length)];
    const basePrice = stars === 5 ? 250 + Math.floor(rand() * 350)
      : stars === 4 ? 120 + Math.floor(rand() * 180)
      : 60 + Math.floor(rand() * 90);
    const pricePerNight = Math.round(basePrice * (0.9 + rand() * 0.25));
    const reviewBase = stars === 5 ? 8.0 : stars === 4 ? 7.2 : 6.5;
    const reviewScore = Math.min(Math.round((reviewBase + rand() * 1.8) * 10) / 10, 9.8);
    const reviewCount = 200 + Math.floor(rand() * 5800);
    const distKm = (0.2 + rand() * 4.8).toFixed(1);
    const amenities = pickItems(rand, AMENITIES_POOL, 4 + Math.floor(rand() * 4));
    const photoId = HOTEL_PHOTO_IDS[Math.floor(rand() * HOTEL_PHOTO_IDS.length)];
    const roomType = ROOM_TYPES[Math.floor(rand() * ROOM_TYPES.length)];
    const isFree = rand() > 0.4;

    return {
      id: `${cityKey}-hotel-${i}`,
      name: `${brand} ${cityDisplay}`,
      brand,
      starRating: stars,
      reviewScore,
      reviewCount,
      pricePerNight,
      distanceFromCenter: `${distKm} km from centre`,
      amenities,
      neighbourhood,
      address: `${neighbourhood}, ${cityDisplay}`,
      imageUrl: pexelsUrl(photoId),
      brandColor: BRAND_COLORS[brand] ?? '#1A3A4A',
      roomType,
      cancellationPolicy: isFree ? 'Free cancellation' : 'Non-refundable',
    };
  });
}
