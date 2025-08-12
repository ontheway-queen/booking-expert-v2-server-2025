import {
  DEPOSIT_STATUS_APPROVED,
  DEPOSIT_STATUS_CANCELLED,
  DEPOSIT_STATUS_PENDING,
  DEPOSIT_STATUS_REJECTED,
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
  SOURCE_SUB_AGENT,
} from '../../miscellaneous/constants';

type deposit_status =
  | typeof DEPOSIT_STATUS_PENDING
  | typeof DEPOSIT_STATUS_APPROVED
  | typeof DEPOSIT_STATUS_CANCELLED
  | typeof DEPOSIT_STATUS_REJECTED;

type source_type =
  | typeof SOURCE_AGENT_B2C
  | typeof SOURCE_SUB_AGENT
  | typeof SOURCE_AGENT;

export interface ICreateDepositRequestPayload {
  agency_id: number;
  source: source_type;
  request_no: string;
  account_id: number;
  amount: number;
  remarks?: string;
  payment_date: Date;
  docs: string;
  created_by: number;
}

export interface IUpdateDepositRequestPayload {
  status?: deposit_status;
  updated_by?: number;
  updated_at?: Date;
  update_note?: string;
}

export interface IGetAgentDepositRequestData {
  id: number;
  agency_id: number;
  bank_name: string;
  bank_logo: string;
  amount: number;
  agency_name: string;
  agency_logo: string;
  request_no: string;
  status: deposit_status;
  payment_date: Date;
  created_at: Date;
}

export interface IGetSingleAgentDepositRequestData {
  id: number;
  agency_id: number;
  agency_name: string;
  agency_logo: string;
  request_no: string;
  bank_name: string;
  amount: number;
  remarks: string | null;
  status: deposit_status;
  payment_date: Date;
  created_at: Date;
  docs: string;
  created_by: number;
  created_by_name: string;
  updated_by?: string;
  updated_by_name?: string;
  updated_at?: string;
  update_note?: string;
}

export interface IGetAgentB2CDepositRequestData {
  id: number;
  created_by: number;
  created_by_name: string;
  request_no: string;
  amount: number;
  status: deposit_status;
  payment_date: string;
  created_at: string;
}

export interface IGetSingleAgentB2CDepositRequestData {
  id: number;
  request_no: string;
  bank_name: string;
  amount: number;
  remarks: string | null;
  status: deposit_status;
  payment_date: Date;
  created_at: Date;
  docs: string;
  created_by: number;
  created_by_name: string;
  updated_by?: string;
  updated_by_name?: string;
  updated_at?: string;
  update_note?: string;
}

export interface IGetDepositRequestListFilterQuery {
  agency_id?: number;
  status?: deposit_status;
  from_date?: Date;
  to_date?: Date;
  limit?: number;
  skip?: number;
  filter?: string;
  created_by?: number;
}
