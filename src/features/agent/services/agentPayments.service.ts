import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import CustomError from '../../../utils/lib/customError';
import Lib from '../../../utils/lib/lib';
import {
  DEPOSIT_STATUS_CANCELLED,
  DEPOSIT_STATUS_PENDING,
  GENERATE_AUTO_UNIQUE_ID,
  PAYMENT_GATEWAYS,
  SOURCE_ADMIN,
  SOURCE_AGENT,
} from '../../../utils/miscellaneous/constants';
import { PaymentSupportService } from '../../../utils/supportServices/paymentSupportServices/paymentSupport.service';
import {
  ICreateDepositPayload,
  IGetAgentLedgerHistoryQuery,
  IGetAgentLoanHistoryQuery,
  ITopUpUsingPaymentGatewayReqBody,
} from '../utils/types/agentPayment.types';
import { ICreateDepositRequestPayload } from '../../../utils/modelTypes/commonModelTypes/depositRequestModel.types';

export class AgentPaymentsService extends AbstractServices {
  public async getLoanHistory(req: Request) {
    const { agency_id } = req.agencyUser;
    const restQuery = req.query as unknown as IGetAgentLoanHistoryQuery;
    const AgencyPaymentModel = this.Model.AgencyPaymentModel();

    const data = await AgencyPaymentModel.getLoanHistory(
      {
        agency_id,
        ...restQuery,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: data.data,
      total: data.total || 0,
    };
  }

  public async getLedger(req: Request) {
    const { agency_id } = req.agencyUser;
    const restQuery = req.query as IGetAgentLedgerHistoryQuery;
    const AgencyPaymentModel = this.Model.AgencyPaymentModel();

    const data = await AgencyPaymentModel.getAgencyLedger(
      {
        agency_id,
        ...restQuery,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: data.data,
      total: data.total || 0,
    };
  }

  public async createDepositRequest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id, agency_id } = req.agencyUser;

      const depositRequestModel = this.Model.DepositRequestModel(trx);
      const othersModel = this.Model.OthersModel(trx);

      const check_duplicate =
        await depositRequestModel.getAgentDepositRequestList({
          agency_id,
          status: DEPOSIT_STATUS_PENDING,
        });

      if (check_duplicate.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message:
            'Your previous deposit request is still in pending. New deposit request cannot be made',
        };
      }

      const body = req.body as ICreateDepositPayload;

      const checkAccount = await othersModel.checkAccount({
        id: body.account_id,
        source_type: SOURCE_ADMIN,
      });

