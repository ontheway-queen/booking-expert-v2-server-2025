export interface IInsertAgencyB2CLedgerPayload {
  agency_id: number;
  user_id: number;
  type: 'Debit' | 'Credit';
  amount: number;
  details: string;
  voucher_no: string;
}

export interface IGetAgencyB2CLedgerQuery {
  type?: 'Debit' | 'Credit';
  voucher_no?: string;
  agency_id: number;
  user_id: number;
  from_date?: string;
  to_date?: string;
  limit?: string;
  skip?: string;
}

export interface IGetAgencyB2CLedgerData {
  id: number;
  amount: string;
  details: string;
  ledger_date: string;
  created_at: string;
  type: 'Debit' | 'Credit';
  voucher_no: string;
  agency_id: number;
  user_id: number;
  user_name: string;
  agency_name: string;
  agency_logo: string;
}
