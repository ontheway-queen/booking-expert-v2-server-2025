import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import Lib from '../../../utils/lib/lib';
import {
  IAgencyUserChangePassReqBody,
  IUpdateAgentProfileReqBody,
} from '../utils/types/agentProfile.types';
import { IUpdateAgencyUserPayload } from '../../../utils/modelTypes/agentModel/agencyUserModelTypes';

export default class AgentProfileService extends AbstractServices {
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
      const wPermissions = await AgentModel.getWhiteLabelPermission({
        agency_id,
      });

      if (wPermissions) {
        const { token, ...rest } = wPermissions;
        whiteLabelPermissions = rest;
      }
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

    const checkPass = await Lib.compareHashValue(
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
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.PASSWORD_CHANGED,
    };
  }

  public async getDashboardData(req: Request) {
    const { agency_id } = req.agencyUser;
    const agencyModel = this.Model.AgencyModel();

    const agency = await agencyModel.checkAgency({ agency_id });

    const balance = await agencyModel.getAgencyBalance(agency_id);

    const kam = {
      name: 'Not available',
      phone: 'Not available',
      email: 'Not available',
    };

    if (agency?.kam_id) {
      const adminModel = this.Model.AdminModel();

      const admin = await adminModel.getSingleAdmin({ id: agency.kam_id });

      if (admin) {
        kam.email = admin.email;
        kam.name = admin.name;
        kam.phone = admin.phone_number;
      }
    }

    const dashboardData = await agencyModel.getDashboardData(agency_id);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        balance: {
          balance,
          usable_loan: agency?.usable_loan,
        },
        kam,
        dashboard: dashboardData,
      },
    };
  }

  public async searchData(req: Request) {
    return this.db.transaction(async (trx) => {
      const filter = req.query.filter as string;
      const { agency_id } = req.agencyUser;

      const agencyModel = this.Model.AgencyModel(trx);
      const data = await agencyModel.searchModel(filter, agency_id);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data,
      };
    });
  }
}
