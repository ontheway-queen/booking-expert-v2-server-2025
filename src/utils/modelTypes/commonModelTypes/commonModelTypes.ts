export interface OTPType {
  type: string;
}
export interface IInsertOTPPayload extends OTPType {
  hashed_otp: string;
  email?: string;
  agency_id?: number;
}

export interface IGetOTPPayload extends OTPType {
  email: string;
  agency_id?: number;
}

export interface ICreateAirportPayload {
  country_id: number;
  name: string;
  iata_code: string;
  city?: number;
}

export interface IUpdateAirportPayload {
  country_id?: number;
  name?: string;
  iata_code?: string;
  city?: number;
}

export interface ICreateAirlinesPayload {
  code: string;
  name: string;
  logo: string;
}
export interface IUpdateAirlinesPayload {
  code?: string;
  name?: string;
  logo?: string;
}

export interface IAnnouncementBarPayload {
  message?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  link?: string;
  type?: 'B2B' | 'B2C';
}

export interface IInsertLastNoPayload {
  last_id: number;
  type:
    | 'Agent'
    | 'Agent_Flight'
    | 'Agent_Visa'
    | 'Agent_Tour'
    | 'Agent_Umrah'
    | 'Agent_GroupFare'
    | 'Agent_SupportTicket'
    | 'Agent_Hotel'
    | 'Agent_Deposit_Request'
    | 'Agent_B2C_SupportTicket'
    | 'B2C_Deposit_Request'
    | 'User_Flight'
    | 'User_Visa'
    | 'User_Tour'
    | 'User_Umrah'
    | 'User_SupportTicket'
    | 'ADM_Management'
    | 'Money_Receipt'
    | 'Invoice';
  last_updated: Date;
}

export interface IUpdateLastNoPayload {
  last_id: number;
  last_updated: Date;
}

export interface IGetLastIdParams {
  type:
    | 'Agent'
    | 'Agent_Flight'
    | 'Agent_Visa'
    | 'Agent_Tour'
    | 'Agent_Umrah'
    | 'Agent_GroupFare'
    | 'Agent_SupportTicket'
    | 'Agent_Hotel'
    | 'Agent_Deposit_Request'
    | 'Agent_B2C_SupportTicket'
    | 'B2C_Deposit_Request'
    | 'User_Flight'
    | 'User_Visa'
    | 'User_Tour'
    | 'User_Umrah'
    | 'User_SupportTicket'
    | 'ADM_Management'
    | 'Money_Receipt'
    | 'Invoice';
}

export interface IGetLastIdData {
  id: number;
  last_id: number;
}

export interface IInsertEmailSubscriberPayload {
  email: string;
  source: 'B2C' | 'AGENT B2C';
  agency_id?: number;
}
export interface IGetEmailSubscriberPayload {
  email?: string;
  source_type?: 'B2C' | 'AGENT B2C';
  agency_id?: number;
  from_date?: string;
  to_date?: string;
  limit?: string;
  skip?: string;
  with_total: boolean;
}
export interface IGetEmailSubscriberData {
  email: string;
  source_type: 'B2C' | 'AGENT B2C';
  agency_id?: number;
  created_at: string;
}

export interface IInsertBanks {
  name: string;
  type: 'Bank' | 'MFS';
  logo: string;
}
export interface IUpdateBankPayload {
  name?: string;
  type?: 'Bank' | 'MFS';
  logo?: string;
  status?: boolean;
}
export interface IGetBanksData {
  id: number;
  name: string;
  type: 'Bank' | 'MFS';
  logo: string;
  status: boolean;
}
