import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import { AdminAgentGetAgencyReqQuery } from '../../utils/types/adminAgentAgency.types';

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

  public async updateAgency(req: Request) {}
}
