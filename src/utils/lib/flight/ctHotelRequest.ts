import axios from 'axios';
import config from '../../../config/config';
import Models from '../../../models/rootModel';
import { ERROR_LEVEL_WARNING } from '../../miscellaneous/constants';
import { CT_API } from '../../miscellaneous/flightConstent';

const BASE_URL = config.CT_URL;
const API_KEY = config.CT_API_KEY;

export default class CTHotelRequests {
  // get request
  public async getRequest(endpoint: string) {
    try {
      const headers = {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      };

      const apiUrl = BASE_URL + endpoint;

      const response = await axios.get(apiUrl, { headers });

      const data = response.data;

      return { code: response.status, data };
    } catch (error: any) {
      console.error('Error calling API:', error.response.status);
      return { code: error.response.status, data: [] };
    }
  }

  public async postRequest(endpoint: string, requestData: any) {
    try {
      const apiUrl = BASE_URL + endpoint;

      const headers = {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await axios.request({
        method: 'post',
        url: apiUrl,
        headers: headers,
        data: requestData,
        validateStatus: () => true,
      });

      console.log({ response });
      if (response.status !== 200) {
        await new Models().ErrorLogsModel().insertErrorLogs({
          level: ERROR_LEVEL_WARNING,
          message: `Error from Cholo Travel API`,
          url: apiUrl,
          http_method: 'POST',
          metadata: {
            api: CT_API,
            endpoint: apiUrl,
            payload: requestData,
            response: response.data,
          },
        });
        return false;
      }
      // console.log("response again", response);
      return response.data;
    } catch (error: any) {
      console.log(error);
      return false;
    }
  }
}
