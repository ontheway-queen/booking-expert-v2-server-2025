export interface IGetAgentB2CSubLedgerHistoryQuery {
  user_id?: string;
  from_date?: string;
  to_date?: string;
  voucher_no?: string;
  limit?: string;
  skip?: string;
}

export interface IAdjustAgentB2CSubLedgerReqBody {
  amount: number;
  type: 'Debit' | 'Credit';
  details: string;
  voucher_no: string;
  payment_date: string;
  user_id: number;
}
