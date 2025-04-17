export interface IUpdateAgentProfileReqBody {
  name?: string;
  two_fa?: boolean;
  phone_number?: string;
  gender?: string;
}

export interface IAgencyUserChangePassReqBody {
  old_password: string;
  new_password: string;
}
