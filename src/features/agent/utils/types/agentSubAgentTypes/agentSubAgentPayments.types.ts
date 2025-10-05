export interface IGetAgentSubAgentLedgerHistoryQuery {
  agency_id?: number;
  from_date?: string;
  to_date?: string;
  voucher_no?: string;
  limit?: string;
  skip?: string;
}

export interface IAdjustAgentSubAgentLedgerReqBody {
  amount: number;
  type: 'Debit' | 'Credit';
  details: string;
  voucher_no: string;
  payment_date: string;
  agency_id: number;
}
