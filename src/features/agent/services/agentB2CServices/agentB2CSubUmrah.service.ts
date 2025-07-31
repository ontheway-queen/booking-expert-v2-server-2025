import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import { SOURCE_TYPE } from '../../../../utils/miscellaneous/umrahConstants';

export class AgentB2CSubUmrahService extends AbstractServices {
  public async createUmrahPackage(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;
      const model = this.Model.UmrahPackageModel(trx);
      const files = (req.files as Express.Multer.File[]) || [];

      const reqBody = req.body;
      const { slug, package_include, ...payload } = reqBody;

      const check_slug = await model.getSingleAgentB2CUmrahPackageDetails({
        slug: slug,
        source_id: agency_id,
      });

      if (check_slug) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: this.ResMsg.SLUG_EXISTS,
        };
      }

      payload.slug = slug;
      payload.source_type = SOURCE_TYPE.AGENT;
      payload.source_id = agency_id;
      payload.created_by = user_id;

      const res = await model.insertUmrahPackage(payload);

      const imagePayload: {
        umrah_id: number;
        image: string;
      }[] = [];

      if (res.length) {
        files.forEach((file) => {
          imagePayload.push({
            umrah_id: res[0].id,
            image: file.filename,
          });
        });

        await model.insertUmrahPackageImage(imagePayload);
      }
    });
  }
}
