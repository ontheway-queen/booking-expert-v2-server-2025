export interface IUpdateBankAccountReqBody {
  account_name?: string;
  account_number?: string;
  branch?: string; // Nullable
  routing_no?: string; // Nullable
  swift_code?: string; // Nullable
  status?: boolean;
}
export interface ICreateBankAccountReqBody {
  bank_id: number;
  account_name: string;
  account_number: string;
  branch?: string;
  routing_no?: string;
  swift_code?: string;
}
export interface IUpSertPopUpBannerReqBody {
  title?: string;
  pop_up_for: "AGENT" | "B2C";
  status?: boolean;
  description?: string;
  link?: string;
}
