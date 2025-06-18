import axios from 'axios';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import { ISSLPaymentGatewayReqBody } from '../../supportTypes/paymentSupportTypes/paymentSupportTypes';
import qs from 'qs';

export class PaymentSupportService extends AbstractServices {
  public async SSLPaymentGateway(payload: ISSLPaymentGatewayReqBody) {
    try {
      const ssl_body = {
        ...payload,
        store_id: config.SSL_STORE_ID,
        store_passwd: config.SSL_STORE_PASSWORD,
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
}
