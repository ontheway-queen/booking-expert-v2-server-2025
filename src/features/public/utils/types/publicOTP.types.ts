export interface ISendEmailOTPReqBody {
  email: string;
  type: string;
  logo?: string;
  name?: string;
}

export interface IMatchOTPReqBody {
  email: string;
  otp: string;
  type: string;
}
