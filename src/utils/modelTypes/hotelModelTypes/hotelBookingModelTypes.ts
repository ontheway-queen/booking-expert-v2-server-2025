import {
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
  SOURCE_B2C,
  SOURCE_EXTERNAL,
  SOURCE_SUB_AGENT,
} from '../../miscellaneous/constants';

export interface IInsertHotelBookingPayload {
  booking_ref: string;
  search_id: string;
  hotel_code: number;
  hotel_name: string;
  checkin_date: string;
  checkout_date: string;
  supplier: 'CT';
  source_type:
    | 'AGENT'
    | 'SUB AGENT'
    | 'AGENT B2C'
    | 'B2C'
    | 'EXTERNAL'
    | 'ADMIN';
  source_id: number;
  created_by: number;
  holder: string;
  supplier_price: string;
  sell_price: string;
  supplier_cancellation_data?: string;
  confirmation_no?: string;
  supplier_ref: string;
  refundable: boolean;
  free_cancellation?: boolean;
  free_cancellation_last_date?: string;
  agent_sell_price?: string;
  hotel_extra_charges?: string;
  status: string;
  hotel_data: string;
  city_code: number;
  city_country_name: string;
  finalized?: boolean;
  rooms?: string;
}

export interface IInsertHotelBookingTravelerPayload {
  booking_id: number;
  room: number;
  type: string;
  title: string;
  name: string;
  surname: string;
  id_file?: string;
}

export interface IGetBookingModelQuery {
  from_date?: string;
  to_date?: string;
  filter?: string;
  limit?: string;
  skip?: string;
  source_type:
    | typeof SOURCE_AGENT
    | typeof SOURCE_B2C
    | typeof SOURCE_EXTERNAL
    | typeof SOURCE_SUB_AGENT
    | typeof SOURCE_AGENT_B2C
    | 'ALL';
  source_id?: number;
  user_id?: number;
}
export interface IGetBookingModelData {
  data: {
    id: number;
    booking_ref: string;
    hotel_code: number;
    sell_price: string;
    checkin_date: string;
    checkout_date: string;
    status: string;
    finalized: boolean;
    created_at: string;
  }[];
  total?: number;
}

export interface IGetSingleBookingModelData {
  id: number;
  booking_ref: string;
  hotel_code: number;
  sell_price: string;
  checkin_date: string;
  checkout_date: string;
  status: string;
  finalized: boolean;
  created_at: string;
}

export interface IInsertHotelBookingCancellationPayload {
  booking_id: number;
  from_date: string;
  fee: number;
}
