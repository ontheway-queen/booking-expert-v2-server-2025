import axios from 'axios';
import qs from 'qs';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import SabreAPIEndpoints from '../../../utils/miscellaneous/sabreApiEndpoints';
import { SABRE_TOKEN_ENV } from '../../../utils/miscellaneous/flightConstent';

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

          // const authModel = this.Model.authModel();
          // await authModel.updateEnv(SABRE_TOKEN_ENV, {
          //   value: data.access_token,
          // });
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      console.log(err);
    }
  }
}
