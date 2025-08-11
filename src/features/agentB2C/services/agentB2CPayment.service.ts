import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { IGetAgentB2CLedgerHistoryQuery } from '../utils/types/agentB2CPayment.types';
import {
  DEPOSIT_STATUS_PENDING,
  SOURCE_AGENT_B2C,
} from '../../../utils/miscellaneous/constants';
import Lib from '../../../utils/lib/lib';

export default class AgentB2CPaymentService extends AbstractServices {
  constructor() {
    super();
  }

  // Get invoice
  public async getInvoices(req: Request) {
    const { agency_id, user_id } = req.agencyB2CUser;
    const invoiceModel = this.Model.InvoiceModel();
    const query = req.query;
    const data = await invoiceModel.getInvoiceList(
      {
        source_type: SOURCE_AGENT_B2C,
        source_id: agency_id,
        user_id,
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
      const { agency_id, user_id } = req.agencyB2CUser;
      const invoiceModel = this.Model.InvoiceModel(trx);
      const { id } = req.params;
      const data = await invoiceModel.getSingleInvoice({
        id: Number(id),
        source_id: agency_id,
        source_type: SOURCE_AGENT_B2C,
        user_id,
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
        source_type: SOURCE_AGENT_B2C,
        user_id,
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
      const agencyModel = this.Model.AgencyB2CPaymentModel(trx);
      const check_balance = await agencyModel.getUserBalance(
        agency_id,
        user_id
      );

      if (check_balance < data.due) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'There is insufficient balance in your account.',
        };
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

  // Create deposit req
  public async createDepositRequest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id, agency_id } = req.agencyUser;

      const paymentModel = this.Model.AgencyPaymentModel(trx);
      const othersModel = this.Model.OthersModel(trx);

      const check_duplicate = await paymentModel.getDepositRequestList({
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
        source_type: 'ADMIN',
      });

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

      const deposit_body = {
        request_no,
        agency_id,
        ...body,
        docs,
        created_by: user_id,
      };

      const res = await paymentModel.createDepositRequest(deposit_body);

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

  // Get Deposit req
  public async getCurrentDepositRequest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const paymentModel = this.Model.AgencyPaymentModel(trx);
      const getCurrentDepositData = await paymentModel.getDepositRequestList(
        { agency_id, status: DEPOSIT_STATUS_PENDING, limit: 1 },
        false
      );
      if (!getCurrentDepositData.data.length) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          data: [],
        };
      }
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: getCurrentDepositData.data[0],
      };
    });
  }

  public async cancelCurrentDepositRequest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const paymentModel = this.Model.AgencyPaymentModel(trx);
      const getCurrentDepositData = await paymentModel.getDepositRequestList(
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
        { status: DEPOSIT_STATUS_CANCELLED },
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
      const paymentModel = this.Model.AgencyPaymentModel(trx);
      const query = req.query;
      const depositData = await paymentModel.getDepositRequestList(
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

  // Get ledger
  public async getLedger(req: Request) {
    const { user_id } = req.agencyB2CUser;
    const { agency_id } = req.agencyB2CWhiteLabel;
    const restQuery = req.query as IGetAgentB2CLedgerHistoryQuery;
    const AgencyB2CPaymentModel = this.Model.AgencyB2CPaymentModel();

    const data = await AgencyB2CPaymentModel.getLedger(
      {
        agency_id,
        user_id,
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
}
