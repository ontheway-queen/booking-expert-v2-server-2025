export interface IInsertAgencyLedgerPayload {
  agency_id: number;
  type: 'Debit' | 'Credit';
  amount: number;
  details: string;
  voucher_no: string;
  ledger_date?: string;
}

export interface IGetAgencyLedgerQuery {
  type?: 'Debit' | 'Credit';
  voucher_no?: string;
  agency_id?: number;
  ref_agent_id?: number;
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
