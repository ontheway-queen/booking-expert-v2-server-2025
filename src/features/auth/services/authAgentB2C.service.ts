import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import Lib from '../../../utils/lib/lib';
import { ITokenParseAgencyB2CUser } from '../../public/utils/types/publicCommon.types';
import {
  ILoginReqBody,
  IRegisterAgentB2CReqBody,
  IResetPassReqBody,
} from '../utils/types/authTypes';
import { OTP_TYPES } from '../../../utils/miscellaneous/constants';

export default class AuthAgentB2CService extends AbstractServices {
  constructor() {
    super();
  }

  public async register(req: Request) {
    return this.db.transaction(async (trx) => {
      const { email, phone_number, name, gender, password } =
        req.body as IRegisterAgentB2CReqBody;
      const { agency_id } = req.agencyB2CWhiteLabel;
      const AgentModel = this.Model.AgencyModel(trx);
      const AgentB2CUserModel = this.Model.AgencyB2CUserModel(trx);

      const files = (req.files as Express.Multer.File[]) || [];

      const check_email = await AgentB2CUserModel.checkUser({
        email,
        agency_id,
      });
      if (check_email) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'Email already exist. Please use another email.',
        };
      }

      const agent_details = await AgentModel.getSingleAgency(agency_id);

      let username = Lib.generateUsername(name);

      let suffix = 1;

      while (await AgentB2CUserModel.checkUser({ username, agency_id })) {
        username = `${username}${suffix}`;
        suffix += 1;
      }

      const password_hash = await Lib.hashValue(password);

      const newUser = await AgentB2CUserModel.createUser({
        agency_id,
        email,
        password_hash,
        name,
        phone_number,
        username,
        gender,
        photo: files?.[0]?.filename,
      });

      const tokenData: ITokenParseAgencyB2CUser = {
        agency_id,
        agency_name: String(agent_details?.agency_name),
        agency_email: String(agent_details?.email),
        agency_logo: String(agent_details?.agency_logo),
        agency_address: String(agent_details?.address),
        agency_number: String(agent_details?.phone),
        user_id: newUser[0].id,
        photo: files?.[0]?.filename,
        user_email: email,
        username,
        name,
        phone_number,
      };

      const AuthToken = Lib.createToken(
        tokenData,
        config.JWT_SECRET_AGENT_B2C,
        '24h'
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: `Registration has been completed`,
        data: {
          id: tokenData.user_id,
          username,
          email,
          name: tokenData.name,
          photo: tokenData.photo,
          gender,
        },
        token: AuthToken,
      };
    });
  }

  public async login(req: Request) {
    return this.db.transaction(async (trx) => {
      const { password, user_or_email } = req.body as ILoginReqBody;
      const { agency_id } = req.agencyB2CWhiteLabel;
      const AgentB2CUserModel = this.Model.AgencyB2CUserModel(trx);
      const AgentModel = this.Model.AgencyModel(trx);

      const checkAgentB2C = await AgentB2CUserModel.checkUser({
        username: user_or_email,
        email: user_or_email,
        agency_id,
      });

      if (!checkAgentB2C) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      if (checkAgentB2C.status === false) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message:
            'Your account is disabled. Please contact with the authority!',
        };
      }

      const agent_details = await AgentModel.getSingleAgency(agency_id);
      if (!agent_details) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.StatusCode.HTTP_UNAUTHORIZED,
        };
      }

      if (agent_details.status !== 'Active') {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.StatusCode.HTTP_UNAUTHORIZED,
        };
      }

      const checkPassword = await Lib.compareHashValue(
        password,
        checkAgentB2C.password_hash
      );

      if (!checkPassword) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      const tokenData: ITokenParseAgencyB2CUser = {
        agency_id,
        agency_name: String(agent_details?.agency_name),
        agency_email: String(agent_details?.email),
        agency_logo: String(agent_details?.agency_logo),
        agency_address: String(agent_details?.address),
        agency_number: String(agent_details?.phone),
        user_id: checkAgentB2C.id,
        photo: checkAgentB2C.photo,
        user_email: checkAgentB2C.email,
        username: checkAgentB2C.username,
        name: checkAgentB2C.name,
        phone_number: checkAgentB2C.phone_number,
      };

      const AuthToken = Lib.createToken(
        tokenData,
        config.JWT_SECRET_AGENT_B2C,
        '24h'
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.LOGIN_SUCCESSFUL,
        data: {
          id: tokenData.user_id,
          username: checkAgentB2C.username,
          email: tokenData.user_email,
          name: tokenData.name,
          photo: tokenData.photo,
          gender: checkAgentB2C.gender,
        },
        token: AuthToken,
      };
    });
  }

  public async resetPassword(req: Request) {
    const { agency_id } = req.agencyB2CWhiteLabel;
    const { password, token } = req.body as IResetPassReqBody;

    const data: any = Lib.verifyToken(
      token,
      config.JWT_SECRET_AGENT_B2C + OTP_TYPES.reset_agent_b2c
    );

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    }
    const { email, type } = data;

    if (type !== OTP_TYPES.reset_agent_b2c) {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: this.StatusCode.HTTP_FORBIDDEN,
      };
    }

    const AgencyB2CUserModel = this.Model.AgencyB2CUserModel();

    const password_hash = await Lib.hashValue(password);

    await AgencyB2CUserModel.updateUserByEmail(
      { password_hash },
      email,
      agency_id
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.PASSWORD_CHANGED,
    };
  }
}
