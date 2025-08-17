import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import Lib from '../../../utils/lib/lib';
import {
  OTP_TYPES,
  SOURCE_SUB_AGENT,
  WHITE_LABEL_PERMISSIONS_MODULES,
} from '../../../utils/miscellaneous/constants';
import PublicEmailOTPService from '../../public/services/publicEmailOTP.service';
import {
  ICompleteAgencyRegisterParsedTokenData,
  ILogin2FAReqBody,
  ILoginReqBody,
  IRegisterAgentReqBody,
  IResetPassReqBody,
} from '../utils/types/authTypes';
import { ITokenParseAgencyUser } from '../../public/utils/types/publicCommon.types';
import CustomError from '../../../utils/lib/customError';
import { IInsertAgencyRolePermissionPayload } from '../../../utils/modelTypes/agentModel/agencyUserModelTypes';
import { registrationVerificationTemplate } from '../../../utils/templates/registrationVerificationTemplate';
import { registrationVerificationCompletedTemplate } from '../../../utils/templates/registrationVerificationCompletedTemplate';
import EmailSendLib from '../../../utils/lib/emailSendLib';

export default class AuthSubAgentService extends AbstractServices {
  constructor() {
    super();
  }

  public async register(req: Request) {
    return this.db.transaction(async (trx) => {
      const { email, agency_name, user_name, address, phone } =
        req.body as IRegisterAgentReqBody;
      const AgentModel = this.Model.AgencyModel(trx);
      const AgencyUserModel = this.Model.AgencyUserModel(trx);
      const files = (req.files as Express.Multer.File[]) || [];

      const checkAgentName = await AgentModel.checkAgency({
        name: agency_name,
      });

      const checkAgentUser = await AgencyUserModel.checkUser({
        email,
        agency_type: SOURCE_SUB_AGENT,
      });

      if (checkAgentUser) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'Email already exist. Please use another email.',
        };
      }

      if (checkAgentName) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message:
            'Duplicate agency name! Already exist an agency with this name.',
        };
      }

      let agency_logo = '';
      let civil_aviation = '';
      let trade_license = '';
      let national_id = '';

      files.forEach((file) => {
        switch (file.fieldname) {
          case 'agency_logo':
            agency_logo = file.filename;
            break;
          case 'civil_aviation':
            civil_aviation = file.filename;
            break;
          case 'trade_license':
            trade_license = file.filename;
            break;
          case 'national_id':
            national_id = file.filename;
            break;
          default:
            throw new CustomError(
              'Invalid files. Please provide valid trade license, civil aviation, NID, logo.',
              this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
            );
        }
      });

      const agent_no = await Lib.generateNo({ trx, type: 'Sub_Agent' });

      const newAgency = await AgentModel.createAgency({
        address,
        status: 'Incomplete',
        agent_no,
        agency_name,
        email,
        phone,
        agency_logo,
        civil_aviation,
        trade_license,
        national_id,
        agency_type: SOURCE_SUB_AGENT,
      });

      const newRole = await AgencyUserModel.createRole({
        agency_id: newAgency[0].id,
        name: 'Super Admin',
        is_main_role: true,
      });

      const permissions = await AgencyUserModel.getAllPermissions();

      const permissionPayload: IInsertAgencyRolePermissionPayload[] = [];

      permissions.forEach((item) => {
        if (!WHITE_LABEL_PERMISSIONS_MODULES.includes(item.name)) {
          permissionPayload.push({
            agency_id: newAgency[0].id,
            role_id: newRole[0].id,
            permission_id: item.id,
            delete: true,
            read: true,
            update: true,
            write: true,
          });
        }
      });

      await AgencyUserModel.insertRolePermission(permissionPayload);

      let username = Lib.generateUsername(user_name);

      let suffix = 1;

      while (await AgencyUserModel.checkUser({ username })) {
        username = `${username}${suffix}`;
        suffix += 1;
      }
      const password = Lib.generateRandomPassword(8);

      const hashed_password = await Lib.hashValue(password);

      const newUser = await AgencyUserModel.createUser({
        agency_id: newAgency[0].id,
        email,
        hashed_password,
        is_main_user: true,
        name: user_name,
        phone_number: phone,
        role_id: newRole[0].id,
        username,
      });

      const verificationToken = Lib.createToken(
        { agency_id: newAgency[0].id, email, user_id: newUser[0].id },
        config.JWT_SECRET_AGENT + OTP_TYPES.register_agent,
        '24h'
      );

      await EmailSendLib.sendEmail({
        email,
        emailSub: `Booking Expert Agency Registration Verification`,
        emailBody: registrationVerificationTemplate(
          agency_name,

          '/sign-up/verification?token=' + verificationToken
        ),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: `Your registration has been successfully placed. Agency ID: ${agent_no}. To complete your registration please check your email and complete registration with the link we have sent to your email.`,
        data: {
          email,
        },
      };
    });
  }

  public async registerComplete(req: Request) {
    return this.db.transaction(async (trx) => {
      const { token } = req.body as { token: string };
      const AgentModel = this.Model.AgencyModel(trx);
      const AgencyUserModel = this.Model.AgencyUserModel(trx);

      const parsedToken = Lib.verifyToken(
        token,
        config.JWT_SECRET_AGENT + OTP_TYPES.register_agent
      ) as ICompleteAgencyRegisterParsedTokenData | false;

      if (!parsedToken) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: 'Invalid token or token expired. Please contact us.',
        };
      }

      const { agency_id, email, user_id, agency_name } = parsedToken;

      await AgentModel.updateAgency({ status: 'Pending' }, agency_id);

      const password = Lib.generateRandomPassword(12);
      const hashed_password = await Lib.hashValue(password);

      await AgencyUserModel.updateUser(
        {
          hashed_password,
        },
        { agency_id, id: user_id }
      );

      await EmailSendLib.sendEmail({
        email,
        emailSub: `Booking Expert Agency Registration Verification`,
        emailBody: registrationVerificationCompletedTemplate(agency_name, {
          email,
          password,
        }),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: `Registration successful. Please check you will receive login credentials at the email address ${email}.`,
      };
    });
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
        agent_no,
        agency_status,
        hashed_password,
        phone_number,
        white_label,
        agency_email,
        agency_phone_number,
        agency_logo,
        agency_name,
        is_main_user,
        ref_id,
        agency_type,
        ref_agent_id,
        allow_api,
        civil_aviation,
        kam_id,
        national_id,
        trade_license,
        address,
      } = checkUserAgency;

      if (
        agency_status === 'Inactive' ||
        agency_status === 'Incomplete' ||
        agency_status === 'Rejected' ||
        agency_status === 'Pending'
      ) {
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
        const wPermissions = await AgentModel.getWhiteLabelPermission({
          agency_id,
        });

        if (wPermissions) {
          const { token, ...rest } = wPermissions;
          whiteLabelPermissions = rest;
        }
      }

      const tokenData: ITokenParseAgencyUser = {
        user_id: id,
        username,
        user_email: email,
        name,
        agency_id,
        agency_email,
        agency_name,
        is_main_user,
        phone_number,
        photo,
        agency_type,
        ref_agent_id,
        address,
        agency_logo,
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
          phone_number,
          agency: {
            agency_id,
            agent_no,
            agency_email,
            agency_name,
            agency_status,
            phone_number: agency_phone_number,
            agency_logo,
            allow_api,
            civil_aviation,
            kam_id,
            national_id,
            trade_license,
            agency_type,
            ref_agent_id,
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
      const { user_or_email, otp } = req.body as ILogin2FAReqBody;

      const AgencyUserModel = this.Model.AgencyUserModel(trx);
      const AgencyModel = this.Model.AgencyModel(trx);

      const checkAgencyUser = await AgencyUserModel.checkUser({
        email: user_or_email,
        username: user_or_email,
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
        agent_no,
        agency_status,
        phone_number,
        white_label,
        agency_phone_number,
        agency_email,
        agency_logo,
        agency_name,
        is_main_user,
        agency_type,
        allow_api,
        civil_aviation,
        kam_id,
        national_id,
        trade_license,
        ref_agent_id,
        address,
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
        const wPermissions = await AgencyModel.getWhiteLabelPermission({
          agency_id,
        });

        if (wPermissions) {
          const { token, ...rest } = wPermissions;
          whiteLabelPermissions = rest;
        }
      }

      const tokenData: ITokenParseAgencyUser = {
        user_id: id,
        username,
        user_email: email,
        name,
        agency_id,
        agency_email,
        agency_name,
        phone_number,
        is_main_user,
        photo,
        agency_type,
        ref_agent_id,
        address,
        agency_logo,
      };

      const authToken = Lib.createToken(
        tokenData,
        config.JWT_SECRET_AGENT,
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
          phone_number,
          agency: {
            agency_id,
            agent_no,
            agency_email,
            agency_name,
            agency_status,
            phone_number: agency_phone_number,
            agency_logo,
            allow_api,
            civil_aviation,
            kam_id,
            national_id,
            trade_license,
            agency_type,
            ref_agent_id,
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

    await AgencyUserModel.updateUserByEmail({ hashed_password }, email);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.PASSWORD_CHANGED,
    };
  }
}
