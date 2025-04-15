import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { ILogin2FAReqBody, ILoginReqBody } from '../utils/types/authTypes';
import Lib from '../../../utils/lib/lib';
import PublicEmailOTPService from '../../public/services/publicEmailOTP.service';
import { OTP_TYPES } from '../../../utils/miscellaneous/constants';
import { ITokenParseUser } from '../../public/utils/types/publicCommon.types';
import config from '../../../config/config';

export default class AuthB2CService extends AbstractServices {
  constructor() {
    super();
  }

  public async login(req: Request) {
    return this.db.transaction(async (trx) => {
      const { password, user_or_email } = req.body as ILoginReqBody;
      const AgentUserModel = this.Model.B2CUserModel(trx);

      const checkUser = await AgentUserModel.checkUser({
        username: user_or_email,
        email: user_or_email,
      });

      if (!checkUser) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      const {
        status,
        two_fa,
        gender,
        password_hash,
        email,
        id,
        username,
        name,
        photo,
        phone_number,
      } = checkUser;

      if (!status) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: 'Account disabled! Please contact us.',
        };
      }

      const checkPassword = await Lib.compareHashValue(password, password_hash);

      if (!checkPassword) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      if (two_fa) {
        const data = await new PublicEmailOTPService(trx).sendEmailOtp({
          email,
          type: OTP_TYPES.verify_b2c,
        });

        if (data.success) {
          return {
            success: true,
            code: data.code,
            message: data.message,
            data: {
              email,
              two_fa,
            },
          };
        } else {
          return data;
        }
      }

      const tokenData: ITokenParseUser = {
        user_id: id,
        username,
        user_email: email,
        name,
        photo,
        phone_number,
      };

      const token = Lib.createToken(tokenData, config.JWT_SECRET_USER, '24h');

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.LOGIN_SUCCESSFUL,
        data: {
          id,
          username,
          name,
          email,
          two_fa,
          status,
          photo,
          gender,
        },
        token,
      };
    });
  }

  public async login2FA(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { email: user_email, otp } = req.body as ILogin2FAReqBody;

      const UserModel = this.Model.B2CUserModel(trx);

      const checkUser = await UserModel.checkUser({
        email: user_email,
      });

      if (!checkUser) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      const {
        status,
        phone_number,
        two_fa,
        gender,
        email,
        id,
        username,
        name,
        photo,
      } = checkUser;

      if (!status) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_ACCOUNT_INACTIVE,
        };
      }

      const data = await new PublicEmailOTPService(trx).matchEmailOtpService({
        email,
        otp,
        type: OTP_TYPES.verify_agent,
      });

      if (!data.success) {
        return data;
      }

      const tokenData: ITokenParseUser = {
        user_id: id,
        username,
        user_email: email,
        name,
        photo,
        phone_number,
      };

      const token = Lib.createToken(tokenData, config.JWT_SECRET_USER, '24h');

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.LOGIN_SUCCESSFUL,
        data: {
          id,
          username,
          name,
          email,
          two_fa,
          status,
          photo,
          gender,
        },
        token,
      };
    });
  }
}
