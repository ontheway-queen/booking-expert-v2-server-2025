import { SOURCE_ADMIN, SOURCE_AGENT } from '../../miscellaneous/constants';

export interface IInsertHotelSearchHistoryPayload {
  user_type: 'Agent' | 'B2C' | 'Agent B2C' | 'Admin';
  check_in_date: string;
  check_out_date: string;
  guest_n_rooms: string;
  destination_type: 'Hotel' | 'City';
  user_id?: number;
  code: number;
  agency_id?: number;
  nationality?: string;
  name?: string;
}

export interface IGetHotelSearchHistoryQuery {
  limit?: string;
  skip?: string;
  user_type?: 'Agent' | 'B2C' | 'Agent B2C' | 'Admin' | 'All';
  agency_id?: number;
  user_id?: number;
  from_date?: string;
  to_date?: string;
}

export interface IGetHotelSearchHistoryData {
  id: number;
  name: string;
  code: number;
  nationality: string;
  check_in_date: string;
  check_out_date: string;
  guest_n_rooms: {
    adults: number;
    children_ages?: number[];
  }[];
  destination_type: string;
  created_at: string;
}

export interface ICreateBankAccountPayload {
  bank_id: number;
  account_name: string;
  account_number: string;
  branch?: string; // Nullable
  source_type?: 'ADMIN' | 'AGENT';
  source_id?: number; // Nullable
  routing_no?: string; // Nullable
  swift_code?: string; // Nullable
}
export interface IGetBankAccountData {
  id: number;
  bank_name: string;
  bank_type: string;
  bank_logo: string;
  account_name: string;
  account_number: string;
  branch: string;
  routing_no: string;
  swift_code: string;
  status: boolean;
}
export interface IGetBankAccountQuery {
  source_type: typeof SOURCE_ADMIN | typeof SOURCE_AGENT;
  source_id?: number;
  status?: boolean;
  filter?: string;
}
