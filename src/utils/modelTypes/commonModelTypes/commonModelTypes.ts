export interface OTPType {
  type: string;
}
export interface IInsertOTPPayload extends OTPType {
  hashed_otp: string;
  email?: string;
}

export interface IGetOTPPayload extends OTPType {
  email: string;
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
    | 'User_Flight'
    | 'User_Visa'
    | 'User_Tour'
    | 'User_Umrah'
    | 'User_SupportTicket';
  last_update: Date;
}

export interface IUpdateLastNoPayload {
  last_id: number;
  last_update: Date;
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
    | 'User_Flight'
    | 'User_Visa'
    | 'User_Tour'
    | 'User_Umrah'
    | 'User_SupportTicket';
}

export interface IGetLastIdData {
  id: number;
  last_id: number;
}
