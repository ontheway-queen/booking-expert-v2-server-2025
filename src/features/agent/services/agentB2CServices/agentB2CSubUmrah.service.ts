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
        source_id: agency_id,
        slug,
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
      payload.thumbnail = files.find((file) => file.fieldname === 'thumbnail')?.filename;

      console.log({ payload });

      const res = await model.insertUmrahPackage(payload);

      if (res.length) {
        if (files.length) {
          const imagePayload: {
            umrah_id: number;
            image: string;
          }[] = [];

          files.forEach((file) => {
            imagePayload.push({
              umrah_id: res[0].id,
              image: file.filename,
            });
          });

          await model.insertUmrahPackageImage(imagePayload);
        }

        if (package_include?.length) {
          const include_service_payload: {
            umrah_id: number;
            service_name: string;
          }[] = [];
          package_include.forEach(async (service_name: string) => {
            include_service_payload.push({
              umrah_id: res[0].id,
              service_name,
            });
          });

          await model.insertPackageInclude(include_service_payload);
        }
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
          message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
        };
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
