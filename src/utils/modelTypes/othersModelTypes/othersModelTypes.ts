import {
  SOURCE_ADMIN,
  SOURCE_AGENT,
  TYPE_EMAIL_SERVER_CPANEL,
  TYPE_EMAIL_SERVER_GMAIL,
  TYPE_EMAIL_SERVER_HOSTINGER,
  TYPE_EMAIL_SERVER_NAMECHEAP,
  TYPE_EMAIL_SERVER_OTHER,
  TYPE_EMAIL_SERVER_ZOHO,
} from '../../miscellaneous/constants';

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
  bank_id: number;
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
  limit?: string;
  skip?: string;
}

export interface IUpdateBankAccountPayload {
  account_name?: string;
  account_number?: string;
  branch?: string; // Nullable
  routing_no?: string; // Nullable
  swift_code?: string; // Nullable
  status?: boolean;
}

export type email_server_type =
  | typeof TYPE_EMAIL_SERVER_GMAIL
  | typeof TYPE_EMAIL_SERVER_HOSTINGER
  | typeof TYPE_EMAIL_SERVER_NAMECHEAP
  | typeof TYPE_EMAIL_SERVER_ZOHO
  | typeof TYPE_EMAIL_SERVER_CPANEL
  | typeof TYPE_EMAIL_SERVER_OTHER;

export interface ICreateEmailCredPayload {
  type: email_server_type;
  agency_id: number;
  email: string;
  password: string;
  host?: string;
  port?: string;
}
export interface IUpdateEmailCredPayload {
  type?: email_server_type;
  email?: string;
  password?: string;
  host?: string;
  port?: string;
}

export interface IGetEmailCredData {
  type: email_server_type;
  agency_id: number;
  email: string;
  password: string;
  host?: string;
  port?: number;
  status: boolean;
  created_at: string;
}
