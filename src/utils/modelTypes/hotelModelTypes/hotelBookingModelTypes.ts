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
  supplier_ref?: string;
  refundable: boolean;
  free_cancellation?: boolean;
  free_cancellation_last_date?: string;
  hotel_extra_charges?: string;
  status: 'PENDING';
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
  hotel_name: string;
  checkin_date: string;
  checkout_date: string;
  supplier: string;
  source_type: string;
  agency_id: number | null;
  agency_name: string | null;
  created_by: number;
  created_by_name: string;
  created_at: string;
  holder: {
    title: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    client_nationality: string;
  };
  supplier_price: {
    price: number;
    tax: number;
    total_price: number;
  };
  sell_price: {
    price: number;
    tax: number;
    total_price: number;
  };
  confirmation_no?: string;
  supplier_ref?: string;
  refundable: boolean;
  free_cancellation?: boolean;
  hotel_extra_charges?: string;
  status: string;
  hotel_data: any;
  city_code: number;
  city_country_name: string;
  finalized: boolean;
  free_cancellation_last_date?: string;
  supplier_cancellation_data?: {
    no_show_fee: number;
    free_cancellation: boolean;
    free_cancellation_last_date?: string;
    free_cancellation_modified_last_date?: string;
    details: { fee: number; from_date: string }[];
  };
  search_id: string;
  rooms: string;
}

export interface IInsertHotelBookingCancellationPayload {
  booking_id: number;
  from_date: string;
  fee: number;
}
export interface IInsertHotelBookingModifiedAmountPayload {
  booking_id: number;
  markup?: number;
  discount?: number;
  agent_markup?: number;
  agent_discount?: number;
  cancel_markup?: number;
  cancel_discount?: number;
}

export interface IInsertHotelBookingModifiedAmountData {
  id: number;
  booking_id: number;
  markup?: string;
  discount?: string;
  agent_markup?: string;
  agent_discount?: string;
  cancel_markup?: string;
  cancel_discount?: string;
}
