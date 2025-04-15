import axios from 'axios';
import qs from 'qs';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import SabreAPIEndpoints from '../../../utils/miscellaneous/sabreApiEndpoints';
import { Request } from 'express';

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
    const city_list = await model.getCity(req.query);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: city_list,
    };
  }

  //get all airport
  public async getAllAirport(req: Request) {
    const model = this.Model.CommonModel();
    const get_airport = await model.getAirport(req.query);

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
}
