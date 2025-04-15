export interface IUpdateAdminProfileReqBody {
  name?: string;
  gender?: string;
  two_fa?: boolean;
  phone_number?: string;
}

export interface IAdminChangePassReqBody {
  old_password: string;
  new_password: string;
}
