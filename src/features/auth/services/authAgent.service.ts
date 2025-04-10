import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import Lib from '../../../utils/lib/lib';
import { OTP_TYPES } from '../../../utils/miscellaneous/constants';
import PublicEmailOTPService from '../../public/services/publicEmailOTP.service';
import {
  ILogin2FAReqBody,
  ILoginReqBody,
  IResetPassReqBody,
} from '../utils/types/authTypes';
import { ITokenParseAgency } from '../../public/utils/types/publicCommon.types';

export default class AuthAgentService extends AbstractServices {
  constructor() {
    super();
  }

  public async login(req: Request) {
    return this.db.transaction(async (trx) => {
      const { password, user_or_email } = req.body as ILoginReqBody;
      const AgentUserModel = this.Model.AgencyUserModel(trx);
      const AgentModel = this.Model.AgencyModel(trx);

      const checkUserAgency = await AgentUserModel.checkUser({
        username: user_or_email,
        email: user_or_email,
      });

      if (!checkUserAgency) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      const {
        two_fa,
        status,
        email,
        id,
        username,
        name,
        role_id,
        photo,
        agency_id,
        agency_no,
        agency_status,
        hashed_password,
        mobile_number,
        white_label,
        agency_email,
        agency_logo,
        agency_name,
        is_main_user,
      } = checkUserAgency;

      if (agency_status === 'Inactive') {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Unauthorized agency! Please contact with us.',
        };
      }

      if (!status) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_ACCOUNT_INACTIVE,
        };
      }

      const checkPassword = await Lib.compareHashValue(
        password,
        hashed_password
      );

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
          type: OTP_TYPES.verify_agent,
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

      let whiteLabelPermissions = {
        flight: false,
        hotel: false,
        visa: false,
        holiday: false,
        umrah: false,
        group_fare: false,
        blog: false,
      };

      if (white_label) {
        const wPermissions = await AgentModel.getWhiteLabelPermission(
          agency_id
        );
        const { token, ...rest } = wPermissions;
        whiteLabelPermissions = rest;
      }

      const tokenData: ITokenParseAgency = {
        user_id: id,
        username,
        user_email: email,
        name,
        agency_id,
        agency_email,
        agency_name,
        is_main_user,
      };

      const token = Lib.createToken(tokenData, config.JWT_SECRET_AGENT, '24h');

      const role = await AgentUserModel.getSingleRoleWithPermissions(
        role_id,
        agency_id
      );

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
          is_main_user,
          agency: {
            agency_id,
            agency_no,
            agency_email,
            agency_name,
            agency_status,
            mobile_number,
            agency_logo,
          },
          role,
          white_label,
          whiteLabelPermissions,
        },
        token,
      };
    });
  }

  public async login2FA(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { email: user_email, otp } = req.body as ILogin2FAReqBody;

      const AgencyUserModel = this.Model.AgencyUserModel(trx);
      const AgencyModel = this.Model.AgencyModel(trx);

      const checkAgencyUser = await AgencyUserModel.checkUser({
        email: user_email,
      });

      if (!checkAgencyUser) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      const {
        two_fa,
        status,
        email,
        id,
        username,
        name,
        role_id,
        photo,
        agency_id,
        agency_no,
        agency_status,
        mobile_number,
        white_label,
        agency_email,
        agency_logo,
        agency_name,
        is_main_user,
      } = checkAgencyUser;

      if (!status) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_ACCOUNT_INACTIVE,
        };
      }

      if (agency_status === 'Inactive') {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Unauthorized agency! Please contact with us.',
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

      let whiteLabelPermissions = {
        flight: false,
        hotel: false,
        visa: false,
        holiday: false,
        umrah: false,
        group_fare: false,
        blog: false,
      };

      if (white_label) {
        const wPermissions = await AgencyModel.getWhiteLabelPermission(
          agency_id
        );
        const { token, ...rest } = wPermissions;
        whiteLabelPermissions = rest;
      }

      const tokenData: ITokenParseAgency = {
        user_id: id,
        username,
        user_email,
        name,
        agency_id,
        agency_email,
        agency_name,
        is_main_user,
      };

      const authToken = Lib.createToken(
        tokenData,
        config.JWT_SECRET_ADMIN,
        '24h'
      );

      const role = await AgencyUserModel.getSingleRoleWithPermissions(
        role_id,
        agency_id
      );

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
          is_main_user,
          agency: {
            agency_id,
            agency_no,
            agency_email,
            agency_name,
            agency_status,
            mobile_number,
            agency_logo,
          },
          role,
          white_label,
          whiteLabelPermissions,
        },
        token: authToken,
      };
    });
  }

  public async resetPassword(req: Request) {
    const { password, token } = req.body as IResetPassReqBody;

    const data: any = Lib.verifyToken(
      token,
      config.JWT_SECRET_AGENT + OTP_TYPES.reset_agent
    );

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    }
    const { email, type } = data;

    if (type !== OTP_TYPES.reset_agent) {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: this.StatusCode.HTTP_FORBIDDEN,
      };
    }

    const AgencyUserModel = this.Model.AgencyUserModel();

    const hashed_password = await Lib.hashValue(password);

    await AgencyUserModel.updateUser({ hashed_password }, email);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.PASSWORD_CHANGED,
    };
  }
}
