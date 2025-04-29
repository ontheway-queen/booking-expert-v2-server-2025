export interface ICreateAgencyPayload {
  agency_logo: string;
  agent_no: string;
  agency_name: string;
  email: string;
  phone: string;
  address: string;
  national_id?: string;
  civil_aviation?: string;
  trade_license?: string;
  flight_markup_set?: number;
  hotel_markup_set?: number;
  created_by?: number;
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
  status?: string;
}
export interface IGetAgencyListWithBalanceQuery {
  limit?: string;
  skip?: string;
  search_value?: string;
  status?: string;
  ref_id?: number;
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
  ref_id: number;
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

export interface IGetWhiteLabelPermissionData {
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
