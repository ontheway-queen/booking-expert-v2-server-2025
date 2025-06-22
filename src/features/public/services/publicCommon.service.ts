import axios from 'axios';
import qs from 'qs';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import SabreAPIEndpoints from '../../../utils/miscellaneous/endpoints/sabreApiEndpoints';
import { SABRE_TOKEN_ENV } from '../../../utils/miscellaneous/flightConstent';
import { Request } from 'express';
import { CTHotelSupportService } from '../../../utils/supportServices/hotelSupportServices/ctHotelSupport.service';

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

  //get all country
  public async getAllCountry(req: Request) {
    const { name } = req.query as { name?: string };
    const model = this.Model.CommonModel();
    const country_list = await model.getCountry({ name });
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
}
