import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import { SOURCE_SUB_AGENT } from '../../../../utils/miscellaneous/constants';

export class AgentSubAgentVisaService extends AbstractServices {
  constructor() {
    super();
  }

  public async getApplicationList(req: Request) {
    const { agency_id } = req.agencyUser;
    const { filter, from_date, to_date, status, limit, skip } = req.query;

    const visaApplicationModel = this.Model.VisaApplicationModel();

    const { data, total } =
      await visaApplicationModel.getAllAgentB2CVisaApplication({
        source_id: agency_id,
        source_type: SOURCE_SUB_AGENT,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  public async getSingleVisaApplication(req: Request) {
    const { id } = req.params;
    const { agency_id } = req.agencyUser;

    const visaApplicationModel = this.Model.VisaApplicationModel();

    const data =
      await visaApplicationModel.getAgentB2CSingleVisaApplicationForAgent({
        id: Number(id),
        source_id: agency_id,
        source_type: SOURCE_SUB_AGENT,
      });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const passengers =
      await visaApplicationModel.getAgentB2CSingleVisaApplicationTraveler({
        application_id: data.id,
      });

    const trackings = await visaApplicationModel.getVisaApplicationTrackingList(
      {
        application_id: data.id,
      }
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...data,
        passengers,
        trackings,
      },
    };
  }

  public async updateVisaApplication(req: Request) {
    return this.db.transaction(async (trx) => {
      const { status, details } = req.body;
      const { agency_id } = req.agencyUser;
      const { id } = req.params;
      const numberId = Number(id);

      const visaApplicationModel = this.Model.VisaApplicationModel(trx);
      const checkExist =
        await visaApplicationModel.getAgentB2CSingleVisaApplicationForAgent({
          id: numberId,
          source_id: agency_id,
          source_type: SOURCE_SUB_AGENT,
        });

      if (!checkExist) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      // update status
      await visaApplicationModel.updateVisaApplication({ status }, numberId);

      //add application tracking
      await visaApplicationModel.createVisaApplicationTracking({
        details,
        application_id: numberId,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
