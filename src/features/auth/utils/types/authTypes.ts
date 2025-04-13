export interface ILoginReqBody {
  user_or_email: string;
  password: string;
}

export interface IResetPassReqBody {
  token: string;
  password: string;
}

export interface ILogin2FAReqBody {
  otp: string;
  email: string;
}

export interface IRegisterAgentReqBody {
  user_name: string;
  agency_name: string;
  address: string;
  phone: string;
  email: string;
}
