// The hotel rooms API ======START============================

export interface ICTGetBalanceResponse {
  balance: string;
  lend_balance: string;
}

export interface ICTHotelGetBalanceData {
  success: boolean;
  message: string;
  data?: ICTGetBalanceResponse;
}

export interface ICTHotelSearchLocationData {
  success: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    code: number;
    type: 'City' | 'Hotel';
    city_code: number;
    country_code: string;
    country_name: string;
    rank: number;
  }[];
}

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

// The hotel search API ======START============================

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

export interface ICTHotelSearchData {
  no_of_nights: number;
  checkin: string;
  checkout: string;
  no_of_adults: number;
  no_of_hotels: number;
  no_of_rooms: number;
  hotels: ICTHotelSearchResponseHotel[];
}

// The hotel search API ======END============================

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
  cancellation_policy: ICancellationPolicy;
  price_details: PriceDetails;
}

interface ICancellationDetail {
  fee: number;
  from_date: string; // ISO date string
}

export interface ICancellationPolicy {
  no_show_fee: number;
  details: ICancellationDetail[];
  free_cancellation: boolean;
  free_cancellation_last_date?: string; // ISO date string
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

// The response from the hotel room Recheck API ======START==========================
export interface ICTHotelRoomRecheckResponse {
  acc_type: string;
  category: number;
  name: string;
  hotel_code: string;
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
      hotel_code: number;
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
  safe2stay: Record<string, unknown>;
  supp_cards: string[];
  fee: {
    fee: number;
    total_tax: number;
    total_fee: number;
    currency: string;
  };
  agency_fee?: {
    fee: number;
    total_tax: number;
    total_fee: number;
    currency: string;
  };
  hotel_extra_charges: {
    total_payable_amount: number;
    payable_currency: string;
    charges_name: string[];
  };
  rates: {
    boarding_details: string[];
    credit_deduction: string;
    group_code: string;
    has_promotions: boolean;
    includes_boarding: boolean;
    no_of_rooms: number;
    pan_required: boolean;
    payment_type: string[];
    currency: string;
    price_details: {
      price: number;
      tax: number;
      total_price: number;
    };
    agency_price_details?: {
      price: number;
      tax: number;
      total_price: number;
    };
    payable_at_hotel: {
      currency: string;
      name: string[];
      total_amount: number;
    };
    refundable: boolean;
    cancellation_policy?: {
      no_show_fee: number;
      details: {
        fee: number;
        from_date: string;
      }[];
      free_cancellation: boolean;
      free_cancellation_last_date?: string;
    };
    rate_comments: {
      checkin_begin_time: string;
      checkin_end_time: string;
      checkout_time: string;
      comments: string;
      pax_comments: string;
    };
    rate_key: string;
    rate_type: string;
    room_code: string;
    rooms: {
      children_ages: number[];
      description: string;
      no_of_adults: number;
      no_of_children: number;
      no_of_rooms: number;
      room_reference: string;
      room_type: string;
    }[];
    supports_amendment: boolean;
    supports_cancellation: boolean;
  }[];
}

export interface ICTHotelRoomRecheckData {
  acc_type: string;
  category: number;
  name: string;
  hotel_code: string;
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
      hotel_code: number;
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
  safe2stay: Record<string, unknown>;
  supp_cards: string[];
  fee: {
    price: number;
    tax: number;
    total_price: number;
  };
  agency_fee?: {
    fee: number;
    total_tax: number;
    total_fee: number;
    currency: string;
  };
  hotel_extra_charges: {
    total_payable_amount: number;
    payable_currency: string;
    charges_name: string[];
  };
  rates: {
    boarding_details: string[];
    credit_deduction: string;
    group_code: string;
    has_promotions: boolean;
    includes_boarding: boolean;
    no_of_rooms: number;
    pan_required: boolean;
    payment_type: string[];
    currency: string;
    price_details: {
      price: number;
      tax: number;
      total_price: number;
    };
    agency_price_details?: {
      price: number;
      tax: number;
      total_price: number;
    };
    payable_at_hotel: {
      currency: string;
      name: string[];
      total_amount: number;
    };
    refundable: boolean;
    cancellation_policy?: {
      no_show_fee: number;
      details: {
        fee: number;
        from_date: string;
      }[];
      free_cancellation: boolean;
      free_cancellation_last_date?: string;
    };
    rate_comments: {
      checkin_begin_time: string;
      checkin_end_time: string;
      checkout_time: string;
      comments: string;
      pax_comments: string;
    };
    rate_key: string;
    rate_type: string;
    room_code: string;
    rooms: {
      children_ages: number[];
      description: string;
      no_of_adults: number;
      no_of_children: number;
      no_of_rooms: number;
      room_reference: string;
      room_type: string;
    }[];
    supports_amendment: boolean;
    supports_cancellation: boolean;
  }[];
  supplier_fee: {
    price: number;
    tax: number;
    total_price: number;
  };
  supplier_rates: {
    boarding_details: string[];
    credit_deduction: string;
    group_code: string;
    has_promotions: boolean;
    includes_boarding: boolean;
    no_of_rooms: number;
    pan_required: boolean;
    payment_type: string[];
    currency: string;
    price_details: {
      price: number;
      tax: number;
      total_price: number;
    };
    agency_price_details?: {
      price: number;
      tax: number;
      total_price: number;
    };
    payable_at_hotel: {
      currency: string;
      name: string[];
      total_amount: number;
    };
    refundable: boolean;
    cancellation_policy?: {
      no_show_fee: number;
      details: {
        fee: number;
        from_date: string;
      }[];
      free_cancellation: boolean;
      free_cancellation_last_date?: string;
    };
    rate_comments: {
      checkin_begin_time: string;
      checkin_end_time: string;
      checkout_time: string;
      comments: string;
      pax_comments: string;
    };
    rate_key: string;
    rate_type: string;
    room_code: string;
    rooms: {
      children_ages: number[];
      description: string;
      no_of_adults: number;
      no_of_children: number;
      no_of_rooms: number;
      room_reference: string;
      room_type: string;
    }[];
    supports_amendment: boolean;
    supports_cancellation: boolean;
  }[];
}

// The response from the hotel room Recheck API ======END============================

export interface ICTHotelBookingPayload {
  search_id: string;
  hotel_code: number;
  group_code: string;
  city_code: number;
  checkin: string;
  checkout: string;
  booking_comments: string;
  booking_items: {
    room_code: string;
    rate_key: string;
    rooms: {
      room_reference: string;
      paxes: {
        title: string;
        name: string;
        surname: string;
        type: string;
      }[];
    }[];
  }[];
  holder: {
    title: string;
    name: string;
    surname: string;
    email: string;
    phone_number: string;
    client_nationality: string;
  };
}
