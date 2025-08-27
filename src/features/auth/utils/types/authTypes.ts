import jwt from 'jsonwebtoken';

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
  user_or_email: string;
}

export interface IRegisterAgentReqBody {
  user_name: string;
  agency_name: string;
  address: string;
  phone: string;
  email: string;
}
export interface IRegisterSubAgentReqBody {
  user_name: string;
  agency_name: string;
  password: string;
  address: string;
  phone: string;
  email: string;
}

export interface IRegisterB2CReqBody {
  name: string;
  phone_number: string;
  email: string;
  gender: string;
}

export interface IRegisterAgentB2CReqBody {
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone_number: string;
  password: string;
}

export interface ICompleteAgencyRegisterParsedTokenData extends jwt.JwtPayload {
  email: string;
  agency_name: string;
  agency_id: number;
  user_id: number;
}

export interface ICompleteUserRegisterParsedTokenData extends jwt.JwtPayload {
  email: string;
  username: string;
  user_id: number;
  name: string;
}
