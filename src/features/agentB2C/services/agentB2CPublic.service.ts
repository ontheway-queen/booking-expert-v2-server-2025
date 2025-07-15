import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import {
  OTP_EMAIL_SUBJECT,
  OTP_TYPES,
} from '../../../utils/miscellaneous/constants';
import Lib from '../../../utils/lib/lib';
import EmailSendLib from '../../../utils/lib/emailSendLib';
import { sendEmailOtpTemplate } from '../../../utils/templates/sendEmailOtpTemplate';
import {
  IAgentB2CPublicMatchOTPReqBody,
  IAgentB2CPublicSendOTPReqBody,
} from '../utils/types/agentB2CPublic.types';
import config from '../../../config/config';
import { SignOptions } from 'jsonwebtoken';

export default class AgentB2CPublicService extends AbstractServices {
  constructor() {
    super();
  }

  // send email otp service
  public async sendEmailOtp(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { email, type } = req.body as IAgentB2CPublicSendOTPReqBody;
      const { agency_id } = req.agencyB2CWhiteLabel;

      let OTP_FOR = '';

      const agentB2CModel = this.Model.AgencyB2CUserModel(trx);
      switch (type) {
        case OTP_TYPES.register_agent_b2c:
          const checkUserExist = await agentB2CModel.checkUser({
            agency_id,
            email,
          });

          if (checkUserExist) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: 'User already exist with this email.',
            };
          }

          OTP_FOR = 'register user.';
          break;
        case OTP_TYPES.reset_agent_b2c:
          const checkUser = await agentB2CModel.checkUser({
            agency_id,
            email,
          });
          if (!checkUser) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: 'No user has been found with this email',
            };
          }
          OTP_FOR = 'reset password.';
          break;
        default:
          break;
      }

      const commonModel = this.Model.CommonModel(trx);
      const checkOtp = await commonModel.getOTP({
        email: email,
        type: type,
      });

      if (checkOtp.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_GONE,
          message: this.ResMsg.THREE_TIMES_EXPIRED,
        };
      }

      const otp = Lib.otpGenNumber(6);
      const hashed_otp = await Lib.hashValue(otp);

      try {
        const [send_email] = await Promise.all([
          email
            ? EmailSendLib.sendEmail({
                email,
                emailSub: OTP_EMAIL_SUBJECT,
                emailBody: sendEmailOtpTemplate(otp, OTP_FOR),
              })
            : undefined,
        ]);

        if (send_email) {
          await commonModel.insertOTP({
            hashed_otp: hashed_otp,
            email: email,
            type: type,
          });

          return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: this.ResMsg.OTP_SENT,
            data: {
              email,
            },
          };
        } else {
          return {
            success: false,
            code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
            message: this.ResMsg.OTP_NOT_SENT,
          };
        }
      } catch (error) {
        console.error('Error sending email or SMS:', error);
        return {
          success: false,
          code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
          message: this.ResMsg.OTP_NOT_SENT,
        };
      }
    });
  }

  //match email otp service
  public async matchEmailOtpService(req: Request) {
    return this.db.transaction(async (trx) => {
      const { email, otp, type } = req.body as IAgentB2CPublicMatchOTPReqBody;
      const { agency_id } = req.agencyB2CWhiteLabel;

      const commonModel = this.Model.CommonModel(trx);
      const checkOtp = await commonModel.getOTP({
        email,
        type,
      });

      if (!checkOtp.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: this.ResMsg.OTP_EXPIRED,
        };
      }

      const { id: email_otp_id, otp: hashed_otp, tried } = checkOtp[0];

      if (tried > 3) {
        return {
          success: false,
          code: this.StatusCode.HTTP_GONE,
          message: this.ResMsg.TOO_MUCH_ATTEMPT,
        };
      }

      const otpValidation = await Lib.compareHashValue(
        otp.toString(),
        hashed_otp
      );

      if (otpValidation) {
        await commonModel.updateOTP(
          {
            tried: tried + 1,
            matched: 1,
          },
          { id: email_otp_id }
        );

        //--change it for member
        let secret = config.JWT_SECRET_AGENT_B2C + agency_id;
        let tokenValidity: SignOptions['expiresIn'] = '3m';

        switch (type) {
          case OTP_TYPES.register_agent_b2c:
            secret += 'register';
            break;

          case OTP_TYPES.reset_agent_b2c:
            secret += 'reset';
            break;

          default:
            break;
        }

        const token = Lib.createToken(
          {
            email: email,
            type: type,
          },
          secret + type,
          tokenValidity
        );

        return {
          success: true,
          code: this.StatusCode.HTTP_ACCEPTED,
          message: this.ResMsg.OTP_MATCHED,
          token,
        };
      } else {
        await commonModel.updateOTP(
          {
            tried: tried + 1,
          },
          { id: email_otp_id }
        );

        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.OTP_INVALID,
        };
      }
    });
  }

  //
}
