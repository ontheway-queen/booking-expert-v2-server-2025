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
      const { slug, package_includes, ...payload } = reqBody;
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

      const imagePayload: {
        umrah_id: number;
        image: string;
        image_name: string;
      }[] = [];

      files.forEach((file) => {
        if (file.fieldname === 'thumbnail') {
          payload.thumbnail = file.filename;
        } else {
          imagePayload.push({
            umrah_id: 0,
            image: file.filename,
            image_name: file.originalname,
          });
        }
      });

      const res = await model.insertUmrahPackage(payload);

      if (res.length) {
        if (imagePayload.length) {
          const newImgPayload = imagePayload.map((imgItem) => {
            return {
              umrah_id: res[0].id,
              image: imgItem.image,
              image_name: imgItem.image_name,
            };
          });
          await model.insertUmrahPackageImage(newImgPayload);
        }

        if (package_includes?.length) {
          const include_service_payload: {
            umrah_id: number;
            service_name: string;
          }[] = [];

          package_includes.forEach((service_name: string) => {
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
        message: 'Umrah package created successfully',
        data: {
          id: res[0].id,
        },
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

    const images = await model.getSingleUmrahPackageImages({
      umrah_id: Number(id),
    });

    const package_includes = await model.getSingleUmrahPackageIncludedService({
      umrah_id: Number(id),
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...data,
        images: images || [],
        package_includes: package_includes || [],
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
      const {
        add_package_include,
        remove_images,
        remove_package_include,
        ...payload
      } = reqBody;

      if (payload?.slug) {
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
      if (remove_images?.length) {
        const removeImage: string[] = [];
        for (const image_id of remove_images) {
          const image = await model.getSingleUmrahPackageImage({ image_id });
          if (!image) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: this.ResMsg.HTTP_NOT_FOUND,
            };
          } else {
            removeImage.push(image.image);
          }
          await model.deleteUmrahPackageImage({ image_id });
        }

        await this.manageFile.deleteFromCloud(removeImage);
      }

      //remove included services
      if (remove_package_include?.length) {
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

      //update images
      if (files?.length) {
        const imagePayload: {
          umrah_id: number;
          image: string;
          image_name: string;
        }[] = [];

        for (const file of files) {
          if (file.fieldname === 'thumbnail') {
            payload.thumbnail = file.filename;
            await this.manageFile.deleteFromCloud([check.thumbnail]);
          } else {
            imagePayload.push({
              umrah_id: Number(id),
              image: file.filename,
              image_name: file.originalname,
            });
          }
        }
        if (imagePayload.length) {
          await model.insertUmrahPackageImage(imagePayload);
        }
      }

      if (Object.keys(payload).length) {
        await model.updateUmrahPackage({ data: payload, umrah_id: Number(id) });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Umrah package updated successfully',
      };
    });
  }

  //delete umrah package
  public async deleteUmrahPackage(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const packageModel = this.Model.UmrahPackageModel(trx);
      const data = await packageModel.getSingleUmrahPackage({
        umrah_id: Number(id),
      });

      const bookingModel = this.Model.UmrahBookingModel(trx);
      const booking = await bookingModel.checkBookingExistByUmrahId({
        umrah_id: Number(id),
      });

      if (booking.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: `You can't delete this package because ${
            booking.length > 1
              ? `${booking.length} bookings`
              : `${booking.length} booking`
          } found for this package`,
        };
      }

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
      await packageModel.updateUmrahPackage({
        umrah_id: Number(id),
        data: { is_deleted: true },
      });
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Umrah package deleted successfully',
      };
    });
  }

  // get umrah booking
  public async getUmrahBooking(req: Request) {
    const { agency_id } = req.agencyUser;
    const query = req.query as {
      limit?: string;
      skip?: string;
      from_date?: string;
      to_date?: string;
      status?: string;
      user_id?: number;
    };

    const model = this.Model.UmrahBookingModel();

    const data = await model.getAgentB2CUmrahBookingList(
      { agency_id, ...query },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: data.data,
      total: data.total,
    };
  }

  // get single umrah booking
  public async getSingleUmrahBooking(req: Request) {
    const { agency_id } = req.agencyUser;
    const { id } = req.params;
    const booking_id = Number(id);
    const UmrahBookingModel = this.Model.UmrahBookingModel();

    const data = await UmrahBookingModel.getSingleAgentB2CUmrahBookingDetails({
      id: booking_id,
      source_id: agency_id,
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const contact = await UmrahBookingModel.getUmrahBookingContacts(booking_id);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...data,
        contact,
      },
    };
  }
}
