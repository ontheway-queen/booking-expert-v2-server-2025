export interface ISendAgentB2CEmailOTPReqBody {
  email: string;
  type: string;
}

export interface IMatchAgentB2COTPReqBody {
  email: string;
  otp: string;
  type: string;
}