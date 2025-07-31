import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import { SOURCE_AGENT } from '../../../../utils/miscellaneous/constants';

export class AgentB2CSubUmrahService extends AbstractServices {
  //create umrah package
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
      payload.source_type = SOURCE_AGENT;
      payload.source_id = agency_id;
      payload.created_by = user_id;
      payload.thumbnail = files.find(
        (file) => file.fieldname === 'thumbnail'
      )?.filename;

      const res = await model.insertUmrahPackage(payload);

      if (res.length) {
        if (files.length) {
          const imagePayload: {
            umrah_id: number;
            image: string;
          }[] = [];

          files.forEach((file) => {
            if (file.fieldname !== 'thumbnail') {
              imagePayload.push({
                umrah_id: res[0].id,
                image: file.filename,
              });
            }
          });

          await model.insertUmrahPackageImage(imagePayload);
        }

        if (package_include?.length) {
          const include_service_payload: {
            umrah_id: number;
            service_name: string;
          }[] = [];
          package_include.forEach((service_name: string) => {
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

  //get umrah package list
  public async getUmrahPackageList(req: Request) {
    const { agency_id } = req.agencyUser;

    const { limit, skip, status, filter } = req.query as unknown as {
      limit: number;
      skip: number;
      status: boolean;
      filter: string;
    };

    const model = this.Model.UmrahPackageModel();

    const { data, total } = await model.getUmrahPackageList({
      source_id: agency_id,
      source_type: SOURCE_AGENT,
      status,
      limit,
      skip,
      filter,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      total,
      data,
    };
  }

  //get single umrah package
  public async getSingleUmrahPackage(req: Request) {
    const { id } = req.params;
    const model = this.Model.UmrahPackageModel();

    const data = await model.getSingleUmrahPackage({ umrah_id: Number(id) });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const images = await model.getSingleUmrahPackageImages({ umrah_id: Number(id) });

    const included_services = await model.getSingleUmrahPackageIncludedService({
      umrah_id: Number(id),
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...data,
        images: images || [],
        included_services: included_services || [],
      },
    };
  }

  //update umrah package
  public async updateUmrahPackage(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const model = this.Model.UmrahPackageModel(trx);
      const files = (req.files as Express.Multer.File[]) || [];
      const { id } = req.params;

      const check = await model.getSingleUmrahPackage({
        umrah_id: Number(id),
      });

      if (!check) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const reqBody = req.body;
      const { add_package_include, remove_images, remove_package_include, ...payload } = reqBody;

      if (payload.slug) {
        const check_slug = await model.getSingleAgentB2CUmrahPackageDetails({
          source_id: agency_id,
          slug: payload.slug,
        });

        if (check_slug && check_slug.id !== Number(id)) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: this.ResMsg.SLUG_EXISTS,
          };
        }
      }

      //remove images
      if (remove_images.length) {
        const removeImage: string[] = [];
        for (const image_id of remove_images) {
          const image = await model.getSingleUmrahPackageImage({ image_id });
          if (image) {
            removeImage.push(image.image);
          }
          await model.deleteUmrahPackageImage({ image_id });
        }

        await this.manageFile.deleteFromCloud(removeImage);
      }

      //remove included services
      if (remove_package_include.length) {
        for (const service_id of remove_package_include) {
          await model.deleteUmrahPackageIncludedService({ id: service_id });
        }
      }

      //add new included services
      if (add_package_include?.length) {
        const include_service_payload: {
          umrah_id: number;
          service_name: string;
        }[] = [];
        add_package_include.forEach((service_name: string) => {
          include_service_payload.push({
            umrah_id: Number(id),
            service_name,
          });
        });

        await model.insertPackageInclude(include_service_payload);
      }

      if (files.length) {
        const imagePayload: {
          umrah_id: number;
          image: string;
        }[] = [];

        files.forEach((file) => {
          if (file.fieldname !== 'thumbnail') {
            imagePayload.push({
              umrah_id: Number(id),
              image: file.filename,
            });
          }
        });

        await model.insertUmrahPackageImage(imagePayload);
      }

      if (files.length) {
        for (const file of files) {
          if (file.fieldname === 'thumbnail') {
            payload.thumbnail = file.filename;
            await this.manageFile.deleteFromCloud([check.thumbnail]);
          }
        }
      }

      await model.updateUmrahPackage({ data: payload, umrah_id: Number(id) });


      return{
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK
      }
    });
  }
}