      if (!checkAccount) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
          message: 'Invalid account id.',
        };
      }

      const request_no = await Lib.generateNo({
        trx,
        type: GENERATE_AUTO_UNIQUE_ID.agent_deposit_request,
      });

      const files = (req.files as Express.Multer.File[]) || [];
      let docs = '';
      files.forEach((file) => {
        switch (file.fieldname) {
          case 'docs':
            docs = file.filename;
            break;
          default:
            throw new CustomError(
              'Invalid files. Please provide valid docs',
              this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
            );
        }
      });

      const deposit_body: ICreateDepositRequestPayload = {
        request_no,
        agency_id,
        docs,
        created_by: user_id,
        account_id: body.account_id,
        amount: body.amount,
        payment_date: body.payment_date,
        source: SOURCE_AGENT,
        remarks: body.remarks,
      };

      const res = await depositRequestModel.createDepositRequest(deposit_body);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Deposit request has been created',
        data: {
          id: res[0].id,
        },
      };
    });
  }

  public async cancelCurrentDepositRequest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, name, username } = req.agencyUser;
      const paymentModel = this.Model.DepositRequestModel(trx);
      const getCurrentDepositData =
        await paymentModel.getAgentDepositRequestList(
          { agency_id, status: DEPOSIT_STATUS_PENDING, limit: 1 },
          false
        );

      if (!getCurrentDepositData.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'No Pending deposit request has been found!',
        };
      }

      await paymentModel.updateDepositRequest(
        {
          status: DEPOSIT_STATUS_CANCELLED,
          update_note: 'Deposit Cancelled by agent.' + `(${name}[${username}])`,
        },
        getCurrentDepositData.data[0].id
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Deposit request has been cancelled',
      };
    });
  }

  public async getDepositHistory(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const paymentModel = this.Model.DepositRequestModel(trx);
      const query = req.query;
      const depositData = await paymentModel.getAgentDepositRequestList(
        { ...query, agency_id },
        true
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        total: depositData.total,
        data: depositData.data,
      };
    });
  }

  public async getSingleDepositReq(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const id = Number(req.params.id);
      const paymentModel = this.Model.DepositRequestModel(trx);
      const depositData = await paymentModel.getSingleAgentDepositRequest(
        id,
        agency_id
      );

      if (!depositData) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: depositData,
      };
    });
  }

  public async topUpUsingPaymentGateway(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id, name, user_email, phone_number } =
        req.agencyUser;
      const {
        amount,
        currency,
        payment_gateway,
        success_page,
        failed_page,
        cancelled_page,
        is_app,
      } = req.body as ITopUpUsingPaymentGatewayReqBody;

      const paymentService = new PaymentSupportService();

      switch (payment_gateway) {
        case PAYMENT_GATEWAYS.SSL:
          return await paymentService.SSLPaymentGateway({
            total_amount: amount,
            currency,
            tran_id: `${SOURCE_AGENT}-${agency_id}-${user_id}`,
            cus_name: name,
            cus_email: user_email,
            cus_phone: phone_number,
            product_name: 'credit load',
            success_page,
            failed_page,
            cancelled_page,
          });

        default:
          return {
            success: false,
            message: 'Invalid bank',
            redirectUrl: null,
            code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
          };
      }
    });
  }

  public async getADMList(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const admModel = this.Model.ADMManagementModel(trx);
      const query = req.query;
      const data = await admModel.getADMManagementList(
        { ...query, agency_id, adm_for: SOURCE_AGENT },
        true
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        total: data.total,
        data: data.data,
      };
    });
  }

  public async getInvoices(req: Request) {
    const { agency_id } = req.agencyUser;
    const invoiceModel = this.Model.InvoiceModel();
    const query = req.query;
    const data = await invoiceModel.getInvoiceList(
      {
        source_type: SOURCE_AGENT,
        source_id: agency_id,
        ...query,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  public async getSingleInvoice(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const invoiceModel = this.Model.InvoiceModel(trx);
      const { id } = req.params;
      const data = await invoiceModel.getSingleInvoice({
        id: Number(id),
        source_id: agency_id,
        source_type: SOURCE_AGENT,
      });

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const MoneyReceiptModel = this.Model.MoneyReceiptModel(trx);
      const money_receipt = await MoneyReceiptModel.getMoneyReceiptList({
        invoice_id: Number(id),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: {
          ...data,
          money_receipt: money_receipt.data,
        },
      };
    });
  }

  public async clearDueOfInvoice(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;
      const invoiceModel = this.Model.InvoiceModel(trx);
      const { id } = req.params;
      const data = await invoiceModel.getSingleInvoice({
        id: Number(id),
        source_id: agency_id,
        source_type: SOURCE_AGENT,
      });

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (data.due <= 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'No due has been found with this invoice',
        };
      }

      let balance_trans = data.due;
      let loan_trans = 0;

      //check balance
      const agencyModel = this.Model.AgencyModel(trx);
      const check_balance = await agencyModel.getAgencyBalance(agency_id);
      if (check_balance < data.due) {
        const agency_details = await agencyModel.getSingleAgency({
          id: agency_id,
          type: 'AGENT',
        });
        const usable_loan_balance = Number(agency_details?.usable_loan);
        if (check_balance + usable_loan_balance < data.due) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'There is insufficient balance in your account.',
          };
        }
        loan_trans =
          Number(usable_loan_balance) -
          (Number(data.due) - Number(check_balance));
        balance_trans = check_balance;
      }

      if (loan_trans !== 0) {
        await agencyModel.updateAgency({ usable_loan: loan_trans }, agency_id);
      }
      const moneyReceiptModel = this.Model.MoneyReceiptModel(trx);
      await invoiceModel.updateInvoice({ due: 0 }, Number(id));
      await moneyReceiptModel.createMoneyReceipt({
        mr_no: await Lib.generateNo({ trx, type: 'Money_Receipt' }),
        invoice_id: Number(id),
        amount: data.due,
        user_id,
        details: `Due has been cleared. Balance Transaction: ${balance_trans}. Loan Transaction: ${loan_trans}`,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Due has been cleared',
      };
    });
  }

  public async getPartialPaymentList(req: Request) {
    const { agency_id } = req.agencyUser;
    const invoiceModel = this.Model.InvoiceModel();
    const query = req.query;
    const data = await invoiceModel.getInvoiceList(
      {
        source_type: SOURCE_AGENT,
        source_id: agency_id,
        ...query,
        partial_payment: true,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  public async getAgentBalance(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const model = this.Model.AgencyModel(trx);
      const available_balance = await model.getAgencyBalance(agency_id);
      const usable_loan = await model.checkAgency({ agency_id });
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: {
          available_balance,
          usable_load: usable_loan?.usable_loan,
        },
      };
    });
  }

  public async getAccounts(req: Request) {
    const configModel = this.Model.OthersModel();
    const accounts = await configModel.getAccount({
      source_type: 'ADMIN',
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: accounts,
    };
  }
}
