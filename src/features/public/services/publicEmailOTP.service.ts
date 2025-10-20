import AbstractServices from '../../../abstract/abstract.service';
import {
  OTP_EMAIL_SUBJECT,
  OTP_TYPES,
} from '../../../utils/miscellaneous/constants';
import Lib from '../../../utils/lib/lib';
import config from '../../../config/config';
import { sendEmailOtpTemplate } from '../../../utils/templates/sendEmailOtpTemplate';
import {
  IMatchOTPReqBody,
  ISendEmailOTPReqBody,
} from '../utils/types/publicOTP.types';
import { TDB } from '../utils/types/publicCommon.types';
import { SignOptions } from 'jsonwebtoken';
import EmailSendLib from '../../../utils/lib/emailSendLib';

export default class PublicEmailOTPService extends AbstractServices {
  private DBCon: TDB;
  constructor(DBCon?: TDB) {
    super();
    this.DBCon = DBCon || this.db;
  }

  // send email otp service
  public async sendEmailOtp(payload: ISendEmailOTPReqBody) {
    return await this.DBCon.transaction(async (trx) => {
      const { email, type } = payload;

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
          break;
        case OTP_TYPES.reset_agent:
          const agencyUserModel = this.Model.AgencyUserModel(trx);
          const checkAgent = await agencyUserModel.checkUser({
            email,
            agency_type: 'AGENT',
          });

          if (!checkAgent) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: 'No user has been found with this email',
            };
          }
          OTP_FOR = 'reset password.';
          break;

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
          break;

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
          break;

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
          break;

        case OTP_TYPES.verify_admin:
          OTP_FOR = 'admin login.';
          break;

        case OTP_TYPES.verify_agent:
          OTP_FOR = 'agent login.';
          break;

        case OTP_TYPES.verify_b2c:
          OTP_FOR = 'user login.';
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
                emailBody: sendEmailOtpTemplate({ otp, otpFor: OTP_FOR, logo: payload.logo, project: payload.name}),
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
  public async matchEmailOtpService(payload: IMatchOTPReqBody) {
    return this.DBCon.transaction(async (trx) => {
      const { email, otp, type } = payload;
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
        let secret = config.JWT_SECRET_ADMIN;
        let tokenValidity: SignOptions['expiresIn'] = '3m';

        switch (type) {
          case OTP_TYPES.reset_admin:
            secret = config.JWT_SECRET_ADMIN;
            break;

          case OTP_TYPES.reset_agent:
            secret = config.JWT_SECRET_AGENT;
            break;

          case OTP_TYPES.reset_b2c:
            secret = config.JWT_SECRET_USER;
            break;

          case OTP_TYPES.register_agent:
            tokenValidity = '15m';
            secret = config.JWT_SECRET_AGENT;
            break;

          case OTP_TYPES.register_b2c:
            tokenValidity = '15m';
            secret = config.JWT_SECRET_USER;
            break;

          case OTP_TYPES.verify_admin:
            secret = config.JWT_SECRET_ADMIN;
            break;

          case OTP_TYPES.verify_agent:
            secret = config.JWT_SECRET_AGENT;
            break;

          case OTP_TYPES.verify_b2c:
            secret = config.JWT_SECRET_USER;
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
}
