export interface ISendEmailOTPReqBody {
  email: string;
  type: string;
}

export interface IMatchOTPReqBody {
  email: string;
  otp: string;
  type: string;
}
