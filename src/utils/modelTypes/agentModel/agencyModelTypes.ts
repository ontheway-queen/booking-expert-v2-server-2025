import { SOURCE_AGENT, SOURCE_SUB_AGENT } from '../../miscellaneous/constants';

type markup_type = 'PER' | 'FLAT';
type markup_mode = 'INCREASE' | 'DECREASE';
type agency_status_type =
  | 'Pending'
  | 'Active'
  | 'Inactive'
  | 'Rejected'
  | 'Incomplete';
export interface ICreateAgencyPayload {
  agency_logo: string;
  agent_no: string;
  agency_name: string;
  email: string;
  phone: string;
  address: string;
  ref_agent_id?: number;
  agency_type: typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT;
  national_id?: string;
  civil_aviation?: string;
  trade_license?: string;
  flight_markup_set?: number;
  hotel_markup_set?: number;
  created_by?: number;
  kam_id?: number;
  ref_id?: number;
  white_label?: boolean;
  allow_api?: boolean;
  status: agency_status_type;
}

export interface IUpdateAgencyPayload {
  agency_logo?: string;
  civil_aviation?: string;
  trade_license?: string;
  national_id?: string;
  agency_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  kam_id?: number;
  ref_id?: number;
  status?: agency_status_type;
  flight_markup_set?: number;
  hotel_markup_set?: number;
  white_label?: boolean;
  allow_api?: boolean;
  usable_loan?: number;
  book_permission?: boolean;
}

export interface IGetAgencyListQuery {
  limit?: string;
  skip?: string;
  filter?: string;
  status?: agency_status_type;
  ref_id?: number;
  ref_agent_id?: number;
  agency_type?: typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT;
  order?: 'asc' | 'desc';
}
export interface IGetAgencyListWithBalanceQuery {
  limit?: string;
  skip?: string;
  search_value?: string;
  status?: agency_status_type;
  ref_id?: number;
  ref_agent_id?: number;
  agency_type?: typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT;
}

export interface IGetAgencyListData {
  id: number;
  agent_no: string;
  agency_logo: string;
  agency_name: string;
  email: string;
  phone: string;
  address: string;
  status: agency_status_type;
  white_label: boolean;
  allow_api: boolean;
  agency_type: typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT;
}

export interface IGetAgencyListWithBalanceData {
  id: number;
  agent_no: string;
  agency_logo: string;
  agency_name: string;
  email: string;
  phone: string;
  address: string;
  status: agency_status_type;
  balance: number;
  usable_loan: number;
  white_label: boolean;
  allow_api: boolean;
  flight_markup_set: string;
  hotel_markup_set: string;
  agency_type: typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT;
}

export interface IGetSingleAgencyData {
  id: number;
  agent_no: string;
  agency_logo: string;
  agency_name: string;
  email: string;
  phone: string;
  address: string;
  status: agency_status_type;
  usable_loan: number;
  balance: number;
  white_label: boolean;
  allow_api: boolean;
  flight_markup_set: string;
  hotel_markup_set: string;
  flight_markup_set_name: string;
  hotel_markup_set_name: string;
  ref_id?: number;
  ref_agent_id?: number;
  agency_type: typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT;
  kam_id?: number;
  civil_aviation: string;
  referred_by: string;
  trade_license: string;
  national_id: string;
  book_permission: boolean;
}

export interface ICheckAgencyQuery {
  agency_id?: number;
  email?: string;
  name?: string;
  agent_no?: string;
  status?: agency_status_type;
  ref_id?: number;
  ref_agent_id?: number;
  agency_type?: typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT;
}

export interface ICheckAgencyData {
  id: number;
  agent_no: string;
  agency_name: string;
  email: string;
  phone: string;
  status: agency_status_type;
  agency_logo: string;
  civil_aviation?: string;
  trade_license?: string;
  national_id?: string;
  white_label: boolean;
  allow_api: boolean;
  flight_markup_set: number;
  hotel_markup_set: number;
  usable_loan: number;
  kam_id?: number;
  address: string;
  ref_agent_id?: number;
  agency_type: typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT;
  book_permission: boolean;
}

export interface ICreateWhiteLabelPermissionPayload {
  agency_id: number;
  token: string;
  b2c_link?: string;
  b2b_link?: string;
  flight: boolean;
  hotel: boolean;
  visa: boolean;
  holiday: boolean;
  group_fare: boolean;
  umrah: boolean;
  blog: boolean;
}

export interface IUpdateWhiteLabelPermissionPayload {
  flight?: boolean;
  hotel?: boolean;
  visa?: boolean;
  holiday?: boolean;
  umrah?: boolean;
  group_fare?: boolean;
  blog?: boolean;
  token?: string;
  b2c_link?: string;
  b2b_link?: string;
}

export interface ICreateAgentB2CMarkupPayload {
  agency_id: number;
  flight_markup_type: markup_type;
  hotel_markup_type: markup_type;
  flight_markup_mode: markup_mode;
  hotel_markup_mode: markup_mode;
  flight_markup: number;
  hotel_markup: number;
}

export interface IUpdateAgentB2CMarkupPayload {
  flight_markup_type?: markup_type;
  hotel_markup_type?: markup_type;
  flight_markup_mode?: markup_mode;
  hotel_markup_mode?: markup_mode;
  flight_markup?: number;
  hotel_markup?: number;
}

export interface IGetAgentB2CMarkupData {
  agency_id: number;
  flight_markup_type: markup_type;
  hotel_markup_type: markup_type;
  flight_markup_mode: markup_mode;
  hotel_markup_mode: markup_mode;
  flight_markup: number;
  hotel_markup: number;
}

export interface IGetWhiteLabelPermissionData {
  agency_id: number;
  token: string;
  flight: boolean;
  hotel: boolean;
  visa: boolean;
  holiday: boolean;
  group_fare: boolean;
  umrah: boolean;
  blog: boolean;
  b2c_link: string | null;
  b2b_link: string | null;
}

export interface ICreateAPICredsPayload {
  agency_id: number;
  api_user: string;
  api_pass: string;
}
export interface IGetAPICredsData {
  agency_id: number;
  api_user: string;
  api_pass: string;
  last_access: string;
}
export interface IUpdateAPICredsPayload {
  api_pass?: string;
  last_access?: string;
}

export interface ICreateAgentAuditTrailPayload {
  agency_id: number;
  created_by: number;
  type: 'CREATE' | 'GET' | 'UPDATE' | 'DELETE';
  details: string;
  payload?: object | string;
}

export interface IGetAgentAuditTrailQuery {
  type?: 'CREATE' | 'GET' | 'UPDATE' | 'DELETE';
  created_by?: number;
  limit?: number;
  skip?: number;
  from_date?: string;
  to_date?: string;
}

export interface IGetAgentDashboardData {
  total_flight_booking: {
    total: string;
    total_expired: string;
    total_refunded: string;
    total_pending: string;
    total_cancelled: string;
    total_voided: string;
    total_issued: string;
    total_ticket_in_process: string;
    total_booking_in_process: string;
    total_booked: string;
  };
  total_hotel_booking: {
    total: string;
    total_cancelled: string;
    total_issued: string;
  };
  flight_booking_graph: {
    month_name: string;
    total: string;
    total_cancelled: string;
    total_issued: string;
  }[];
  hotel_booking_graph: {
    month_name: string;
    total: string;
    total_cancelled: string;
    total_issued: string;
  }[];
}

export interface ISearchAgentData {
  source: string;
  id: number;
  title: string;
  status: string;
  description: string;
}
