export interface ICTSearchLocationResponse {
  id: number;
  name: string;
  code: number;
  type: 'hotel' | 'city';
  city_code: string;
  country_code: string;
  country_name: string;
  rank: number;
}

export interface ICTGetBalanceResponse {
  balance: string;
  lend_balance: string;
}

export interface ICTHotelSearchPayload {
  client_nationality: string;
  checkin: string;
  checkout: string;
  code: number;
  destination: string;
  rooms: { adults: number; children_ages: number[] }[];
}

export interface ICTHotelSearchResponse {
  hotels: ICTHotelSearchResponseHotel[];
  no_of_nights: number;
  checkin: string;
  checkout: string;
  no_of_adults: number;
  no_of_hotels: number;
  no_of_rooms: number;
}

export interface ICTHotelSearchResponseHotel {
  search_id: string;
  hotel_code: string;
  acc_type: string;
  name: string;
  category: number;
  description: string;
  facilities: string;
  geolocation: {
    latitude: number;
    longitude: number;
  };
  images: {
    main_image: string;
    additional_images: {
      id: number;
      image_url: string;
      image_caption: string;
    }[];
  };
  contact_details: {
    email: string;
    phone: string;
    fax: string;
    website_url: string;
    address: string;
    city_code: string;
    country: string;
  };
  currency: string;
  price_details: {
    price: number;
    tax: number;
    total_price: number;
  };
  refundable: boolean;
  details: {
    group_code: string;
    boarding_details: string[];
    credit_deduction: string;
    has_promotions: boolean;
    includes_boarding: boolean;
    no_of_rooms: number;
    pan_required: boolean;
    payment_type: string[];
    promotions_details: string[];
    rate_comments: {
      pax_comments: string;
    };
    rate_key: string;
    rate_type: string;
    room_code: string;
    supports_amendment: boolean;
    supports_cancellation: boolean;
  };
  rooms: {
    children_ages: number[];
    description: string;
    no_of_adults: number;
    no_of_children: number;
    no_of_rooms: number;
    room_reference: string;
    room_type: string;
  }[];
  safe2stay: Record<string, unknown>; // Empty object or unknown structure
  supp_cards: string[];
}

// The response from the hotel rooms API ======START============================
export interface ICTHotelRoomsResponse {
  boarding_details: string[];
  credit_deduction: string;
  currency: string;
  group_code: string;
  has_promotions: boolean;
  includes_boarding: boolean;
  no_of_rooms: number;
  pan_required: boolean;
  payment_type: string[];
  rate_comments: RateComments;
  rate_key: string;
  rate_type: string;
  room_code: string;
  rooms: Room[];
  supports_amendment: boolean;
  supports_cancellation: boolean;
  refundable: boolean;
  cancellation_policy: CancellationPolicy;
  price_details: PriceDetails;
}

interface CancellationDetail {
  fee: number;
  from_date: string; // ISO date string
}

interface CancellationPolicy {
  no_show_fee: number;
  details: CancellationDetail[];
  free_cancellation: boolean;
  free_cancellation_last_date: string; // ISO date string
}

interface RateComments {
  pax_comments: string;
}

interface Room {
  children_ages: number[];
  description: string;
  no_of_adults: number;
  no_of_children: number;
  no_of_rooms: number;
  room_reference: string;
  room_type: string;
}

interface PriceDetails {
  price: number;
  tax: number;
  total_price: number;
}

// The response from the hotel rooms API ======END============================
