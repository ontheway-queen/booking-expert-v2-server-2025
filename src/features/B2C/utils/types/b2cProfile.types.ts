export interface IUpdateUserProfileReqBody {
  name?: string;
  gender?: string;
}

export interface IB2CUserChangePassReqBody {
  old_password: string;
  new_password: string;
}
