import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import {
  ICompleteUserRegisterParsedTokenData,
  ILogin2FAReqBody,
  ILoginReqBody,
  IRegisterB2CReqBody,
  IResetPassReqBody,
} from '../utils/types/authTypes';
import Lib from '../../../utils/lib/lib';
import PublicEmailOTPService from '../../public/services/publicEmailOTP.service';
import { OTP_TYPES } from '../../../utils/miscellaneous/constants';
import { ITokenParseUser } from '../../public/utils/types/publicCommon.types';
import config from '../../../config/config';
import { registrationVerificationTemplate } from '../../../utils/templates/registrationVerificationTemplate';
import { registrationVerificationCompletedTemplate } from '../../../utils/templates/registrationVerificationCompletedTemplate';
import EmailSendLib from '../../../utils/lib/emailSendLib';

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

  public async resetPassword(req: Request) {
    const { password, token } = req.body as IResetPassReqBody;

    const data: any = Lib.verifyToken(
      token,
      config.JWT_SECRET_USER + OTP_TYPES.reset_b2c
    );

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    }
    const { email, type } = data;

    if (type !== OTP_TYPES.reset_b2c) {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: this.StatusCode.HTTP_FORBIDDEN,
      };
    }

    const B2CUserModel = this.Model.B2CUserModel();

    const password_hash = await Lib.hashValue(password);

    await B2CUserModel.updateUserByEmail({ password_hash }, email);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.PASSWORD_CHANGED,
    };
  }

  public async register(req: Request) {
    return this.db.transaction(async (trx) => {
      const { email, name, phone_number, gender } =
        req.body as IRegisterB2CReqBody;
      const UserModel = this.Model.B2CUserModel(trx);

      const checkB2CUser = await UserModel.checkUser({ email });

      if (checkB2CUser) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'Email already exist. Please use another email.',
        };
      }

      let username = Lib.generateUsername(name);

      let suffix = 1;

      while (await UserModel.checkUser({ username })) {
        username = `${username}${suffix}`;
        suffix += 1;
      }

      const password = Lib.generateRandomPassword(8);

      const password_hash = await Lib.hashValue(password);

      const newUser = await UserModel.createUser({
        email,
        password_hash,
        name,
        phone_number,
        username,
        gender,
      });

      const verificationToken = Lib.createToken(
        { email, user_id: newUser[0].id, username, name },
        config.JWT_SECRET_USER + OTP_TYPES.register_b2c,
        '24h'
      );

      await EmailSendLib.sendEmail({
        email,
        emailSub: `Booking Expert User Registration Verification`,
        emailBody: registrationVerificationTemplate(
          name,
          '/registration/verification?token=' + verificationToken
        ),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: `Your registration has been successfully placed. To complete your registration please check your email and complete registration with the link we have sent to your email.`,
        data: {
          email,
        },
      };
    });
  }

  public async registerComplete(req: Request) {
    return this.db.transaction(async (trx) => {
      const { token } = req.body as { token: string };
      const B2CUserModel = this.Model.B2CUserModel(trx);

      const parsedToken = Lib.verifyToken(
        token,
        config.JWT_SECRET_USER + OTP_TYPES.register_b2c
      ) as ICompleteUserRegisterParsedTokenData | false;

      if (!parsedToken) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: 'Invalid token or token expired. Please contact us.',
        };
      }

      const { email, username, user_id, name } = parsedToken;

      const user = await B2CUserModel.checkUser({ id: user_id });

      if (!user) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.HTTP_UNAUTHORIZED,
        };
      }

      const password = Lib.generateRandomPassword(8);
      const password_hash = await Lib.hashValue(password);

      await B2CUserModel.updateUser({ password_hash }, user_id);

      const tokenData: ITokenParseUser = {
        user_id,
        username,
        user_email: email,
        name,
        photo: user.photo,
        phone_number: user.phone_number,
      };

      const AuthToken = Lib.createToken(
        tokenData,
        config.JWT_SECRET_USER,
        '24h'
      );

      await EmailSendLib.sendEmail({
        email,
        emailSub: `Booking Expert User Registration Completed`,
        emailBody: registrationVerificationCompletedTemplate(name, {
          email,
          password,
        }),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: `Registration successful. Please check your email address ${email} for login credentials.`,
        data: {
          id: user_id,
          username,
          name,
          email,
          two_fa: user.two_fa,
          status: user.status,
          photo: user.photo,
          gender: user.gender,
        },
        token: AuthToken,
      };
    });
  }
}
