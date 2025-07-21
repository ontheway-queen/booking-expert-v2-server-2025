import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { SOURCE_AGENT_B2C } from '../../../utils/miscellaneous/constants';
import { ICreateAgentB2CTravelerReqBody } from '../utils/types/agentB2CTraveler.types';

export default class AgentB2CTravelerService extends AbstractServices {
  constructor() {
    super();
  }

  public async createTraveler(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyB2CUser;
      const travelerModel = this.Model.TravelerModel(trx);
      const body = req.body as ICreateAgentB2CTravelerReqBody;
      const files = (req.files as Express.Multer.File[]) || [];
      if (files?.length) {
        files.forEach((file) => {
          if (file.fieldname === 'visa_file') {
            body.visa_file = file.filename;
          } else if (file.fieldname === 'passport_file') {
            body.passport_file = file.filename;
          }
        });
      }

      const res = await travelerModel.insertTraveler({
        ...body,
        created_by: user_id,
        source_type: SOURCE_AGENT_B2C,
        source_id: agency_id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Traveler has been created successfully',
        data: {
          id: res[0]?.id,
        },
      };
    });
  }

  public async getAllTraveler(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyB2CUser;
      const travelerModel = this.Model.TravelerModel(trx);
      const query = req.query;
      const data = await travelerModel.getTravelerList(
        {
          source_type: SOURCE_AGENT_B2C,
          source_id: agency_id,
          created_by: user_id,
          ...query,
        },
        true
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        total: data.total,
        data: data.data,
      };
    });
  }

  public async getSingleTraveler(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyB2CUser;
      const travelerModel = this.Model.TravelerModel(trx);
      const { id } = req.params;
      const data = await travelerModel.getSingleTraveler({
        source_type: SOURCE_AGENT_B2C,
        source_id: agency_id,
        created_by: user_id,
        id: Number(id),
      });
      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.StatusCode.HTTP_NOT_FOUND,
        };
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        data,
      };
    });
  }

  public async updateTraveler(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyB2CUser;
      const travelerModel = this.Model.TravelerModel(trx);
      const { id } = req.params;
      const data = await travelerModel.getSingleTraveler({
        source_type: SOURCE_AGENT_B2C,
        source_id: agency_id,
        created_by: user_id,
        id: Number(id),
      });
      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.StatusCode.HTTP_NOT_FOUND,
        };
      }
      const body = req.body;
      const files = (req.files as Express.Multer.File[]) || [];
      if (files?.length) {
        files.forEach((file) => {
          if (file.fieldname === 'visa_file') {
            body.visa_file = file.filename;
          } else if (file.fieldname === 'passport_file') {
            body.passport_file = file.filename;
          }
        });
      }

      await travelerModel.updateTraveler(body, Number(id));

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Traveler has been updated',
      };
    });
  }

  public async deleteTraveler(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyB2CUser;
      const travelerModel = this.Model.TravelerModel(trx);
      const { id } = req.params;
      const data = await travelerModel.getSingleTraveler({
        source_type: SOURCE_AGENT_B2C,
        source_id: agency_id,
        created_by: user_id,
        id: Number(id),
      });
      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await travelerModel.deleteTraveler(Number(id));

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Traveler has been deleted',
      };
    });
  }
}
