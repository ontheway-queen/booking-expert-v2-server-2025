import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { OTP_TYPES } from '../../../utils/miscellaneous/constants';
import CustomError from '../../../utils/lib/customError';

export default class PublicEmailOTPService extends AbstractServices {
  constructor() {
    super();
  }

  // send email otp service
  public async sendEmailOtp(req: Request) {
    const { email, type } = req.body;
    switch (type) {
      case OTP_TYPES.reset_admin:
        return await this.sendOTPAdminSubService({ email });
      case OTP_TYPES.verify_admin:
        return await this.sendOTPAdminSubService({ email });
      case OTP_TYPES.reset_agent:
        return await this.sendOTPAgentSubService({ email });
      case OTP_TYPES.verify_agent:
        return await this.sendOTPAgentSubService({ email });
      case OTP_TYPES.reset_b2c:
        return await this.sendOTPB2CSubService({ email });
      case OTP_TYPES.verify_b2c:
        return await this.sendOTPB2CSubService({ email });
      default:
        break;
    }
  }

  private async sendOTPAdminSubService({ email }: { email: string }) {}

  private async sendOTPAgentSubService({ email }: { email: string }) {}

  private async sendOTPB2CSubService({ email }: { email: string }) {}
}
