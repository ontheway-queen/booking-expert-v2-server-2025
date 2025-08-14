import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import { SOURCE_AGENT } from '../../../../utils/miscellaneous/constants';

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
}
