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
    const apiUrl = BASE_URL + endpoint;
    try {
      const headers = {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await axios.get(apiUrl, { headers });

      const data = response.data;

      if (data.success) {
        return data;
      } else {
        await new Models().ErrorLogsModel().insertErrorLogs({
          level: ERROR_LEVEL_WARNING,
          message: `Error from Cholo Travel API`,
          url: apiUrl,
          http_method: 'GET',
          metadata: {
            api: CT_API,
            endpoint: apiUrl,
            payload: '',
            response: data.message,
          },
        });
        return false;
      }
    } catch (error: any) {
      await new Models().ErrorLogsModel().insertErrorLogs({
        level: ERROR_LEVEL_WARNING,
        message: `Error from Cholo Travel API`,
        url: apiUrl,
        http_method: 'GET',
        metadata: {
          api: CT_API,
          endpoint: apiUrl,
          payload: '',
          response: error,
        },
      });
      console.error('Error calling API:', error.response.status);
      return false;
    }
  }

  public async postRequest(endpoint: string, requestData: any) {
    const apiUrl = BASE_URL + endpoint;
    try {
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

      console.log('Response:', response.data);

      if (!response.data.success) {
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
      return response.data;
    } catch (error: any) {
      await new Models().ErrorLogsModel().insertErrorLogs({
        level: ERROR_LEVEL_WARNING,
        message: `Error from Cholo Travel API`,
        url: apiUrl,
        http_method: 'POST',
        metadata: {
          api: CT_API,
          endpoint: apiUrl,
          payload: requestData,
          response: error,
        },
      });
      console.log(error);
      return false;
    }
  }
}
