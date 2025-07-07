export type SourceType =
  | 'AGENT'
  | 'SUB AGENT'
  | 'AGENT B2C'
  | 'B2C'
  | 'EXTERNAL';
export type BookingStatus =
  | 'PENDING'
  | 'BOOKED'
  | 'VOIDED'
  | 'ON HOLD'
  | 'ISSUED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'REISSUED'
  | 'BOOKING IN PROCESS'
  | 'TICKET IN PROCESS';
export type MarkupType = 'INCREASE' | 'DECREASE';
export type JourneyType = 'ONE WAY' | 'ROUND TRIP' | 'MULTI CITY';
export type ActionUserType = SourceType | 'ADMIN';

export interface IInsertFlightBookingPayload {
  booking_ref: string;
  source_type: SourceType;
  source_id?: number;
  gds_pnr?: string | null;
  total_passenger: number;
  status?: BookingStatus;
  base_fare: number | string;
  tax: number | string;
  ait?: number | string;
  discount?: number | string;
  vendor_fare: string;
  payable_amount: number | string;
  agent_markup?: number;
  journey_type: JourneyType;
  refundable: boolean;
  api: string;
  api_booking_ref?: string | null;
  route: string;
  travel_date: Date | string;
  ticket_issue_last_time?: string | null;
  airline_pnr?: string | null;
  created_by: number;
}

export interface IGetFlightBookingListFilterQuery {
  status?: string;
  from_date?: string;
  to_date?: string;
  filter?: string;
  limit?: number;
  skip?: number;
  source_id?: number;
  booked_by: SourceType;
  created_by?: number;
}

export interface IGetSingleFlightBookingParams {
  id: number;
  booked_by: SourceType;
  agency_id?: number;
  user_id?: number;
}

export interface IGetFlightBookingList {
  id: number;
  booking_ref: string;
  source_type: SourceType;
  source_name: string;
  api: string;
  created_at: Date;
  travel_date: Date;
  gds_pnr: string | null;
  journey_type: JourneyType;
  passenger: number;
  status: BookingStatus;
  payable_amount: number;
  route: string;
}

export interface IGetSingleFlightBookingData {
  id: number;
  booking_ref: string;
  source_type: SourceType;
  source_id: number | null;
  source_name: string;
  source_logo: string | null;
  source_email: string;
  gds_pnr: string | null;
  total_passenger: number;
  status: BookingStatus;
  base_fare: number;
  tax: number;
  ait: number;
  ticket_price: number;
  markup_price: number;
  markup_type: JourneyType | null;
  payable_amount: number;
  agent_markup: number | null;
  journey_type: JourneyType;
  refundable: boolean;
  api: string;
  api_booking_ref: string | null;
  route: string;
  travel_date: Date;
  ticket_issue_last_time: string | null;
  airline_pnr: string | null;
  created_by: number;
  created_by_user_name: string;
  cancelled_at: Date | null;
  issued_at: Date | null;
  created_at: Date;
}

export interface IUpdateFlightBookingPayload {
  status?: BookingStatus;
  cancelled_by_type?: ActionUserType;
  cancelled_by_user_id?: number;
  cancelled_at?: Date;
  issued_by_type?: ActionUserType;
  issued_by_user_id?: number;
  issued_at?: Date;
  api?: string;
  gds_pnr?: string;
  ticket_issue_last_time?: Date;
  airline_pnr?: string;
}

interface IBookingCheckPassenger {
  first_name: string;
  last_name: string;
  passport?: string;
  email?: string;
  phone?: string;
}

export interface IFlightBookingCheckPayload {
  route: string;
  departure_date: string | Date;
  flight_number: string;
  passengers: IBookingCheckPassenger[];
  status: string | string[];
}
