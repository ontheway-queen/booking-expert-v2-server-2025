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
  free_cancellation: boolean;
  free_cancellation_last_date?: string;
  agent_sell_price?: string;
  hotel_extra_charges?: string;
  paxes: string;
  status: string;
  hotel_data: string;
  city_code: number;
  city_country_name: string;
  finalized?: boolean;
}

export interface IInsertHotelBookingTravelerPayload {
  booking_id: number;
  room: number;
  type: string;
  title: string;
  surname: string;
  id_file?: string;
}
