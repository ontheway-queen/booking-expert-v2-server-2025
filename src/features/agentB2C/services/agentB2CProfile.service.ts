import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import Lib from '../../../utils/lib/lib';
import { IUpdateAgencyB2CUserPayload } from '../../../utils/modelTypes/agencyB2CModelTypes/agecncyB2CUserModelTypes';
import {
  IAgentB2CChangePasswordReqBody,
  IUpdateAgentB2CProfileReqBody,
} from '../utils/types/agentB2CProfile.types';

export default class AgentB2CProfileService extends AbstractServices {
  constructor() {
    super();
  }

  public async getProfile(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id, agency_id } = req.agencyB2CUser;
      const { blog, flight, group_fare, holiday, hotel, umrah, visa } =
        req.agencyB2CWhiteLabel;
      const AgencyB2CUserModel = this.Model.AgencyB2CUserModel(trx);
      const AgentModel = this.Model.AgencyModel(trx);

      const checkAgentB2C = await AgencyB2CUserModel.checkUser({
        id: user_id,
        agency_id,
      });

      if (!checkAgentB2C) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const agent_details = await AgentModel.getSingleAgency(agency_id);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: {
          agency_id,
          agency_name: String(agent_details?.agency_name),
          agency_email: String(agent_details?.email),
          agency_logo: String(agent_details?.agency_logo),
          agency_address: String(agent_details?.address),
          user_id: checkAgentB2C.id,
          photo: checkAgentB2C.photo,
          user_email: checkAgentB2C.email,
          username: checkAgentB2C.username,
          gender: checkAgentB2C.gender,
          name: checkAgentB2C.name,
          phone_number: checkAgentB2C.phone_number,
          blog,
          flight,
          group_fare,
          holiday,
          hotel,
          umrah,
          visa,
        },
      };
    });
  }

  public async updateProfile(req: Request) {
    return this.db.transaction(async (trx) => {
      const { user_id, agency_id } = req.agencyB2CUser;
      const body = req.body as IUpdateAgentB2CProfileReqBody;
      const AgencyB2CUserModel = this.Model.AgencyB2CUserModel(trx);
      const checkAgentB2C = await AgencyB2CUserModel.checkUser({
        id: user_id,
        agency_id,
      });

      if (!checkAgentB2C) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
      const files = (req.files as Express.Multer.File[]) || [];
      const payload: IUpdateAgencyB2CUserPayload = { ...body };

      if (files.length === 1 || files.length === 0) {
        files.forEach(async (file) => {
          payload.photo = file.filename;
        });
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }

      if (!Object.keys(payload).length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }

      await AgencyB2CUserModel.updateUser(payload, user_id, agency_id);

      if (checkAgentB2C.photo && payload.photo) {
        await this.manageFile.deleteFromCloud([checkAgentB2C.photo]);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          photo: payload.photo,
        },
      };
    });
  }

  public async changePassword(req: Request) {
    const { user_id, agency_id } = req.agencyB2CUser;
    const { new_password, old_password } =
      req.body as IAgentB2CChangePasswordReqBody;
    const AgencyB2CUserModel = this.Model.AgencyB2CUserModel();

    const checkUser = await AgencyB2CUserModel.checkUser({
      id: user_id,
      agency_id,
    });

    if (!checkUser) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const checkPass = await Lib.compareHashValue(
      old_password,
      checkUser.password_hash
    );

    if (!checkPass) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: 'Old password does not match.',
      };
    }

    const password_hash = await Lib.hashValue(new_password);

    await AgencyB2CUserModel.updateUser({ password_hash }, user_id, agency_id);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.PASSWORD_CHANGED,
    };
  }
}
