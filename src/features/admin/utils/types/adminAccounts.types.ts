export interface IUpdateAdminAccountReqBody {
  account_name?: string;
  account_number?: string;
  branch?: string;
  routing_no?: string;
  swift_code?: string;
  status?: boolean;
}

export interface ICreateAdminAccountReqBody {
  bank_id: number;
  account_name: string;
  account_number: string;
  branch?: string;
  routing_no?: string;
  swift_code?: string;
}
