import {
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
  SOURCE_B2C,
  SOURCE_SUB_AGENT,
} from '../../miscellaneous/constants';

export interface IInsertUmrahBookingPayload {
  booking_ref: string;
  umrah_id: number;
  source_type:
    | typeof SOURCE_AGENT
    | typeof SOURCE_B2C
    | typeof SOURCE_SUB_AGENT
    | typeof SOURCE_AGENT_B2C;
  source_id: number;
  user_id: number;
  traveler_adult: number;
  traveler_child: number;
  per_child_price: number;
  per_adult_price: number;
  total_price: number;
  note_from_customer?: string | null;
}

export interface IInsertUmrahBookingContact {
  booking_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}
export interface IGetUmrahBookingContactData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface IUpdateUmrahBookingPayload {
  status: string;
}

export interface IGetUmrahBookingListQuery {
  agency_id: number;
  user_id?: number;
  from_date?: string;
  status?: string;
  to_date?: string;
  limit?: string;
  skip?: string;
}

export interface IGetAgentB2CSingleUmrahBookingQuery {
  id: number;
  source_id: number;
  user_id?: number;
}

export interface IGetAgentB2CUmrahBookingListData {
  id: number;
  booking_ref: string;
  umrah_id: number;
  umrah_title: string;
  umrah_short_description: string;
  status: string;
  user_id: number;
  user_name: string;
  traveler_adult: number;
  traveler_child: number;
  total_price: string;
  created_at: string;
  note_from_customer: string;
}

export interface IGetSingleAgentB2CUmrahBookingData {
  id: number;
  booking_ref: string;
  umrah_id: number;
  umrah_title: string;
  umrah_short_description: string;
  traveler_adult: number;
  traveler_child: number;
  per_adult_price: string;
  per_child_price: string;
  status: string;
  total_price: string;
  created_at: string;
  note_from_customer: string;
}
