export interface IGetSubAgentLoanHistoryQuery {
  type?: "Given" | "Taken";
  limit?: string;
  skip?: string;
  from_date?: string;
  to_date?: string;
}

export interface IGetSubAgentLedgerHistoryQuery {
  from_date?: string;
  to_date?: string;
  voucher_no?: string;
  limit?: string;
  skip?: string;
}

export interface ISubAgentCreateDepositPayload {
  account_id: number;
  amount: number;
  remarks?: string;
  payment_date: Date;
}
