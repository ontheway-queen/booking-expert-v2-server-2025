export interface IAgentB2CPublicSendOTPReqBody {
  email: string;
  type: 'reset_agent_b2c' | 'register_agent_b2c';
}
export interface IAgentB2CPublicMatchOTPReqBody {
  email: string;
  otp: string;
  type: 'reset_agent_b2c' | 'register_agent_b2c';
}
