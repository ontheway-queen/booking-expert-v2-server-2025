export interface IInsertAgencyLedgerReqBody {
  agency_id: number;
  type: 'Debit' | 'Credit';
  amount: number;
  details: string;
  ledger_date: string;
}
