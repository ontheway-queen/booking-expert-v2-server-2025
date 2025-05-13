import { DEPOSIT_STATUS_APPROVED, DEPOSIT_STATUS_CANCELLED, DEPOSIT_STATUS_PENDING, DEPOSIT_STATUS_REJECTED } from "../../miscellaneous/constants";

type deposit_status = typeof DEPOSIT_STATUS_PENDING | typeof DEPOSIT_STATUS_APPROVED | typeof DEPOSIT_STATUS_CANCELLED | typeof DEPOSIT_STATUS_REJECTED;

export interface IInsertAgencyLedgerPayload {
  agency_id: number;
  type: 'Debit' | 'Credit';
  amount: number;
  details: string;
  voucher_no: string;
}

export interface IGetAgencyLedgerQuery {
  type?: 'Debit' | 'Credit';
  voucher_no?: string;
  agency_id?: number;
  from_date?: string;
  to_date?: string;
  limit?: string;
  skip?: string;
}
export interface IGetAgencyLedgerData {
  id: number;
  amount: string;
  details: string;
  ledger_date: string;
  created_at: string;
  type: 'Debit' | 'Credit';
  voucher_no: string;
  agency_id: number;
  agency_name: string;
  agency_logo: string;
}
export interface IInsertAgentLoanHistoryPayload {
  agency_id: number;
  type: 'Given' | 'Taken';
  amount: number;
  details: string;
  created_by: number;
}

export interface IGetAgentLoanHistoryQuery {
  type?: 'Given' | 'Taken';
  agency_id?: number;
  from_date?: string;
  to_date?: string;
  limit?: string;
  skip?: string;
}
export interface IGetAgentLoanData {
  id: number;
  amount: string;
  details: string;
  ledger_date: string;
  created_at: string;
  type: 'Debit' | 'Credit';
  voucher_no: string;
  agency_id: number;
}

export interface ICreateDepositRequestPayload {
  agency_id: number;
  request_no: string;
  bank_name: string;
  amount: number;
  remarks?: string;
  payment_date: Date;
  docs: string;
  created_by: number;
}

export interface IUpdateDepositRequestPayload {
  status: deposit_status;
}

export interface IGetDepositRequestData {
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
}

export interface IGetDepositRequestListFilterQuery {
  agency_id?: number;
  status?: deposit_status;
  from_date?: Date;
  to_date?: Date;
  limit?: number;
  skip?: number;
  filter?: string;
}