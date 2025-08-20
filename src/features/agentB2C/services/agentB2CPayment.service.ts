import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { IGetAgentB2CLedgerHistoryQuery } from '../utils/types/agentB2CPayment.types';
import {
  DEPOSIT_STATUS_CANCELLED,
  DEPOSIT_STATUS_PENDING,
  GENERATE_AUTO_UNIQUE_ID,
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
} from '../../../utils/miscellaneous/constants';
import Lib from '../../../utils/lib/lib';
import CustomError from '../../../utils/lib/customError';
import { ICreateDepositPayload } from '../../agent/utils/types/agentPayment.types';
import { ICreateDepositRequestPayload } from '../../../utils/modelTypes/commonModelTypes/depositRequestModel.types';

export default class AgentB2CPaymentService extends AbstractServices {
  constructor() {
    super();
  }

  // Get invoice
  public async getInvoices(req: Request) {
    const { user_id } = req.agencyB2CUser;
    const { agency_id } = req.agencyB2CWhiteLabel;
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
      const { user_id } = req.agencyB2CUser;
      const { agency_id } = req.agencyB2CWhiteLabel;
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
      const { user_id } = req.agencyB2CUser;
      const { agency_id } = req.agencyB2CWhiteLabel;
      const invoiceModel = this.Model.InvoiceModel(trx);
      const agencyB2CPaymentModel = this.Model.AgencyB2CPaymentModel(trx);
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

      const mr_no = await Lib.generateNo({ trx, type: 'Money_Receipt' });

      const moneyReceiptModel = this.Model.MoneyReceiptModel(trx);
      await invoiceModel.updateInvoice({ due: 0 }, Number(id));
      await agencyB2CPaymentModel.insertLedger({
        agency_id,
        amount: data.due,
        user_id,
        type: 'Credit',
        voucher_no: mr_no,
        details: `Due has been cleared for invoice no ${data.invoice_no}. Balance Transaction`,
      });

      await moneyReceiptModel.createMoneyReceipt({
        mr_no,
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
      const { user_id } = req.agencyB2CUser;
      const { agency_id } = req.agencyB2CWhiteLabel;

      const depositRequestModel = this.Model.DepositRequestModel(trx);
      const othersModel = this.Model.OthersModel(trx);

      const check_duplicate =
        await depositRequestModel.getAgentB2CDepositRequestList({
          agency_id,
          status: DEPOSIT_STATUS_PENDING,
          created_by: user_id,
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
        source_type: SOURCE_AGENT,
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
        type: GENERATE_AUTO_UNIQUE_ID.b2c_deposit_request,
      });

      const files = (req.files as Express.Multer.File[]) || [];
      let docs = '';
      files.forEach((file) => {
        switch (file.fieldname) {
          case 'document':
            docs = file.filename;
            break;
          default:
            throw new CustomError(
              'Invalid files. Please provide valid document',
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
        source: SOURCE_AGENT_B2C,
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
      const { user_id } = req.agencyB2CUser;
      const { agency_id } = req.agencyB2CWhiteLabel;
      const paymentModel = this.Model.DepositRequestModel(trx);
      const getCurrentDepositData =
        await paymentModel.getAgentB2CDepositRequestList(
          {
            agency_id,
            status: DEPOSIT_STATUS_PENDING,
            limit: 1,
            created_by: user_id,
          },
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
          update_note: 'Deposit Cancelled by user.',
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

  public async getDepositRequest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id } = req.agencyB2CUser;
      const { agency_id } = req.agencyB2CWhiteLabel;
      const paymentModel = this.Model.DepositRequestModel(trx);
      const query = req.query;

      const depositData = await paymentModel.getAgentB2CDepositRequestList(
        { ...query, agency_id, created_by: user_id },
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
      const { user_id } = req.agencyB2CUser;
      const { agency_id } = req.agencyB2CWhiteLabel;
      const id = Number(req.params.id);
      const paymentModel = this.Model.DepositRequestModel(trx);
      const depositData = await paymentModel.getSingleAgentB2CDepositRequest(
        id,
        agency_id,
        user_id
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
