import axios from 'axios';
import qs from 'qs';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import SabreAPIEndpoints from '../../../utils/miscellaneous/endpoints/sabreApiEndpoints';
import {
  PUBLIC_PNR_SABRE_API_SECRET,
  SABRE_TOKEN_ENV,
  VERTEIL_API,
  VERTEIL_TOKEN_ENV,
} from '../../../utils/miscellaneous/flightConstant';
import { Request } from 'express';
import { CTHotelSupportService } from '../../../utils/supportServices/hotelSupportServices/ctHotelSupport.service';
import VerteilAPIEndpoints from '../../../utils/miscellaneous/endpoints/verteilApiEndpoints';
import { ERROR_LEVEL_CRITICAL } from '../../../utils/miscellaneous/constants';
import SabreRequests from '../../../utils/lib/flight/sabreRequest';

export default class PublicCommonService extends AbstractServices {
  constructor() {
    super();
  }

  // Get Sebre token
  public async getSabreToken() {
    try {
      let data = qs.stringify({
        grant_type: 'password',
        username: config.SABRE_USERNAME,
        password: config.SABRE_PASSWORD,
      });

      let axiosConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${config.SABRE_URL}/${SabreAPIEndpoints.GET_TOKEN_ENDPOINT}`,
        headers: {
          Authorization: `Basic ${config.SABRE_AUTH_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
      };

      axios
        .request(axiosConfig)
        .then(async (response) => {
          const data = response.data;

          const authModel = this.Model.CommonModel();
          await authModel.updateEnv(SABRE_TOKEN_ENV, data.access_token);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      console.log(err);
    }
  }

  //get verteil token
  public async getVerteilToken() {
    try {
      return await this.db.transaction(async (trx) => {
        const axiosConfig = {
          method: 'post',
          url: `${config.VERTEIL_URL}${VerteilAPIEndpoints.GET_TOKEN_ENDPOINT}`,
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${config.VERTEIL_USERNAME}:${config.VERTEIL_PASSWORD}`
            ).toString('base64')}`,
          },
          maxBodyLength: Infinity,
          validateStatus: () => true,
        };

        const response = await axios.request(axiosConfig);

        console.log({ response });
        if (response.status !== 200) {
          await this.Model.ErrorLogsModel(trx).insertErrorLogs({
            level: ERROR_LEVEL_CRITICAL,
            message: `Error from Verteil authentication`,
            url: axiosConfig.url,
            http_method: 'POST',
            metadata: {
              api: VERTEIL_API,
              endpoint: axiosConfig.url,
              payload: {
                username: config.VERTEIL_USERNAME,
                password: config.VERTEIL_PASSWORD,
              },
              response: response.data,
            },
          });
        } else {
          const authModel = this.Model.CommonModel(trx);
          await authModel.updateEnv(
            VERTEIL_TOKEN_ENV,
            response.data.access_token
          );
        }
      });
    } catch (err) {
      console.error('Verteil Token Error:', err);
    }
  }

  //get all country
  public async getAllCountry(req: Request) {
    const { name, limit, skip } = req.query as {
      name?: string;
      limit?: string;
      skip?: string;
    };
    const model = this.Model.CommonModel();
    const country_list = await model.getCountry({ name, limit, skip });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: country_list,
    };
  }

  //get all city
  public async getAllCity(req: Request) {
    const model = this.Model.CommonModel();
    const city_list = await model.getCity(req.query, false);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: city_list.data,
    };
  }

  //get all airport
  public async getAllAirport(req: Request) {
    const model = this.Model.CommonModel();
    const get_airport = await model.getAirport(req.query, false);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: get_airport.data,
    };
  }

  public async getAllAirlines(req: Request) {
    const model = this.Model.CommonModel();
    const get_airlines = await model.getAirlines(req.query, false);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: get_airlines.data,
    };
  }

  //get all airport
  public async getLocationHotel(req: Request) {
    return this.db.transaction(async (trx) => {
      const CTHotelSupport = new CTHotelSupportService(trx);

      const { filter } = req.query as { filter: string };
      const get_airport = await CTHotelSupport.SearchLocation(filter);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: get_airport.success ? get_airport.data : [],
      };
    });
  }

  //get banks
  public async getBank(req: Request) {
    return this.db.transaction(async (trx) => {
      const CommonModel = this.Model.CommonModel(trx);

      const { filter } = req.query as { filter: string };

      const { data } = await CommonModel.getBanks({
        name: filter,
        status: true,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data,
      };
    });
  }

  public async getSocialMedia(req: Request) {
    return this.db.transaction(async (trx) => {
      const CommonModel = this.Model.CommonModel(trx);

      const { filter } = req.query as { filter: string };

      const { data } = await CommonModel.getSocialMedia({
        name: filter,
        status: true,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data,
      };
    });
  }

  //get visa type
  public async getVisaType(req: Request) {
    return this.db.transaction(async (trx) => {
      const CommonModel = this.Model.CommonModel(trx);
      const visaType = await CommonModel.getVisaType();
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: visaType,
      };
    });
  }

  public async getSabreBooking(req: Request) {
    const { pnr_code } = req.params;
    const { authorization } = req.headers;
    if (!authorization) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    } else {
      const token = authorization.split(' ')[1];

      if (!token) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.HTTP_UNAUTHORIZED,
        };
      }

      if (token !== PUBLIC_PNR_SABRE_API_SECRET) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.HTTP_UNAUTHORIZED,
        };
      }
    }

    const response = await new SabreRequests().postRequest(
      SabreAPIEndpoints.GET_BOOKING_ENDPOINT,
      {
        confirmationId: pnr_code,
      }
    );

    if (!response) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: response,
    };
  }
}
