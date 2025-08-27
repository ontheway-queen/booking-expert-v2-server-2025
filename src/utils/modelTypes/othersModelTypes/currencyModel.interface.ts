export interface ICreateCurrencyPayload {
  api_id: number;
  api_currency: string;
  currency_value: number;
  created_by: number;
  type: 'FLIGHT' | 'HOTEL';
}

export interface IUpdateCurrencyPayload {
  currency_value: number;
}
