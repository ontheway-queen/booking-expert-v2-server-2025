import axios, { AxiosRequestConfig } from 'axios';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import { IBkashPaymentGatewayReqBody, ISSLPaymentGatewayReqBody } from '../../supportTypes/paymentSupportTypes/paymentSupportTypes';
import qs from 'qs';
import { CREATE_PAYMENT, EXECUTE_PAYMENT, GRAND_TOKEN, QUERY_PAYMENT, REFRESH_TOKEN } from '../../miscellaneous/endpoints/bkashApiEndpoints';
import { Knex } from 'knex';
import { ERROR_LEVEL_CRITICAL, ERROR_LEVEL_INFO, TYPE_PAYMENT_GATEWAY_BKASH } from '../../miscellaneous/constants';
import { deleteRedis, getRedis, setRedis } from '../../../app/redis';
import CustomError from '../../lib/customError';

export class PaymentSupportService extends AbstractServices {
  public async SSLPaymentGateway(payload: ISSLPaymentGatewayReqBody) {
    try {
      const ssl_body = {
        ...payload,
        store_id: payload.store_id || config.SSL_STORE_ID,
        store_passwd: payload.store_passwd || config.SSL_STORE_PASSWORD,
        success_url: `${config.SERVER_URL}/payment/ssl?status=success&s_page=${payload.success_page}&f_page=${payload.failed_page}`,
        fail_url: `${config.SERVER_URL}/payment/ssl?status=failed&page=${payload.failed_page}`,
        cancel_url: `${config.SERVER_URL}/payment/ssl?status=cancelled&page=${payload.cancelled_page}`,
        shipping_method: 'no',
        product_category: 'General',
        product_profile: 'General',
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_country: 'Bangladesh',
      };

      const response: any = await axios.post(
        `${config.SSL_URL}/gwprocess/v4/api.php`,
        qs.stringify(ssl_body),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response?.data?.status === 'SUCCESS') {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          redirect_url: response.data.redirectGatewayURL,
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
          message: 'Something went wrong!',
        };
      }
    } catch (err) {
      console.log('SSL ERROR', err);
      return {
        success: false,
        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        message: 'Something went wrong',
      };
    }
  }

  private async getBkashRefreshToken(payload: {
    trx: Knex.Transaction,
    user_id: number,
    source: "AGENT" | "AGENT B2C" | "B2C" | "EXTERNAL" | "SUB AGENT",
    cred?: {
      BKASH_APP_KEY: string;
      BKASH_APP_SECRET: string;
      BKASH_USERNAME: string;
      BKASH_PASSWORD: string;
    }
  }
  ): Promise<string> {
    const BKASH_APP_KEY = payload.cred?.BKASH_APP_KEY || config.BKASH_APP_KEY;
    const BKASH_APP_SECRET = payload.cred?.BKASH_APP_SECRET || config.BKASH_APP_SECRET;
    const BKASH_USERNAME = payload.cred?.BKASH_USERNAME || config.BKASH_USERNAME;
    const BKASH_PASSWORD = payload.cred?.BKASH_PASSWORD || config.BKASH_PASSWORD;
    const BKASH_BASE_URL = config.BKASH_BASE_URL;

    const reqBody = {
      app_key: BKASH_APP_KEY,
      app_secret: BKASH_APP_SECRET,
    };
    try {
      const response = await axios.post(`${BKASH_BASE_URL}${GRAND_TOKEN}`, reqBody, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          username: BKASH_USERNAME,
          password: BKASH_PASSWORD,
        },
        maxBodyLength: Infinity,
      });

      if (response?.data?.statusCode !== "0000") {
        await this.Model.ErrorLogsModel().insertErrorLogs({
          http_method: 'POST',
          level: ERROR_LEVEL_CRITICAL,
          message: 'Error while generating BKASH Refresh token',
          url: GRAND_TOKEN,
          user_id: payload.user_id,
          source: payload.source,
          metadata: {
            api: TYPE_PAYMENT_GATEWAY_BKASH,
            request_body: reqBody,
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              username: BKASH_USERNAME,
              password: BKASH_PASSWORD,
            },
            response: response?.data,
          },
        });
        throw new CustomError('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
      }

      const { refresh_token } = response.data;

      const authModel = this.Model.CommonModel(payload.trx);
      await authModel.upsertPaymentGatewayToken({
        gateway_name: TYPE_PAYMENT_GATEWAY_BKASH,
        key: `BKASH_TOKEN_ENV_${BKASH_USERNAME}`,
        value: refresh_token
      });
      const cacheKey = `bkash_id_token_${BKASH_USERNAME}`;
      await deleteRedis(cacheKey);
      return refresh_token;
    } catch (error) {
      console.error('Error fetching bKash token:', error);
      await this.Model.ErrorLogsModel().insertErrorLogs({
        http_method: 'POST',
        level: ERROR_LEVEL_CRITICAL,
        message: 'Error while generating BKASH Refresh token',
        url: GRAND_TOKEN,
        user_id: payload.user_id,
        source: payload.source,
        metadata: {
          api: TYPE_PAYMENT_GATEWAY_BKASH,
          request_body: reqBody,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            username: BKASH_USERNAME,
            password: BKASH_PASSWORD,
          },
          error: error,
        },
      });
      throw new CustomError('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
    }
  }

  public async getBkashIdTokenFromRefreshToken(payload: {
    trx: Knex.Transaction,
    user_id: number,
    source: "AGENT" | "AGENT B2C" | "B2C" | "EXTERNAL" | "SUB AGENT",
    cred?: {
      BKASH_APP_KEY: string;
      BKASH_APP_SECRET: string;
      BKASH_USERNAME: string;
      BKASH_PASSWORD: string;
    }
  }) {
    const cacheKey = `bkash_id_token_${payload.cred?.BKASH_USERNAME || config.BKASH_USERNAME}`;
    const cachedToken = await getRedis(cacheKey);
    const model = this.Model.CommonModel();


    if (cachedToken) {
      console.log('Using cached bKash ID token:', cachedToken);
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { id_token: cachedToken },
      };
    }

    const getBkashToken = await model.getPaymentGatewayToken({ gateway_name: TYPE_PAYMENT_GATEWAY_BKASH, key: cacheKey });
    let refresh_token;
    if (getBkashToken.length) {
      refresh_token = getBkashToken[0].value;
    } else {
      refresh_token = await this.getBkashRefreshToken(payload);
    }

    const BKASH_APP_KEY = payload.cred?.BKASH_APP_KEY || config.BKASH_APP_KEY;
    const BKASH_APP_SECRET = payload.cred?.BKASH_APP_SECRET || config.BKASH_APP_SECRET;
    const BKASH_USERNAME = payload.cred?.BKASH_USERNAME || config.BKASH_USERNAME;
    const BKASH_PASSWORD = payload.cred?.BKASH_PASSWORD || config.BKASH_PASSWORD;
    const BKASH_BASE_URL = config.BKASH_BASE_URL;

    const reqBody = {
      app_key: BKASH_APP_KEY,
      app_secret: BKASH_APP_SECRET,
      refresh_token,
    };
    try {
      let id_token;

      const response = await axios.post(`${BKASH_BASE_URL}${REFRESH_TOKEN}`, reqBody, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          username: BKASH_USERNAME,
          password: BKASH_PASSWORD,
        },
        maxBodyLength: Infinity,
      });
      if (response.data.statusCode === "9999") {//token expired
        const new_refresh_token = await this.getBkashRefreshToken(payload);
        const response = await axios.post(`${BKASH_BASE_URL}${REFRESH_TOKEN}`, {
          app_key: BKASH_APP_KEY,
          app_secret: BKASH_APP_SECRET,
          refresh_token: new_refresh_token,
        }, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            username: BKASH_USERNAME,
            password: BKASH_PASSWORD,
          },
          maxBodyLength: Infinity,
        });
        if (response.data.statusCode !== '0000') {
          await this.Model.ErrorLogsModel().insertErrorLogs({
            http_method: 'POST',
            level: ERROR_LEVEL_CRITICAL,
            message: 'Error while generating BKASH id token',
            url: REFRESH_TOKEN,
            user_id: payload.user_id,
            source: payload.source,
            metadata: {
              api: TYPE_PAYMENT_GATEWAY_BKASH,
              request_body: {
                app_key: BKASH_APP_KEY,
                app_secret: BKASH_APP_SECRET,
                refresh_token: new_refresh_token,
              },
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                username: BKASH_USERNAME,
                password: BKASH_PASSWORD,
              },
              response: response?.data,
            },
          });
          throw new CustomError('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
        }
        id_token = response.data?.id_token;
      } else if (response.data.statusCode === '0000') {
        id_token = response.data?.id_token;
      } else {
        await this.Model.ErrorLogsModel().insertErrorLogs({
          http_method: 'POST',
          level: ERROR_LEVEL_CRITICAL,
          message: 'Error while generating BKASH id token',
          url: REFRESH_TOKEN,
          user_id: payload.user_id,
          source: payload.source,
          metadata: {
            api: TYPE_PAYMENT_GATEWAY_BKASH,
            request_body: reqBody,
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              username: BKASH_USERNAME,
              password: BKASH_PASSWORD,
            },
            response: response?.data,
          },
        });
        throw new CustomError('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
      }


      // Cache token for 1 hour
      await setRedis(cacheKey, id_token, 3600);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { id_token },
      };
    } catch (error) {
      await this.Model.ErrorLogsModel().insertErrorLogs({
        http_method: 'POST',
        level: ERROR_LEVEL_CRITICAL,
        message: 'Error while generating BKASH id token',
        url: REFRESH_TOKEN,
        user_id: payload.user_id,
        source: payload.source,
        metadata: {
          api: TYPE_PAYMENT_GATEWAY_BKASH,
          request_body: {
            app_key: BKASH_APP_KEY,
            app_secret: BKASH_APP_SECRET,
            refresh_token: refresh_token,
          },
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            username: BKASH_USERNAME,
            password: BKASH_PASSWORD,
          },
          error,
        },
      });
      throw new CustomError('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
    }

  }

  public async createBkashPaymentSession(payload: IBkashPaymentGatewayReqBody) {
    const { data: token_Data } =
      await this.getBkashIdTokenFromRefreshToken({
        trx: payload.trx,
        user_id: payload.user_id,
        source: payload.source,
        cred: payload.cred
      });
    console.log({ token_Data });

    const params = new URLSearchParams({
      s_page: payload.success_page || "",
      f_page: payload.failed_page || "",
      c_page: payload.cancelled_page || "",
      ref_id: payload.ref_id || ""
    });

    const paymentBody = {
      mode: "0011",
      payerReference: payload.mobile_number,
      callbackURL: `${config.SERVER_URL}/payment/bkash?${params.toString()}`,
      amount: payload.amount.toString(),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: payload.ref_id,
    }

    const BKASH_APP_KEY = payload.cred?.BKASH_APP_KEY || config.BKASH_APP_KEY;

    const axiosConfig: AxiosRequestConfig = {
      method: "POST",
      url: `${config.BKASH_BASE_URL}${CREATE_PAYMENT}`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token_Data.id_token,
        "X-App-Key": BKASH_APP_KEY,
      },
      data: JSON.stringify(paymentBody),
    };

    try {
      const response = await axios.request(axiosConfig);

      if (response.data.statusCode !== '0000') {
        await this.Model.ErrorLogsModel().insertErrorLogs({
          http_method: 'POST',
          level: ERROR_LEVEL_INFO,
          message: 'Error while generating BKASH session',
          url: CREATE_PAYMENT,
          user_id: payload.user_id,
          source: payload.source,
          metadata: {
            api: TYPE_PAYMENT_GATEWAY_BKASH,
            request_body: paymentBody,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: token_Data.id_token,
              "X-App-Key": BKASH_APP_KEY,
            },
            response: response?.data,
          },
        });
        throw new CustomError('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: response.data,
        message: "Payment created successfully.",
      };
    } catch (error) {
      await this.Model.ErrorLogsModel().insertErrorLogs({
        http_method: 'POST',
        level: ERROR_LEVEL_INFO,
        message: 'Error while generating BKASH session',
        url: CREATE_PAYMENT,
        user_id: payload.user_id,
        source: payload.source,
        metadata: {
          api: TYPE_PAYMENT_GATEWAY_BKASH,
          request_body: paymentBody,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token_Data.id_token,
            "X-App-Key": BKASH_APP_KEY,
          },
          error
        },
      });
      throw new CustomError('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
    }
  }

  public async bkashExecutePaymentAPI(payload: {
    id_token: string;
    payment_id: string;
    BKASH_APP_KEY?: string;
    user_id: number;
    source: "AGENT" | "AGENT B2C" | "B2C" | "EXTERNAL" | "SUB AGENT";
  }) {
    const BKASH_APP_KEY = payload.BKASH_APP_KEY || config.BKASH_APP_KEY;
    try {
      const response = await axios.post(
        `${config.BKASH_BASE_URL}${EXECUTE_PAYMENT}`,
        { paymentID: payload.payment_id },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: payload.id_token,
            'X-App-Key': BKASH_APP_KEY,
          },
          maxBodyLength: Infinity,
        }
      );


      return {
        data: response.data
      }
    } catch (error) {
      await this.Model.ErrorLogsModel().insertErrorLogs({
        http_method: 'POST',
        level: ERROR_LEVEL_INFO,
        message: 'Error while executing Bkash payment API',
        url: EXECUTE_PAYMENT,
        user_id: payload.user_id,
        source: payload.source,
        metadata: {
          api: TYPE_PAYMENT_GATEWAY_BKASH,
          request_body: { paymentID: payload.payment_id },
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: payload.id_token,
            'X-App-Key': BKASH_APP_KEY,
          },
          error
        },
      });
      return;
    }
  }

  public async bkashQueryPaymentAPI(payload: {
    id_token: string;
    payment_id: string;
    BKASH_APP_KEY?: string;
    user_id: number;
    source: "AGENT" | "AGENT B2C" | "B2C" | "EXTERNAL" | "SUB AGENT";
  }) {
    const BKASH_APP_KEY = payload.BKASH_APP_KEY || config.BKASH_APP_KEY;
    try {
      const response = await axios.post(
        `${config.BKASH_BASE_URL}${QUERY_PAYMENT}`,
        { paymentID: payload.payment_id },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: payload.id_token,
            'X-App-Key': BKASH_APP_KEY,
          },
          maxBodyLength: Infinity,
        }
      );

      return {
        data: response.data
      }
    } catch (error) {
      await this.Model.ErrorLogsModel().insertErrorLogs({
        http_method: 'POST',
        level: ERROR_LEVEL_INFO,
        message: 'Error while Bkash query payment API',
        url: QUERY_PAYMENT,
        user_id: payload.user_id,
        source: payload.source,
        metadata: {
          api: TYPE_PAYMENT_GATEWAY_BKASH,
          request_body: { paymentID: payload.payment_id },
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: payload.id_token,
            'X-App-Key': BKASH_APP_KEY,
          },
          error
        },
      });
      return;
    }
  }
}
