import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import Lib from '../../../utils/lib/lib';
import {
  LOGO_ROOT_LINK,
  OTP_TYPES,
  SOURCE_SUB_AGENT,
  WHITE_LABEL_PERMISSIONS_MODULES,
} from '../../../utils/miscellaneous/constants';
import PublicEmailOTPService from '../../public/services/publicEmailOTP.service';
import {
  ILogin2FAReqBody,
  ILoginReqBody,
  IRegisterSubAgentReqBody,
  IResetPassReqBody,
} from '../utils/types/authTypes';
import { ITokenParseAgencyUser } from '../../public/utils/types/publicCommon.types';
import CustomError from '../../../utils/lib/customError';
import { IInsertAgencyRolePermissionPayload } from '../../../utils/modelTypes/agentModel/agencyUserModelTypes';
import EmailSendLib from '../../../utils/lib/emailSendLib';
import { sendEmailOtpTemplate } from '../../../utils/templates/sendEmailOtpTemplate';

export default class AuthSubAgentService extends AbstractServices {
  constructor() {
    super();
  }

  public async register(req: Request) {
    return this.db.transaction(async (trx) => {
      const { email, agency_name, user_name, address, phone, password } =
        req.body as IRegisterSubAgentReqBody;
      const {
        agency_id: main_agent,
        agency_name: main_agent_name,
        agency_logo: main_agent_logo,
      } = req.agencyB2CWhiteLabel;
      const AgentModel = this.Model.AgencyModel(trx);
      const AgencyUserModel = this.Model.AgencyUserModel(trx);
      const commonModel = this.Model.CommonModel(trx);

      const files = (req.files as Express.Multer.File[]) || [];

      const checkAgentName = await AgentModel.checkAgency({
        name: agency_name,
        ref_agent_id: main_agent,
        agency_type: SOURCE_SUB_AGENT,
      });

      if (checkAgentName) {
        if (checkAgentName.status !== 'Incomplete') {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message:
              'Duplicate agency name! Already exist an agency with this name.',
          };
        }
      }

      const checkAgentUser = await AgencyUserModel.checkUser({
        email,
        agency_type: SOURCE_SUB_AGENT,
        ref_agent_id: main_agent,
      });

      if (checkAgentUser) {
        if (checkAgentUser.agency_status !== 'Incomplete') {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message:
              'Duplicate email! Already exist an agency with this email.',
          };
        }
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

      if (checkAgentUser) {
        const checkOtp = await commonModel.getOTP({
          email: email,
          type: 'register_sub_agent',
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

        await EmailSendLib.sendEmailAgent(trx, main_agent, {
          email,
          emailSub: `${main_agent_name} - Agency Registration Verification`,
          emailBody: sendEmailOtpTemplate({
            otpFor: 'Registration',
            project: main_agent_name,
            otp: otp,
            logo: '',
          }),
        });

        await commonModel.insertOTP({
          hashed_otp: hashed_otp,
          email: email,
          type: 'register_sub_agent',
        });
      } else {
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
          ref_agent_id: main_agent,
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

        const hashed_password = await Lib.hashValue(password);

        await AgencyUserModel.createUser({
          agency_id: newAgency[0].id,
          email,
          hashed_password,
          is_main_user: true,
          name: user_name,
          phone_number: phone,
          role_id: newRole[0].id,
          username,
        });

        const checkOtp = await commonModel.getOTP({
          email: email,
          type: 'register_sub_agent',
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

        await EmailSendLib.sendEmailAgent(trx, main_agent, {
          email,
          emailSub: `${main_agent_name} - Agency Registration Verification`,
          emailBody: sendEmailOtpTemplate({
            otpFor: 'Registration',
            project: main_agent_name,
            otp: otp,
            logo: `${LOGO_ROOT_LINK}${main_agent_logo}`,
          }),
        });

        await commonModel.insertOTP({
          hashed_otp: hashed_otp,
          email: email,
          type: 'register_sub_agent',
        });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'OTP has been sent to your email.',
        data: {
          email,
        },
      };
    });
  }

  public async registerComplete(req: Request) {
    return this.db.transaction(async (trx) => {
      const { email, otp } = req.body as { email: string; otp: string };
      const { agency_id: main_agency_id } = req.agencyB2CWhiteLabel;
      const AgentModel = this.Model.AgencyModel(trx);
      const AgencyUserModel = this.Model.AgencyUserModel(trx);
      const commonModel = this.Model.CommonModel(trx);

      const checkAgency = await AgencyUserModel.checkUser({
        agency_type: SOURCE_SUB_AGENT,
        ref_agent_id: main_agency_id,
        email,
      });

      if (!checkAgency || checkAgency.agency_status !== 'Incomplete') {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'No Inactive agency found with this email!',
        };
      }

      const checkOtp = await commonModel.getOTP({
        email,
        type: 'register_sub_agent',
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

        await AgentModel.updateAgency(
          { status: 'Pending' },
          checkAgency.agency_id
        );
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

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: `Registration successful. Please wait for admin approval.`,
      };
    });
  }

  public async login(req: Request) {
    return this.db.transaction(async (trx) => {
      const { password, user_or_email } = req.body as ILoginReqBody;
      const { agency_id: main_agency_id } = req.agencyB2CWhiteLabel;
      const AgentUserModel = this.Model.AgencyUserModel(trx);

      const checkUserAgency = await AgentUserModel.checkUser({
        username: user_or_email,
        email: user_or_email,
        agency_type: SOURCE_SUB_AGENT,
        ref_agent_id: main_agency_id,
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
        agency_email,
        agency_phone_number,
        agency_logo,
        agency_name,
        is_main_user,
        agency_type,
        ref_agent_id,
        civil_aviation,
        national_id,
        trade_license,
        address,
      } = checkUserAgency;

      console.log({ agency_status });

      if (
        agency_status === 'Inactive' ||
        agency_status === 'Incomplete' ||
        agency_status === 'Rejected'
      ) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Unauthorized agency! Please contact with us.',
        };
      }

      if (agency_status === 'Pending') {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Agency Request is in process. Please wait for approval.',
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

      const token = Lib.createToken(
        tokenData,
        config.JWT_SECRET_AGENT + main_agency_id,
        '24h'
      );

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
            civil_aviation,
            national_id,
            trade_license,
            agency_type,
            ref_agent_id,
          },
          role,
        },
        token,
      };
    });
  }

  public async login2FA(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_or_email, otp } = req.body as ILogin2FAReqBody;
      const { agency_id: main_agency_id } = req.agencyB2CWhiteLabel;
      const AgencyUserModel = this.Model.AgencyUserModel(trx);

      const checkAgencyUser = await AgencyUserModel.checkUser({
        email: user_or_email,
        username: user_or_email,
        ref_agent_id: main_agency_id,
        agency_type: SOURCE_SUB_AGENT,
      });

      if (!checkAgencyUser) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.HTTP_NOT_FOUND,
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
        agency_phone_number,
        agency_email,
        agency_logo,
        agency_name,
        is_main_user,
        civil_aviation,
        national_id,
        trade_license,
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
        address,
        agency_logo,
        agency_type: SOURCE_SUB_AGENT,
      };

      const authToken = Lib.createToken(
        tokenData,
        config.JWT_SECRET_AGENT + main_agency_id,
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
            civil_aviation,
            national_id,
            trade_license,
          },
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
      config.JWT_SECRET_AGENT + OTP_TYPES.reset_sub_agent
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

    if (type !== OTP_TYPES.reset_sub_agent) {
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
