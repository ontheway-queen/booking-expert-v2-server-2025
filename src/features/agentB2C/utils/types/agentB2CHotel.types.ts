export interface IAgentB2CHotelSearchReqBody {
  client_nationality: string;
  checkin: string;
  checkout: string;
  destination: 'City' | 'Hotel';
  code: number;
  name: string;
  rooms: { adults: number; children_ages: number[] }[];
}

export interface IAgentB2CHotelBookingReqBody {
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

export interface IAgentB2CGetHotelBookingQuery {
  limit?: string;
  skip?: string;
  filter?: string;
  from_date?: string;
  to_date?: string;
}
