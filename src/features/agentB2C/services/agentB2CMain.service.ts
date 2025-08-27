import AbstractServices from '../../../abstract/abstract.service';
import { Request } from 'express';
import {
  IMatchAgentB2COTPReqBody,
  ISendAgentB2CEmailOTPReqBody,
} from '../utils/types/agentB2CMain.types';
import {
  OTP_EMAIL_SUBJECT,
  OTP_TYPES,
} from '../../../utils/miscellaneous/constants';
import Lib from '../../../utils/lib/lib';
import EmailSendLib from '../../../utils/lib/emailSendLib';
import { sendEmailOtpTemplate } from '../../../utils/templates/sendEmailOtpTemplate';
import config from '../../../config/config';
import { SignOptions } from 'jsonwebtoken';

export class AgentB2CMainService extends AbstractServices {
  // send email otp service
  public async sendEmailOtp(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { email, type } = req.body as ISendAgentB2CEmailOTPReqBody;
      const { agency_id } = req.agencyB2CWhiteLabel;

      let OTP_FOR = '';

      switch (type) {
        case OTP_TYPES.reset_agent_b2c:
          const agentB2CModel = this.Model.AgencyB2CUserModel(trx);
          const check_user = await agentB2CModel.checkUser({
            email,
            agency_id,
          });
          if (!check_user) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: 'No user has been found with this email',
            };
          }
          break;
        default:
          break;
      }

      const commonModel = this.Model.CommonModel(trx);
      const checkOtp = await commonModel.getOTP({
        email: email,
        type: type,
        agency_id,
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
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const siteData = await configModel.getSiteConfig({ agency_id });

      if (!siteData) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Site configuration not found',
        };
      }

      try {
        const send_email = await EmailSendLib.sendEmailAgent(trx, agency_id, {
          email,
          emailSub: OTP_EMAIL_SUBJECT,
          emailBody: sendEmailOtpTemplate({
            otp,
            otpFor: OTP_FOR,
            logo: siteData.main_logo,
            project: siteData.site_name,
          }),
        });

        if (send_email) {
          await commonModel.insertOTP({
            hashed_otp: hashed_otp,
            email: email,
            type: type,
            agency_id,
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
      const { email, otp, type } = req.body as IMatchAgentB2COTPReqBody;
      const { agency_id } = req.agencyB2CWhiteLabel;
      const commonModel = this.Model.CommonModel(trx);
      const checkOtp = await commonModel.getOTP({
        email,
        type,
        agency_id,
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

        //--change it
        let secret = config.JWT_SECRET_AGENT_B2C;
        let tokenValidity: SignOptions['expiresIn'] = '3m';

        switch (type) {
          case OTP_TYPES.reset_agent_b2c:
            secret = config.JWT_SECRET_AGENT_B2C;
            break;

          default:
            break;
        }

        const token = Lib.createToken(
          {
            email: email,
            type: type,
            agency_id,
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
          {
            id: email_otp_id,
            agency_id,
          }
        );

        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.OTP_INVALID,
        };
      }
    });
  }

  public async createEmailSubscriber(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CWhiteLabel;
      const { email } = req.body as { email: string };

      const commonModel = this.Model.CommonModel(trx);

      const check = await commonModel.getEmailSubscriber({
        agency_id,
        source_type: 'AGENT B2C',
        email,
        with_total: false,
      });

      if (!check.data.length) {
        await commonModel.insertEmailSubscriber({
          email,
          source_type: 'AGENT B2C',
          agency_id,
        });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }
}
