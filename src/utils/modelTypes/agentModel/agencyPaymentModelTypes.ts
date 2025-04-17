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
}
