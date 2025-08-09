import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";
import { SOURCE_AGENT } from "../../../utils/miscellaneous/constants";
import { ICreateSubAgentTravelerReqBody } from "../utils/types/subAgentTraveler.types";

export class SubAgentTravelerService extends AbstractServices {
  public async createTraveler(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;
      const travelerModel = this.Model.TravelerModel(trx);
      const body = req.body as ICreateSubAgentTravelerReqBody;
      const files = (req.files as Express.Multer.File[]) || [];
      if (files?.length) {
        files.forEach((file) => {
          if (file.fieldname === "visa_file") {
            body.visa_file = file.filename;
          } else if (file.fieldname === "passport_file") {
            body.passport_file = file.filename;
          }
        });
      }
      const res = await travelerModel.insertTraveler({
        ...body,
        created_by: user_id,
        source_type: SOURCE_AGENT,
        source_id: agency_id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Traveler has been created successfully",
        data: {
          id: res[0]?.id,
        },
      };
    });
  }

  public async getAllTraveler(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const travelerModel = this.Model.TravelerModel(trx);
      const query = req.query;
      const data = await travelerModel.getTravelerList(
        {
          source_type: SOURCE_AGENT,
          source_id: agency_id,
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
      const { agency_id } = req.agencyUser;
      const travelerModel = this.Model.TravelerModel(trx);
      const { id } = req.params;
      const data = await travelerModel.getSingleTraveler({
        source_type: SOURCE_AGENT,
        source_id: agency_id,
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
      const { agency_id } = req.agencyUser;
      const travelerModel = this.Model.TravelerModel(trx);
      const { id } = req.params;
      const data = await travelerModel.getSingleTraveler({
        source_type: SOURCE_AGENT,
        source_id: agency_id,
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
          if (file.fieldname === "visa_file") {
            body.visa_file = file.filename;
          } else if (file.fieldname === "passport_file") {
            body.passport_file = file.filename;
          }
        });
      }

      await travelerModel.updateTraveler(body, Number(id));

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Traveler has been updated",
      };
    });
  }

  public async deleteTraveler(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const travelerModel = this.Model.TravelerModel(trx);
      const { id } = req.params;
      const data = await travelerModel.getSingleTraveler({
        source_type: SOURCE_AGENT,
        source_id: agency_id,
        id: Number(id),
      });
      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.StatusCode.HTTP_NOT_FOUND,
        };
      }

      await travelerModel.deleteTraveler(Number(id));

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Traveler has been deleted",
      };
    });
  }
}
