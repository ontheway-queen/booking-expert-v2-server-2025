import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import {
  OTP_EMAIL_SUBJECT,
  OTP_TYPES,
} from '../../../utils/miscellaneous/constants';
import Lib from '../../../utils/lib/lib';
import config from '../../../config/config';
import { sendEmailOtpTemplate } from '../../../utils/templates/sendEmailOtp';

export default class PublicEmailOTPService extends AbstractServices {
  constructor() {
    super();
  }

  // send email otp service
  public async sendEmailOtp(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { email, type } = req.body;

      let OTP_FOR = '';
      switch (type) {
        case OTP_TYPES.reset_admin:
          const userAdminModel = this.Model.AdminModel(trx);
          const check = await userAdminModel.checkUserAdmin({ email });
          if (!check) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: 'No user has been found with this email',
            };
          }
          OTP_FOR = 'reset password.';
        case OTP_TYPES.reset_agent:
          const agencyUserModel = this.Model.AgencyUserModel(trx);
          const checkAdmin = await agencyUserModel.checkUser({ email });
          if (!checkAdmin) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: 'No user has been found with this email',
            };
          }
          OTP_FOR = 'reset password.';
        case OTP_TYPES.reset_b2c:
          const b2cUserModel = this.Model.B2CUserModel(trx);
          const checkUser = await b2cUserModel.checkUser({ email });
          if (!checkUser) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: 'No user has been found with this email',
            };
          }
          OTP_FOR = 'reset password.';
        case OTP_TYPES.register_agent:
          const agencyUserModel2 = this.Model.AgencyUserModel(trx);
          const checkAdmin2 = await agencyUserModel2.checkUser({ email });
          if (checkAdmin2) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: 'User already exist with this email.',
            };
          }
          OTP_FOR = 'register as an agent.';
        case OTP_TYPES.register_b2c:
          const b2cUserModel2 = this.Model.B2CUserModel(trx);
          const checkUser2 = await b2cUserModel2.checkUser({ email });
          if (checkUser2) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: 'User already exist with this email.',
            };
          }
          OTP_FOR = 'registration.';
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
            ? Lib.sendEmailDefault({
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
      const { email, otp, type } = req.body;
      const commonModel = this.Model.CommonModel(trx);
      const checkOtp = await commonModel.getOTP({ email, type });

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
        let secret = config.JWT_SECRET_ADMIN;

        switch (type) {
          case OTP_TYPES.reset_admin:
            secret = config.JWT_SECRET_ADMIN;
          case OTP_TYPES.reset_agent:
            secret = config.JWT_SECRET_AGENT;
          case OTP_TYPES.reset_b2c:
            secret = config.JWT_SECRET_USER;
          case OTP_TYPES.register_agent:
            secret = config.JWT_SECRET_AGENT;
          case OTP_TYPES.register_b2c:
            secret = config.JWT_SECRET_USER;
          default:
            break;
        }

        const token = Lib.createToken(
          {
            email: email,
            type: type,
          },
          secret + type,
          5000
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
}
