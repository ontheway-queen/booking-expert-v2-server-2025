export interface ICreateLoanReqBody {
  agency_id: number;
  amount: number;
  type: 'Given' | 'Taken';
  details: string;
}

export interface IGetLoanHistoryQuery {
  type?: 'Given' | 'Taken';
  agency_id?: string;
  limit?: string;
  skip?: string;
  from_date?: string;
  to_date?: string;
}
