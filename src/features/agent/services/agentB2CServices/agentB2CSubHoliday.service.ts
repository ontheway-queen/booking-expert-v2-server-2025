import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import {
  IAgencyB2CUpdateHolidayPackageReqBody,
  ICreateAgencyB2CHolidayReqBody,
} from '../../utils/types/agentB2CTypes/agentB2CSubHoliday.types';
import {
  HOLIDAY_CREATED_BY_AGENT,
  HOLIDAY_FOR_AGENT_B2C,
} from '../../../../utils/miscellaneous/holidayConstants';
import { IGetHolidayPackageListFilterQuery } from '../../../../utils/modelTypes/holidayPackageModelTypes/holidayPackageModelTypes';

export class AgentB2CSubHolidayService extends AbstractServices {
  public async createHoliday(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id, agency_id } = req.agencyUser;
      const body = req.body as ICreateAgencyB2CHolidayReqBody;
      const { pricing, itinerary, services, city_id, ...rest } = body;
      const holidayPackageModel = this.Model.HolidayPackageModel(trx);
      const holidayPackageCityModel = this.Model.HolidayPackageCityModel(trx);
      const holidayPackagePricingModel =
        this.Model.HolidayPackagePricingModel(trx);
      const holidayPackageImagesModel =
        this.Model.HolidayPackageImagesModel(trx);
      const holidayPackageServiceModel =
        this.Model.HolidayPackageServiceModel(trx);
      const holidayPackageItineraryModel =
        this.Model.HolidayPackageItineraryModel(trx);

      //check slug
      const slugCheck = await holidayPackageModel.getHolidayPackageList({
        slug: rest.slug,
        created_by: HOLIDAY_CREATED_BY_AGENT,
        agency_id,
      });

