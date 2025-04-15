import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { ITokenParseAgencyUser } from '../../public/utils/types/publicCommon.types';
import Lib from '../../../utils/lib/lib';
import config from '../../../config/config';
import {
  IAgencyUserChangePassReqBody,
  IUpdateAgentProfileReqBody,
} from '../utils/types/agentProfile.types';
import { IUpdateAgencyUserPayload } from '../../../utils/modelTypes/agentModel/agencyUserModelTypes';

export default class AdminProfileService extends AbstractServices {
  constructor() {
    super();
  }

  public async getProfile(req: Request) {
    const { user_id, agency_id } = req.agencyUser;
    const agencyUserModel = this.Model.AgencyUserModel();
    const AgentModel = this.Model.AgencyModel();

    const user = await agencyUserModel.checkUser({ id: user_id, agency_id });

    if (!user) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const role = await agencyUserModel.getSingleRoleWithPermissions(
      user.role_id,
      agency_id
    );

    const tokenData: ITokenParseAgencyUser = {
      agency_email: user.agency_email,
      agency_id: user.agency_id,
      agency_name: user.agency_name,
      is_main_user: user.is_main_user,
      name: user.name,
      photo: user.photo,
      user_email: user.email,
      user_id: user.id,
      username: user.username,
      phone_number: user.phone_number,
    };

    const token = Lib.createToken(tokenData, config.JWT_SECRET_AGENT, '24h');

    let whiteLabelPermissions = {
      flight: false,
      hotel: false,
      visa: false,
      holiday: false,
      umrah: false,
      group_fare: false,
      blog: false,
    };

    if (user.white_label) {
      const wPermissions = await AgentModel.getWhiteLabelPermission(agency_id);
      const { token, ...rest } = wPermissions;
      whiteLabelPermissions = rest;
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.LOGIN_SUCCESSFUL,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        two_fa: user.two_fa,
        status: user.status,
        photo: user.photo,
        is_main_user: user.is_main_user,
        agency: {
          agency_id,
          agent_no: user.agent_no,
          agency_email: user.agency_email,
          agency_name: user.agency_name,
          agency_status: user.agency_status,
          phone_number: user.phone_number,
          agency_logo: user.agency_logo,
        },
        role,
        white_label: user.white_label,
        whiteLabelPermissions,
      },
      token,
    };
  }

  public async updateProfile(req: Request) {
    return this.db.transaction(async (trx) => {
      const { user_id, photo, agency_id } = req.agencyUser;
      const body = req.body as IUpdateAgentProfileReqBody;
      const agencyUserModel = this.Model.AgencyUserModel(trx);

      const files = (req.files as Express.Multer.File[]) || [];
      const payload: IUpdateAgencyUserPayload = { ...body };

      if (files.length === 1 || files.length === 0) {
        files.forEach((file) => {
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

      await agencyUserModel.updateUser(payload, { agency_id, id: user_id });

      if (photo && payload.photo) {
        await this.manageFile.deleteFromCloud([photo]);
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
    const { user_id, agency_id } = req.agencyUser;
    const { new_password, old_password } =
      req.body as IAgencyUserChangePassReqBody;
    const agencyUserModel = this.Model.AgencyUserModel();

    const checkUser = await agencyUserModel.checkUser({
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

    const checkPass = Lib.compareHashValue(
      old_password,
      checkUser.hashed_password
    );

    if (!checkPass) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: 'Old password does not match.',
      };
    }

    const hashed_password = await Lib.hashValue(new_password);

    await agencyUserModel.updateUser(
      { hashed_password },
      { id: user_id, agency_id }
    );

    return {
      success: false,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.PASSWORD_CHANGED,
    };
  }
}
