type markup_type = 'PER' | 'FLAT';
type markup_mode = 'INCREASE' | 'DECREASE';
export interface ICreateAgencyPayload {
  agency_logo: string;
  agent_no: string;
  agency_name: string;
  email: string;
  phone: string;
  address: string;
  ref_agent_id?: number;
  agency_type: 'Agent' | 'Sub Agent';
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
  status: 'Pending' | 'Active' | 'Incomplete';
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
  status?: 'Pending' | 'Active' | 'Inactive' | 'Rejected' | 'Incomplete';
  flight_markup_set?: number;
  hotel_markup_set?: number;
  white_label?: boolean;
  allow_api?: boolean;
  usable_loan?: number;
}

export interface IGetAgencyListQuery {
  limit?: string;
  skip?: string;
  filter?: string;
  status?: 'Pending' | 'Active' | 'Inactive' | 'Rejected' | 'Incomplete';
  ref_id?: number;
  ref_agent_id?: number;
  agency_type?: 'Agent' | 'Sub Agent';
  order?: 'asc' | 'desc';
}
export interface IGetAgencyListWithBalanceQuery {
  limit?: string;
  skip?: string;
  search_value?: string;
  status?: string;
  ref_id?: number;
  ref_agent_id?: number;
  agency_type?: 'Agent' | 'Sub Agent';
}

export interface IGetAgencyListData {
  id: number;
  agent_no: string;
  agency_logo: string;
  agency_name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  white_label: boolean;
  allow_api: boolean;
  agency_type: 'Agent' | 'Sub Agent';
}

export interface IGetAgencyListWithBalanceData {
  id: number;
  agent_no: string;
  agency_logo: string;
  agency_name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  balance: number;
  usable_loan: number;
  white_label: boolean;
  allow_api: boolean;
  flight_markup_set: string;
  hotel_markup_set: string;
  agency_type: 'Agent' | 'Sub Agent';
}

export interface IGetSingleAgencyData {
  id: number;
  agent_no: string;
  agency_logo: string;
  agency_name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  usable_loan: number;
  balance: number;
  white_label: boolean;
  allow_api: boolean;
  flight_markup_set: string;
  hotel_markup_set: string;
  ref_id?: number;
  ref_agent_id?: number;
  agency_type: 'Agent' | 'Sub Agent';
  kam_id?: number;
  civil_aviation: string;
  referred_by: string;
  trade_license: string;
  national_id: string;
}

export interface ICheckAgencyQuery {
  agency_id?: number;
  email?: string;
  name?: string;
  agent_no?: string;
  status?: 'Pending' | 'Active' | 'Inactive' | 'Rejected' | 'Incomplete';
  ref_id?: number;
  ref_agent_id?: number;
  agency_type?: 'Agent' | 'Sub Agent';
}

export interface ICheckAgencyData {
  id: number;
  agent_no: string;
  agency_name: string;
  email: string;
  phone: string;
  status: string;
  agency_logo?: string;
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
  agency_type: 'Agent' | 'Sub Agent';
}

export interface ICreateWhiteLabelPermissionPayload {
  agency_id: number;
  token: string;
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
