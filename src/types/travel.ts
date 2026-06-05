export interface FlightResult {
  airline: string;
  airline_code: string;
  flight_number: string;
  from_airport: string;
  to_airport: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  stops: number;
  stop_city: string | null;
  price_usd: number;
  seat_class: string;
  seats_left: number;
}

export interface HotelResult {
  name: string;
  stars: number;
  rating: number;
  reviews_count: number;
  price_per_night_usd: number;
  total_price_usd: number;
  location: string;
  amenities: string[];
  highlights: string;
  booking_class: string;
}

export interface TravelSearchParams {
  type: 'flights' | 'hotels';
  city: string;
  // flights
  from?: string;
  depart_date?: string;
  return_date?: string;
  passengers?: number;
  seat_class?: string;
  // hotels
  check_in?: string;
  check_out?: string;
  guests?: number;
}

export interface TravelSearchResult {
  type: 'flights' | 'hotels';
  flights?: FlightResult[];
  hotels?: HotelResult[];
}
