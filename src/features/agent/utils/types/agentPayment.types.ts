export interface IGetAgentLoanHistoryQuery {
    type?: 'Given' | 'Taken';
    limit?: string;
    skip?: string;
    from_date?: string;
    to_date?: string;
  }

export interface IGetAgentLedgerHistoryQuery {
    from_date?: string;
    to_date?: string;
    voucher_no?: string;
    limit?: string;
    skip?: string;
}

export interface ICreateDepositPayload {
    bank_name: string;
    amount: number;
    remarks?: string;
    payment_date: Date;
}

export interface ITopUpUsingPaymentGatewayReqBody {
    amount: number;
    currency: string;
    payment_gateway: string;
    success_page: string;
    failed_page: string;
    cancelled_page: string;
    is_app?: boolean;
}