import AbstractServices from '../../../abstract/abstract.service';
import { query, Request } from 'express';
import {
  BKASH_PERCENTAGE,
  GENERATE_AUTO_UNIQUE_ID,
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
} from '../../../utils/miscellaneous/constants';
import axios from 'axios';
import config from '../../../config/config';
import Lib from '../../../utils/lib/lib';
import { PaymentSupportService } from '../../../utils/supportServices/paymentSupportServices/paymentSupport.service';

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
              redirect_url: `${decodeURIComponent(s_page)}&date=${session.data.tran_date
                }&amount=${session.data.store_amount}&currency=${session.data.currency
                }&transaction_id=${session.data.bank_tran_id}&payment_method=${session.data.card_issuer
                }&card_type=${session.data.card_type}&card_brand=${session.data.card_brand
                }`,
            };
          } else if (formatted_order_id[0] === SOURCE_AGENT_B2C) {
            if (formatted_order_id.length !== 3) {
              //AGENT B2C-AgencyID-UserID
              return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: 'Transaction id is not valid',
                redirect_url: decodeURIComponent(f_page),
              };
            }

            //get SSL cred
            const othersModel = this.Model.OthersModel(trx);
            const SSL_STORE_ID = await othersModel.getPaymentGatewayCreds({ agency_id: formatted_order_id[1], gateway_name: 'SSL', key: 'SSL_STORE_ID' });
            if (!SSL_STORE_ID || !SSL_STORE_ID.length) {
              return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: 'Payment gateway is not configured. Please contact with support team.',
                redirect_url: decodeURIComponent(f_page),
              }
            }
            const SSL_STORE_PASSWORD = await othersModel.getPaymentGatewayCreds({ agency_id: formatted_order_id[1], gateway_name: 'SSL', key: 'SSL_STORE_PASSWORD' });
            if (!SSL_STORE_PASSWORD || !SSL_STORE_PASSWORD.length) {
              return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: 'Payment gateway is not configured. Please contact with support team.',
                redirect_url: decodeURIComponent(f_page),
              }
            }

            //verify tran id from ssl
            const session = await axios.post(
              `${config.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body?.val_id}&store_id=${SSL_STORE_ID?.[0]?.value}&store_passwd=${SSL_STORE_PASSWORD?.[0]?.value}&format=json`
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
            const paymentModel = this.Model.AgencyB2CPaymentModel(trx);
            await paymentModel.insertLedger({
              agency_id: formatted_order_id[1],
              user_id: formatted_order_id[2],
              amount: session.data.store_amount,
              type: 'Credit',
              details: 'Credit has been loaded using SSL',
              voucher_no: await Lib.generateNo({
                trx,
                type: GENERATE_AUTO_UNIQUE_ID.b2c_deposit_request,
              }),
              ledger_date: new Date(),
            });

            return {
              success: true,
              code: this.StatusCode.HTTP_OK,
              message: 'Payment success',
              redirect_url: `${decodeURIComponent(s_page)}&date=${session.data.tran_date
                }&amount=${session.data.store_amount}&currency=${session.data.currency
                }&transaction_id=${session.data.bank_tran_id}&payment_method=${session.data.card_issuer
                }&card_type=${session.data.card_type}&card_brand=${session.data.card_brand
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

  public async transactionUsingBkash(req: Request) {
    return await this.db.transaction(async (trx) => {
      let {
        s_page,
        f_page,
        c_page,
        status,
        paymentID,
        ref_id
      } = req.query as Record<string, string>;
      if (!paymentID || !status) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Transaction has been failed. Please try again later!',
          redirect_url: decodeURIComponent(f_page),
        };
      }
      const formatted_order_id = ref_id.split('-');
      const paymentSupportService = new PaymentSupportService();

      switch (status) {
        case 'success':
          if (formatted_order_id[0] === SOURCE_AGENT) {
            if (formatted_order_id.length !== 4) {
              //AGENT-AgencyID-UserID
              return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: 'Transaction id is not valid',
                redirect_url: decodeURIComponent(f_page),
              };
            }

            const { data: token_Data } = await paymentSupportService.getBkashIdTokenFromRefreshToken({
              trx,
              user_id: Number(formatted_order_id[2]),
              source: formatted_order_id[0]
            });

            const executePaymentResponse = await paymentSupportService.bkashExecutePaymentAPI({
              id_token: token_Data.id_token,
              payment_id: paymentID,
              user_id: Number(formatted_order_id[2]),
              source: formatted_order_id[0]
            });

            const executePayment = executePaymentResponse?.data;

            if (executePayment) {
              if (executePayment?.statusCode === '0000') {
                const actual_amount = parseFloat(
                  Lib.calculateAdjustedAmount(
                    executePayment.amount,
                    BKASH_PERCENTAGE,
                    'subtract'
                  ).toFixed(2)
                );
                //load credit
                const paymentModel = this.Model.AgencyPaymentModel(trx);
                await paymentModel.insertAgencyLedger({
                  agency_id: Number(formatted_order_id[1]),
                  type: 'Credit',
                  amount: actual_amount,
                  details: 'Credit has been loaded using BKASH',
                  voucher_no: await Lib.generateNo({
                    trx,
                    type: GENERATE_AUTO_UNIQUE_ID.agent_deposit_request,
                  }),
                });
                //audit trail
                const agencyModel = this.Model.AgencyModel(trx);
                await agencyModel.createAudit({
                  agency_id: Number(formatted_order_id[1]),
                  created_by: Number(formatted_order_id[2]),
                  type: 'CREATE',
                  details: `Credit has been loaded using BKASH - amount ${actual_amount}`,
                });
                return {
                  success: true,
                  code: this.StatusCode.HTTP_OK,
                  message: 'Payment success',
                  redirect_url: `${decodeURIComponent(s_page)}&date=${executePayment.paymentExecuteTime
                    }&amount=${actual_amount}&currency=BDT
                    }&transaction_id=${executePayment.trxID}&payment_method=BKASH`,
                };

              } else {
                return {
                  success: false,
                  code: this.StatusCode.HTTP_BAD_REQUEST,
                  message: 'Payment has been failed',
                  redirect_url: decodeURIComponent(f_page),
                };
              }
            } else {
              const queryPaymentResponse = await paymentSupportService.bkashQueryPaymentAPI({
                id_token: token_Data.id_token,
                payment_id: paymentID,
                user_id: Number(formatted_order_id[2]),
                source: formatted_order_id[0]
              });

              const query_payment_data = queryPaymentResponse?.data;
              if (query_payment_data?.statusCode === '0000') {
                const actual_amount = parseFloat(
                  Lib.calculateAdjustedAmount(
                    query_payment_data.amount,
                    BKASH_PERCENTAGE,
                    'subtract'
                  ).toFixed(2)
                );
                //load credit
                const paymentModel = this.Model.AgencyPaymentModel(trx);
                await paymentModel.insertAgencyLedger({
                  agency_id: Number(formatted_order_id[1]),
                  type: 'Credit',
                  amount: actual_amount,
                  details: 'Credit has been loaded using BKASH',
                  voucher_no: await Lib.generateNo({
                    trx,
                    type: GENERATE_AUTO_UNIQUE_ID.agent_deposit_request,
                  }),
                });
                //audit trail
                const agencyModel = this.Model.AgencyModel(trx);
                await agencyModel.createAudit({
                  agency_id: Number(formatted_order_id[1]),
                  created_by: Number(formatted_order_id[2]),
                  type: 'CREATE',
                  details: `Credit has been loaded using BKASH - amount ${actual_amount}`,
                });
                return {
                  success: true,
                  code: this.StatusCode.HTTP_OK,
                  message: 'Payment success',
                  redirect_url: `${decodeURIComponent(s_page)}&date=${query_payment_data.paymentExecuteTime
                    }&amount=${actual_amount}&currency=BDT
                    }&transaction_id=${query_payment_data.trxID}&payment_method=BKASH`,
                };
              } else {
                return {
                  success: false,
                  code: this.StatusCode.HTTP_BAD_REQUEST,
                  message: 'Payment has been failed',
                  redirect_url: decodeURIComponent(f_page),
                };
              }

            }

          } else if (formatted_order_id[0] === 'AGENT_B2C') {
            if (formatted_order_id.length !== 4) {
              //AGENT B2C-AgencyID-UserID
              return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: 'Transaction id is not valid',
                redirect_url: decodeURIComponent(f_page),
              };
            }

            //get BKASH Cred
            const othersModel = this.Model.OthersModel(trx);
            const BKASH_APP_KEY = await othersModel.getPaymentGatewayCreds({ agency_id: Number(formatted_order_id[1]), gateway_name: 'BKASH', key: 'BKASH_APP_KEY' });
            if (!BKASH_APP_KEY || !BKASH_APP_KEY.length) {
              return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: 'Payment gateway is not configured. Please contact with support team.',
                redirect_url: decodeURIComponent(f_page),
              }
            }

            const BKASH_APP_SECRET = await othersModel.getPaymentGatewayCreds({ agency_id: Number(formatted_order_id[1]), gateway_name: 'BKASH', key: 'BKASH_APP_SECRET' });
            if (!BKASH_APP_SECRET || !BKASH_APP_SECRET.length) {
              return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: 'Payment gateway is not configured. Please contact with support team.',
                redirect_url: decodeURIComponent(f_page),
              }
            }

            const BKASH_USERNAME = await othersModel.getPaymentGatewayCreds({ agency_id: Number(formatted_order_id[1]), gateway_name: 'BKASH', key: 'BKASH_USERNAME' });
            if (!BKASH_USERNAME || !BKASH_USERNAME.length) {
              return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: 'Payment gateway is not configured. Please contact with support team.',
                redirect_url: decodeURIComponent(f_page),
              }
            }

            const BKASH_PASSWORD = await othersModel.getPaymentGatewayCreds({ agency_id: Number(formatted_order_id[1]), gateway_name: 'BKASH', key: 'BKASH_PASSWORD' });
            if (!BKASH_PASSWORD || !BKASH_PASSWORD.length) {
              return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: 'Payment gateway is not configured. Please contact with support team.',
                redirect_url: decodeURIComponent(f_page),
              }
            }

            const { data: token_Data } = await paymentSupportService.getBkashIdTokenFromRefreshToken({
              trx,
              user_id: Number(formatted_order_id[2]),
              source: SOURCE_AGENT_B2C,
              cred: {
                BKASH_APP_KEY: BKASH_APP_KEY?.[0]?.value,
                BKASH_APP_SECRET: BKASH_APP_SECRET?.[0]?.value,
                BKASH_USERNAME: BKASH_USERNAME?.[0]?.value,
                BKASH_PASSWORD: BKASH_PASSWORD?.[0]?.value
              }
            });

            const executePaymentResponse = await paymentSupportService.bkashExecutePaymentAPI({
              id_token: token_Data.id_token,
              payment_id: paymentID,
              user_id: Number(formatted_order_id[2]),
              source: SOURCE_AGENT_B2C,
              BKASH_APP_KEY: BKASH_APP_KEY?.[0]?.value
            });

            const executePayment = executePaymentResponse?.data;

            if (executePayment) {
              if (executePayment?.statusCode === '0000') {
                const actual_amount = parseFloat(
                  Lib.calculateAdjustedAmount(
                    executePayment.amount,
                    BKASH_PERCENTAGE,
                    'subtract'
                  ).toFixed(2)
                );
                //load credit
                const paymentModel = this.Model.AgencyB2CPaymentModel(trx);
                await paymentModel.insertLedger({
                  agency_id: Number(formatted_order_id[1]),
                  user_id: Number(formatted_order_id[2]),
                  type: 'Credit',
                  amount: actual_amount,
                  details: 'Credit has been loaded using BKASH',
                  voucher_no: await Lib.generateNo({
                    trx,
                    type: GENERATE_AUTO_UNIQUE_ID.b2c_deposit_request,
                  }),
                  ledger_date: new Date()
                });
                return {
                  success: true,
                  code: this.StatusCode.HTTP_OK,
                  message: 'Payment success',
                  redirect_url: `${decodeURIComponent(s_page)}&date=${executePayment.paymentExecuteTime
                    }&amount=${actual_amount}&currency=BDT
                    }&transaction_id=${executePayment.trxID}&payment_method=BKASH`,
                };

              } else {
                return {
                  success: false,
                  code: this.StatusCode.HTTP_BAD_REQUEST,
                  message: 'Payment has been failed',
                  redirect_url: decodeURIComponent(f_page),
                };
              }
            } else {
              const queryPaymentResponse = await paymentSupportService.bkashQueryPaymentAPI({
                id_token: token_Data.id_token,
                payment_id: paymentID,
                user_id: Number(formatted_order_id[2]),
                source: SOURCE_AGENT_B2C,
                BKASH_APP_KEY: BKASH_APP_KEY?.[0]?.value
              });

              const query_payment_data = queryPaymentResponse?.data;
              console.log({query_payment_data});
              if (query_payment_data?.statusCode === '0000') {
                const actual_amount = parseFloat(
                  Lib.calculateAdjustedAmount(
                    query_payment_data.amount,
                    BKASH_PERCENTAGE,
                    'subtract'
                  ).toFixed(2)
                );
                //load credit
                const paymentModel = this.Model.AgencyB2CPaymentModel(trx);
                await paymentModel.insertLedger({
                  agency_id: Number(formatted_order_id[1]),
                  user_id: Number(formatted_order_id[2]),
                  type: 'Credit',
                  amount: actual_amount,
                  details: 'Credit has been loaded using BKASH',
                  voucher_no: await Lib.generateNo({
                    trx,
                    type: GENERATE_AUTO_UNIQUE_ID.b2c_deposit_request,
                  }),
                  ledger_date: new Date(),
                });
                return {
                  success: true,
                  code: this.StatusCode.HTTP_OK,
                  message: 'Payment success',
                  redirect_url: `${decodeURIComponent(s_page)}&date=${query_payment_data.paymentExecuteTime
                    }&amount=${actual_amount}&currency=BDT
                    }&transaction_id=${query_payment_data.trxID}&payment_method=BKASH`,
                };
              } else {
                return {
                  success: false,
                  code: this.StatusCode.HTTP_BAD_REQUEST,
                  message: 'Payment has been failed',
                  redirect_url: decodeURIComponent(f_page),
                };
              }
            }
          }

        case 'cancel':
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'Transaction has been cancelled!',
            redirect_url: decodeURIComponent(c_page),
          };

        case 'failure':
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'Transaction has been failed. Please try again later!',
            redirect_url: decodeURIComponent(f_page),
          };

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
