import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import {
  ILogin2FAReqBody,
  ILoginReqBody,
  IResetPassReqBody,
} from '../utils/types/authTypes';
import Lib from '../../../utils/lib/lib';
import PublicEmailOTPService from '../../public/services/publicEmailOTP.service';
import { OTP_TYPES } from '../../../utils/miscellaneous/constants';
import { ITokenParseAdmin } from '../../public/utils/types/publicCommon.types';
import config from '../../../config/config';

export default class AuthAdminService extends AbstractServices {
  constructor() {
    super();
  }

  public async login(req: Request) {
    return this.db.transaction(async (trx) => {
      const { password, user_or_email } = req.body as ILoginReqBody;
      const AdminModel = this.Model.AdminModel(trx);

      const checkUserAdmin = await AdminModel.checkUserAdmin({
        username: user_or_email,
        email: user_or_email,
      });

      if (!checkUserAdmin) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      const {
        password_hash,
        two_fa,
        status,
        email,
        id,
        username,
        name,
        role_id,
        photo,
        phone_number,
        gender,
        is_main_user,
      } = checkUserAdmin;

      if (!status) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_ACCOUNT_INACTIVE,
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
          type: OTP_TYPES.verify_admin,
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

      const tokenData: ITokenParseAdmin = {
        user_id: id,
        username,
        user_email: email,
        name,
        is_main_user,
      };

      const token = Lib.createToken(tokenData, config.JWT_SECRET_ADMIN, '24h');

      const role = await AdminModel.getSingleRoleWithPermissions(role_id);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.LOGIN_SUCCESSFUL,
        data: {
          two_fa,
          status,
          email,
          id,
          username,
          name,
          photo,
          phone_number,
          gender,
          is_main_user,
          role,
        },
        token,
      };
    });
  }

  public async login2FA(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { email, otp } = req.body as ILogin2FAReqBody;

      const AdminModel = this.Model.AdminModel(trx);

      const checkUserAdmin = await AdminModel.checkUserAdmin({
        email: email,
      });

      if (!checkUserAdmin) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      const {
        status,
        two_fa,
        id,
        username,
        name,
        role_id,
        photo,
        phone_number,
        gender,
        is_main_user,
      } = checkUserAdmin;

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
        type: OTP_TYPES.verify_admin,
      });

      if (!data.success) {
        return data;
      }

      const tokenData: ITokenParseAdmin = {
        user_id: id,
        username,
        user_email: email,
        name,
        is_main_user,
      };

      const authToken = Lib.createToken(
        tokenData,
        config.JWT_SECRET_ADMIN,
        '24h'
      );

      const role = await AdminModel.getSingleRoleWithPermissions(role_id);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.LOGIN_SUCCESSFUL,
        data: {
          two_fa,
          status,
          email,
          id,
          username,
          name,
          photo,
          phone_number,
          gender,
          is_main_user,
          role,
        },
        token: authToken,
      };
    });
  }

  public async resetPassword(req: Request) {
    const { password, token } = req.body as IResetPassReqBody;

    const data: any = Lib.verifyToken(
      token,
      config.JWT_SECRET_ADMIN + OTP_TYPES.reset_admin
    );

    console.log({ data });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    }
    const { email, type } = data;

    if (type !== OTP_TYPES.reset_admin) {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: this.StatusCode.HTTP_FORBIDDEN,
      };
    }

    const AdminModel = this.Model.AdminModel();

    const password_hash = await Lib.hashValue(password);

    await AdminModel.updateUserAdminByEmail({ password_hash }, { email });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.PASSWORD_CHANGED,
    };
  }
}
