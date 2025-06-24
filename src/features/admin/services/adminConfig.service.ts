import AbstractServices from '../../../abstract/abstract.service';
import { Request } from 'express';
import {
  ICheckSlug,
  ICreateAirlinesReqBody,
  ICreateAirportReqBody,
  IUpdateAirportReqBody,
} from '../utils/types/adminConfig.types';
import { SLUG_TYPE_HOLIDAY } from '../../../utils/miscellaneous/constants';
import { HOLIDAY_CREATED_BY_ADMIN } from '../../../utils/miscellaneous/holidayConstants';
import {
  ICreateAirlinesPayload,
  IUpdateAirlinesPayload,
} from '../../../utils/modelTypes/commonModelTypes/commonModelTypes';

export class AdminConfigService extends AbstractServices {
  public async checkSlug(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { slug, type } = req.query as unknown as ICheckSlug;

      if (type === SLUG_TYPE_HOLIDAY) {
        const holidayModel = this.Model.HolidayPackageModel(trx);
        const check_slug = await holidayModel.getHolidayPackageList({
          slug,
          created_by: HOLIDAY_CREATED_BY_ADMIN,
        });
        if (check_slug.data.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: this.ResMsg.SLUG_ALREADY_EXISTS,
          };
        }
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.AVAILABLE_SLUG,
      };
    });
  }

  //get all city
  public async getAllCity(req: Request) {
    const model = this.Model.CommonModel();
    const city_list = await model.getCity(req.query, true);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: city_list.data,
      total: city_list.total,
    };
  }

  public async createCity(req: Request) {
    const body = req.body;
    const model = this.Model.CommonModel();

    await model.insertCity(body);

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  public async updateCity(req: Request) {
    const body = req.body as {
      country_id?: number;
      name?: string;
      code?: string;
      lat?: string;
      lng?: string;
    };

    const id = req.params.id;
    const model = this.Model.CommonModel();

    await model.updateCity(body, Number(id));

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  public async deleteCity(req: Request) {
    const id = req.params.id;
    const model = this.Model.CommonModel();

    await model.deleteCity(Number(id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  //get all airport
  public async getAllAirport(req: Request) {
    const model = this.Model.CommonModel();
    const get_airport = await model.getAirport(req.query, true);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: get_airport.data,
      total: get_airport.total,
    };
  }

  public async createAirport(req: Request) {
    const body = req.body as ICreateAirportReqBody;
    const model = this.Model.CommonModel();

    const checkAirport = await model.getAirlineByCode(body.iata_code);

    if (checkAirport.name !== 'Not available') {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: 'Airport code already exist.',
      };
    }

    await model.insertAirport(body);

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  //update airport
  public async updateAirport(req: Request) {
    const airport_id = req.params.id;
    const body = req.body as IUpdateAirportReqBody;
    const model = this.Model.CommonModel();
    const update_airport = await model.updateAirport(body, Number(airport_id));

    if (update_airport > 0) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
  }

  //delete airport
  public async deleteAirport(req: Request) {
    const airport_id = req.params.id;
    const model = this.Model.CommonModel();
    const del_airport = await model.deleteAirport(Number(airport_id));

    if (del_airport > 0) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
  }

  public async getAllAirlines(req: Request) {
    const model = this.Model.CommonModel();
    const get_airlines = await model.getAirlines(req.query, true);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: get_airlines.data,
      total: get_airlines.total,
    };
  }

  public async createAirlines(req: Request) {
    const files = (req.files as Express.Multer.File[]) || [];
    const model = this.Model.CommonModel();
    const body = req.body as ICreateAirlinesReqBody;
    const check = await model.getAirlineByCode(body.code);

    if (check.name !== 'Not available') {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: 'Airlines code already exist.',
      };
    }

    const payload: ICreateAirlinesPayload = { ...req.body, logo: '' };

    if (files?.length) {
      payload.logo = files[0].filename;
    }

    await model.insertAirline(payload);

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  //update airline
  public async updateAirlines(req: Request) {
    const airlines_id = req.params.id;
    const model = this.Model.CommonModel();

    const check = await model.getAirlineById(Number(airlines_id));

    if (!check) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const files = (req.files as Express.Multer.File[]) || [];

    const body: IUpdateAirlinesPayload = { ...req.body };
    if (files?.length) {
      body.logo = files[0].filename;
    }

    await model.updateAirlines(body, Number(airlines_id));

    if (check.logo && body.logo) {
      await this.manageFile.deleteFromCloud([check.logo]);
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  //delete airline
  public async deleteAirlines(req: Request) {
    const airlines_id = req.params.id;
    const model = this.Model.CommonModel();

    const check = await model.getAirlineById(Number(airlines_id));

    if (!check) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    await model.deleteAirlines(Number(airlines_id));

    if (check.logo) {
      await this.manageFile.deleteFromCloud([check.logo]);
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  // get b2c markup
  public async getB2CMarkupSet(_req: Request) {
    const model = this.Model.B2CMarkupConfigModel();
    const b2c_markup = await model.getB2CMarkupConfigData('Both');

    const data: any = {};

    b2c_markup.forEach((markup) => {
      if (markup.type === 'Flight') {
        data.flight_markup_set = { ...markup };
      }
      if (markup.type === 'Hotel') {
        data.hotel_markup_set = { ...markup };
      }
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
  }

  // UPDATE B2C MARKUP
  public async updateB2CMarkupConfig(req: Request) {
    const body = req.body as {
      flight_set_id?: number;
      hotel_set_id?: number;
    };

    const B2CMarkupConfigModel = this.Model.B2CMarkupConfigModel();
    const markupSetModel = this.Model.MarkupSetModel();

    if (body.flight_set_id) {
      // Check if the markup set exists
      const existingFlightMarkupSet = await markupSetModel.getSingleMarkupSet({
        id: body.flight_set_id,
      });

      if (!existingFlightMarkupSet) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Flight markup set not found.',
        };
      }

      await B2CMarkupConfigModel.upsertB2CMarkupConfig({
        type: 'Flight',
        markup_set_id: body.flight_set_id,
      });
    }

    if (body.hotel_set_id) {
      // Check if the markup set exists
      const existingHotelMarkupSet = await markupSetModel.getSingleMarkupSet({
        id: body.hotel_set_id,
      });

      if (!existingHotelMarkupSet) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Hotel markup set not found.',
        };
      }

      await B2CMarkupConfigModel.upsertB2CMarkupConfig({
        type: 'Hotel',
        markup_set_id: body.hotel_set_id,
      });
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }
}
