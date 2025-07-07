import axios from 'axios';
import Models from '../../../models/rootModel';
import { CUSTOM_API, WFTT_TOKEN_ENV } from '../../miscellaneous/flightConstent';
import config from '../../../config/config';
import { ERROR_LEVEL_WARNING } from '../../miscellaneous/constants';
const BASE_URL = config.WFTT_URL;

export default class WfttRequests {
  // get request
  public async getRequest(endpoint: string) {
    try {
      const authModel = new Models().CommonModel();

      const token = await authModel.getEnv(WFTT_TOKEN_ENV);
      // console.log(token)
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      let apiUrl = BASE_URL + endpoint;

      const response = await axios.request({
        method: 'GET',
        url: apiUrl,
        headers: headers,
      });

      const data = response.data;

      return data;
    } catch (error: any) {
      console.error('Error calling API:', error.response.statusText);
      return false;
    }
  }

  // post request
  public async postRequest(endpoint: string, requestData: any) {
    try {
      const apiUrl = BASE_URL + endpoint;
      const authModel = new Models().CommonModel();

      const token = await authModel.getEnv(WFTT_TOKEN_ENV);
      // console.log(token)
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // const response = await axios.post(apiUrl, requestData, { headers });
      const response = await axios.request({
        method: 'post',
        url: apiUrl,
        headers: headers,
        data: requestData,
        validateStatus: () => true,
      });
      if (response.status !== 200) {
        await new Models().ErrorLogsModel().insertErrorLogs({
          level: ERROR_LEVEL_WARNING,
          message: `Error from WFTT`,
          url: apiUrl,
          http_method: 'POST',
          metadata: {
            api: CUSTOM_API,
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
