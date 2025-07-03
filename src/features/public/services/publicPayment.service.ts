import AbstractServices from '../../../abstract/abstract.service';
import { Request } from 'express';
import {
  GENERATE_AUTO_UNIQUE_ID,
  SOURCE_AGENT,
} from '../../../utils/miscellaneous/constants';
import axios from 'axios';
import config from '../../../config/config';
import Lib from '../../../utils/lib/lib';

export class PublicPaymentService extends AbstractServices {
  public async transactionUsingSSL(req: Request) {
    return await this.db.transaction(async (trx) => {
      let {
        s_page = '',
        f_page = '',
        page = '',
        status = '',
      } = req.query as Record<string, string>;
      const body = req.body;
      const { tran_id } = req.body;
      const formatted_order_id = tran_id.split('-');
      switch (status) {
        case 'success':
          if (formatted_order_id[0] === SOURCE_AGENT) {
            if (formatted_order_id.length !== 3) {
              //AGENT-AgencyID-UserID
              return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: 'Transaction id is not valid',
                redirect_url: decodeURIComponent(f_page),
              };
            }

            //verify tran id from ssl
            const session = await axios.post(
              `${config.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body?.val_id}&store_id=${config.SSL_STORE_ID}&store_passwd=${config.SSL_STORE_PASSWORD}&format=json`
            );

            if (!['VALID', 'VALIDATED'].includes(session?.data?.status)) {
              return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Unverified transaction',
                redirect_url: decodeURIComponent(f_page),
              };
            }
            //load credit
            const paymentModel = this.Model.AgencyPaymentModel(trx);
            await paymentModel.insertAgencyLedger({
              agency_id: formatted_order_id[1],
              type: 'Credit',
              amount: session.data.store_amount,
              details: 'Credit has been loaded using SSL',
              voucher_no: await Lib.generateNo({
                trx,
                type: GENERATE_AUTO_UNIQUE_ID.agent_deposit_request,
              }),
            });

            //audit trail
            const agencyModel = this.Model.AgencyModel(trx);
            await agencyModel.createAudit({
              agency_id: formatted_order_id[1],
              created_by: formatted_order_id[2],
              type: 'CREATE',
              details: `Credit has been loaded using SSL amount ${session.data.store_amount}`,
            });
            return {
              success: true,
              code: this.StatusCode.HTTP_OK,
              message: 'Payment success',
              redirect_url: `${decodeURIComponent(s_page)}&date=${
                session.data.tran_date
              }&amount=${session.data.store_amount}&currency=${
                session.data.currency
              }&transaction_id=${session.data.bank_tran_id}&payment_method=${
                session.data.card_issuer
              }&card_type=${session.data.card_type}&card_brand=${
                session.data.card_brand
              }`,
            };
          }

        case 'failed':
          if (formatted_order_id[0] === SOURCE_AGENT) {
            if (formatted_order_id.length !== 3) {
              //AGENT-AgencyID-UserID
              return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: 'Transaction id is not valid',
                redirect_url: decodeURIComponent(page),
              };
            }
            //audit trail
            const agencyModel = this.Model.AgencyModel(trx);
            await agencyModel.createAudit({
              agency_id: formatted_order_id[1],
              created_by: formatted_order_id[2],
              type: 'CREATE',
              details: `credit load has been failed using SSL`,
            });
            return {
              success: false,
              code: this.StatusCode.HTTP_BAD_REQUEST,
              message: 'Transaction has been failed. Please try again later!',
              redirect_url: decodeURIComponent(page),
            };
          }

        case 'cancelled':
          if (formatted_order_id[0] === SOURCE_AGENT) {
            if (formatted_order_id.length !== 3) {
              //AGENT-AgencyID-UserID
              return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: 'Transaction id is not valid',
                redirect_url: decodeURIComponent(page),
              };
            }
            //audit trail
            const agencyModel = this.Model.AgencyModel(trx);
            await agencyModel.createAudit({
              agency_id: formatted_order_id[1],
              created_by: formatted_order_id[2],
              type: 'CREATE',
              details: `credit load has been cancelled using SSL`,
            });
            return {
              success: false,
              code: this.StatusCode.HTTP_BAD_REQUEST,
              message: 'Transaction has been cancelled',
              redirect_url: decodeURIComponent(page),
            };
          }

        default:
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: this.ResMsg.HTTP_BAD_REQUEST,
          };
      }
    });
  }
}
