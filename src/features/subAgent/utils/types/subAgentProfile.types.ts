export interface IUpdateSubAgentProfileReqBody {
  name?: string;
  two_fa?: boolean;
  phone_number?: string;
  gender?: string;
}

export interface ISubAgencyUserChangePassReqBody {
  old_password: string;
  new_password: string;
}