      if (slugCheck.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: this.ResMsg.SLUG_ALREADY_EXISTS,
        };
      }

      //insert holiday package
      const holidayPackage = await holidayPackageModel.insertHolidayPackage({
        ...rest,
        created_by: HOLIDAY_CREATED_BY_AGENT,
        created_by_id: user_id,
        holiday_for: HOLIDAY_FOR_AGENT_B2C,
        agency_id,
      });

      //insert city
      const holidayPackageCityBody = city_id.map((item) => ({
        holiday_package_id: holidayPackage[0].id,
        city_id: item,
      }));
      await holidayPackageCityModel.createHolidayPackageCity(
        holidayPackageCityBody
      );

      //insert pricing
      await holidayPackagePricingModel.insertHolidayPackagePricing({
        ...pricing,
        holiday_package_id: holidayPackage[0].id,
        price_for: HOLIDAY_FOR_AGENT_B2C,
      });

      //insert itinerary
      const itinerary_body = itinerary.map((item) => ({
        ...item,
        holiday_package_id: holidayPackage[0].id,
      }));
      await holidayPackageItineraryModel.insertHolidayPackageItinerary(
        itinerary_body
      );

      //insert services
      const services_body = services.map((item) => ({
        ...item,
        holiday_package_id: holidayPackage[0].id,
      }));
      await holidayPackageServiceModel.insertHolidayPackageService(
        services_body
      );

      //insert images
      const image_body: { holiday_package_id: number; image: string }[] = [];
      const files = req.files as Express.Multer.File[];
      if (files.length) {
        for (const file of files) {
          image_body.push({
            holiday_package_id: holidayPackage[0].id,
            image: file.filename,
          });
        }
        await holidayPackageImagesModel.insertHolidayPackageImages(image_body);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Holiday package has been created successfully',
        data: {
          id: holidayPackage[0].id,
          image_body,
        },
      };
    });
  }

  public async getHolidayPackageList(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const query = req.query as unknown as IGetHolidayPackageListFilterQuery;
      query.created_by = HOLIDAY_CREATED_BY_AGENT;
      query.agency_id = agency_id;
      const holidayPackageModel = this.Model.HolidayPackageModel(trx);

      const data = await holidayPackageModel.getHolidayPackageList(query, true);
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        total: data.total,
        data: data.data,
      };
    });
  }

  public async getSingleHolidayPackage(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const { id } = req.params;
      const holidayPackageModel = this.Model.HolidayPackageModel(trx);
      const data = await holidayPackageModel.getSingleHolidayPackage({
        id: Number(id),
        created_by: HOLIDAY_CREATED_BY_AGENT,
        agency_id,
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
        data: data,
      };
    });
  }

  public async updateHolidayPackage(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const { id } = req.params;
      const body = req.body as IAgencyB2CUpdateHolidayPackageReqBody;
      const { pricing, itinerary, services, delete_images, city, ...rest } =
        body;
      const holidayPackageModel = this.Model.HolidayPackageModel(trx);
      const holidayPackageCityModel = this.Model.HolidayPackageCityModel(trx);
      const holidayPackagePricingModel =
        this.Model.HolidayPackagePricingModel(trx);
      const holidayPackageImagesModel =
        this.Model.HolidayPackageImagesModel(trx);
      const holidayPackageServiceModel =
        this.Model.HolidayPackageServiceModel(trx);
      const holidayPackageItineraryModel =
        this.Model.HolidayPackageItineraryModel(trx);

      const data = await holidayPackageModel.getSingleHolidayPackage({
        id: Number(id),
        created_by: HOLIDAY_CREATED_BY_AGENT,
        agency_id,
      });
      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Holiday package not found',
        };
      }

      //check slug
      if (rest.slug) {
        const slugCheck = await holidayPackageModel.getHolidayPackageList({
          slug: rest.slug,
          created_by: HOLIDAY_CREATED_BY_AGENT,
          agency_id,
        });
        if (
          slugCheck.data.length &&
          Number(slugCheck.data?.[0]?.id) !== Number(id)
        ) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: this.ResMsg.SLUG_ALREADY_EXISTS,
          };
        }
      }

      //update holiday package
      await holidayPackageModel.updateHolidayPackage(rest, Number(id));

      //update city
      if (city) {
        if (city.add?.length) {
          const cityInsertBody = city.add.map((item) => ({
            holiday_package_id: Number(id),
            city_id: item,
          }));
          await holidayPackageCityModel.createHolidayPackageCity(
            cityInsertBody
          );
        }
        if (city.delete?.length) {
          const cityDeleteBody = city.delete.map((item) => ({
            holiday_package_id: Number(id),
            city_id: item,
          }));
          await holidayPackageCityModel.deleteHolidayPackageCity(
            cityDeleteBody
          );
        }
      }

      //update pricing
      if (pricing) {
        if (pricing.update) {
          const { id, ...rest } = pricing.update;
          await holidayPackagePricingModel.updateHolidayPackagePricing(
            rest,
            id
          );
        }
      }

      //update itinerary
      if (itinerary) {
        if (itinerary.delete?.length) {
          await holidayPackageItineraryModel.deleteHolidayPackageItinerary(
            itinerary.delete
          );
        }
        if (itinerary.update?.length) {
          await Promise.all(
            itinerary.update.map(({ id, ...rest }) =>
              holidayPackageItineraryModel.updateHolidayPackageItinerary(
                rest,
                id
              )
            )
          );
        }
        if (itinerary.add?.length) {
          const itineraryBody = itinerary.add.map((item) => ({
            ...item,
            holiday_package_id: Number(id),
          }));
          await holidayPackageItineraryModel.insertHolidayPackageItinerary(
            itineraryBody
          );
        }
      }

      //update services
      if (services) {
        if (services.delete?.length) {
          await holidayPackageServiceModel.deleteHolidayPackageService(
            services.delete
          );
        }
        if (services.update?.length) {
          await Promise.all(
            services.update.map(({ id, ...rest }) =>
              holidayPackageServiceModel.updateHolidayPackageService(rest, id)
            )
          );
        }
        if (services.add?.length) {
          const servicesBody = services.add.map((item) => ({
            ...item,
            holiday_package_id: Number(id),
          }));
          await holidayPackageServiceModel.insertHolidayPackageService(
            servicesBody
          );
        }
      }

      //update images
      if (delete_images?.length) {
        const imageData =
          await holidayPackageImagesModel.getHolidayPackageImagesById(
            delete_images
          );
        const imagePaths = imageData.map((item) => item.image);
        await this.manageFile.deleteFromCloud(imagePaths);
        await holidayPackageImagesModel.deleteHolidayPackageImages(
          delete_images
        );
      }
      const files = (req.files as Express.Multer.File[]) || [];
      const imageBody: { holiday_package_id: number; image: string }[] = [];
      if (files.length) {
        for (const file of files) {
          imageBody.push({
            holiday_package_id: Number(id),
            image: file.filename,
          });
        }
        await holidayPackageImagesModel.insertHolidayPackageImages(imageBody);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Holiday package has been updated successfully',
        data: {
          imageBody,
        },
      };
    });
  }

  public async deleteHolidayPackage(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const { id } = req.params;
      const holidayPackageModel = this.Model.HolidayPackageModel(trx);
      const data = await holidayPackageModel.getSingleHolidayPackage({
        id: Number(id),
        created_by: HOLIDAY_CREATED_BY_AGENT,
        agency_id,
      });
      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Holiday package not found',
        };
      }
      await holidayPackageModel.updateHolidayPackage(
        { is_deleted: true },
        Number(id)
      );
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Holiday package has been deleted successfully',
      };
    });
  }
}
