import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import {
  AdminAgentGetAgencyReqQuery,
  AdminAgentUpdateAgencyReqBody,
} from '../../utils/types/adminAgentAgency.types';
import CustomError from '../../../../utils/lib/customError';
import { IUpdateAgencyPayload } from '../../../../utils/modelTypes/agentModel/agencyModelTypes';

export default class AdminAgentAgencyService extends AbstractServices {
  constructor() {
    super();
  }

  public async getAgency(req: Request) {
    const query = req.query as unknown as AdminAgentGetAgencyReqQuery;
    const AgencyModel = this.Model.AgencyModel();

    const data = await AgencyModel.getAgencyList(query, true);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: data.data,
      total: data.total,
    };
  }

  public async getSingleAgency(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const agency_id = Number(id);
      const AgencyModel = this.Model.AgencyModel(trx);

      const data = await AgencyModel.getSingleAgency(agency_id);

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      let whiteLabelPermissions = {
        flight: false,
        hotel: false,
        visa: false,
        holiday: false,
        umrah: false,
        group_fare: false,
        blog: false,
        token: '',
      };

      if (data.white_label) {
        const wPermissions = await AgencyModel.getWhiteLabelPermission(
          agency_id
        );
        whiteLabelPermissions = wPermissions;
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { ...data, whiteLabelPermissions },
      };
    });
  }

  public async updateAgency(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const agency_id = Number(id);
      const AgentModel = this.Model.AgencyModel(trx);
      const checkAgency = await AgentModel.checkAgency({
        agency_id,
      });

      if (!checkAgency) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND
        );
      }
      const { user_id } = req.admin;
      const { status, white_label_permissions, white_label, ...restBody } =
        req.body as AdminAgentUpdateAgencyReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      const payload: IUpdateAgencyPayload = { ...restBody };

      files.forEach((file) => {
        switch (file.fieldname) {
          case 'logo':
            payload.agency_logo = file.filename;
            break;
          case 'civil_aviation':
            payload.civil_aviation = file.filename;
            break;
          case 'trade_license':
            payload.trade_license = file.filename;
            break;
          case 'national_id':
            payload.national_id = file.filename;
            break;
          default:
            throw new CustomError(
              'Invalid files. Please provide valid trade license, civil aviation, NID, logo.',
              this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
            );
        }
      });

      if (status) {
        payload.status = status;
      }

      if (white_label !== undefined) {
        if (white_label === true) {
        }
      }

      if (white_label_permissions || white_label) {
        const checkPermission = await AgentModel.getWhiteLabelPermission(
          agency_id
        );

        if (checkPermission && white_label_permissions) {
          await AgentModel.updateWhiteLabelPermission(
            white_label_permissions,
            agency_id
          );
        } else {
          // await AgentModel.createWhiteLabelPermission()
        }
      }

      await AgentModel.updateAgency(payload, agency_id);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
