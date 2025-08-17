import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import { SOURCE_AGENT } from '../../../../utils/miscellaneous/constants';
import { IGetVisaListQuery } from '../../utils/types/agentB2CSubTypes/agentB2CSubVisa.types';

export class AgentB2CSubVisaService extends AbstractServices {
  public async createVisa(req: Request) {
    const { agency_id, user_id } = req.agencyUser;

    const model = this.Model.VisaModel();

    const files = (req.files as Express.Multer.File[]) || [];

    const reqBody = req.body;
    const { slug, ...payload } = reqBody;

    const check_slug = await model.checkVisa({
      slug,
      is_deleted: false,
      source_id: agency_id,
    });

    if (check_slug.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: this.ResMsg.SLUG_EXISTS,
      };
    }

    payload.slug = slug;
    payload.source_type = SOURCE_AGENT;
    payload.source_id = agency_id;
    payload.created_by = user_id;

    const image = files.find((file) => file.fieldname === 'image');

    if (!image) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: 'Image is required',
      };
    }

    payload.image = image.filename;

    await model.createVisa(payload);

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: 'Visa created successfully',
    };
  }

  public async getVisaList(req: Request) {
    const { filter, country_id, limit, skip, status } = req.query as unknown as IGetVisaListQuery;
    const { agency_id } = req.agencyUser;

    const visaModel = this.Model.VisaModel();

    const { data, total } = await visaModel.getVisaList({
      filter,
      country_id,
      source_id: agency_id,
      source_type: SOURCE_AGENT,
      status,
      limit,
      skip,
      is_deleted: false,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  public async getSingleVisa(req: Request) {
    const { id } = req.params;
    const { agency_id } = req.agencyUser;
    const visaModel = this.Model.VisaModel();

    const data = await visaModel.getSingleVisa({
      is_deleted: false,
      source_id: agency_id,
      source_type: SOURCE_AGENT,
      id: Number(id),
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
  }

  public async updateVisa(req: Request) {
    const { id } = req.params;
    const { agency_id } = req.agencyUser;

    const visaModel = this.Model.VisaModel();

    const checkExist = await visaModel.getSingleVisa({
      is_deleted: false,
      source_id: agency_id,
      source_type: SOURCE_AGENT,
      id: Number(id),
    });

    if (!checkExist) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const payload = req.body;

    if (payload.slug) {
      const check_slug = await visaModel.checkVisa({
        is_deleted: false,
        source_id: agency_id,
        slug: payload.slug,
      });

      if (check_slug.length && check_slug[0].id !== Number(id)) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: this.ResMsg.SLUG_EXISTS,
        };
      }
    }

    const files = (req.files as Express.Multer.File[]) || [];

    const image = files.find((file) => file.fieldname === 'image');

    const deleteImage: string[] = [];
    if (image) {
      payload.image = image.filename;
      deleteImage.push(checkExist.image);
    }

    if (Object.entries(payload).length) {
      await visaModel.updateVisa(payload, Number(id));
    }

    if (deleteImage.length) {
      this.manageFile.deleteFromCloud(deleteImage);
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Visa updated successfully',
    };
  }

  public async deleteVisa(req: Request) {
    const { id } = req.params;
    const { agency_id } = req.agencyUser;

    const visaModel = this.Model.VisaModel();

    const checkExist = await visaModel.getSingleVisa({
      is_deleted: false,
      source_id: agency_id,
      source_type: SOURCE_AGENT,
      id: Number(id),
    });

    if (!checkExist) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    await visaModel.updateVisa({ is_deleted: true }, Number(id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Visa deleted successfully',
    };
  }
}
