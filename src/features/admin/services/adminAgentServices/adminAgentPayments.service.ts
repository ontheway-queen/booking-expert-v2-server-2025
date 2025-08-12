import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import {
  ICreateLoanReqBody,
  IGetLoanHistoryQuery,
} from '../../utils/types/adminAgentTypes/adminAgentPayments.types';
import { IUpdateAgencyPayload } from '../../../../utils/modelTypes/agentModel/agencyModelTypes';
import {
  DEPOSIT_STATUS_APPROVED,
  DEPOSIT_STATUS_PENDING,
  DEPOSIT_STATUS_REJECTED,
  GENERATE_AUTO_UNIQUE_ID,
  SOURCE_AGENT,
} from '../../../../utils/miscellaneous/constants';
import { IInsertAgencyLedgerReqBody } from '../../utils/types/adminAgentPayment.types';
import Lib from '../../../../utils/lib/lib';

export default class AdminAgentPaymentsService extends AbstractServices {
  constructor() {
    super();
  }

  public async createLoan(req: Request) {
    return this.db.transaction(async (trx) => {
      const { user_id } = req.admin;
      const { agency_id, amount, type, details } =
        req.body as ICreateLoanReqBody;
      const AgencyModel = this.Model.AgencyModel(trx);
      const AgencyPaymentModel = this.Model.AgencyPaymentModel(trx);

      const checkAgency = await AgencyModel.checkAgency({
        agency_id,
        status: 'Active',
      });

      if (!checkAgency) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Agency is not eligible for loan.',
        };
      }

      const payload: IUpdateAgencyPayload = {};

      if (type === 'Given') {
        payload.usable_loan = Number(checkAgency.usable_loan) + amount;
      } else {
        payload.usable_loan = Number(checkAgency.usable_loan) - amount;
      }

      await AgencyModel.updateAgency(payload, agency_id);

      await AgencyPaymentModel.insertLoanHistory({
        agency_id,
        amount,
        created_by: user_id,
        details,
        type,
      });

      await this.insertAdminAudit(trx, {
        created_by: user_id,
        type: 'CREATE',
        details: `${type} loan /-${amount}. Agency: ${checkAgency.agency_name}(${checkAgency.agent_no})`,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  public async loanHistory(req: Request) {
    const { agency_id, ...restQuery } = req.query as IGetLoanHistoryQuery;
    const AgencyPaymentModel = this.Model.AgencyPaymentModel();

    const data = await AgencyPaymentModel.getLoanHistory(
      {
        agency_id: Number(agency_id),
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
    const { agency_id, ...restQuery } = req.query as {
      agency_id?: string;
      from_date?: string;
      to_date?: string;
      voucher_no?: string;
      limit?: string;
      skip?: string;
    };
    const AgencyPaymentModel = this.Model.AgencyPaymentModel();

    const data = await AgencyPaymentModel.getAgencyLedger({
      agency_id: Number(agency_id),
      ...restQuery,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: data.data,
      total: data.total || 0,
    };
  }

  public async getDepositRequestList(req: Request) {
    const query = req.query;
    const depositModel = this.Model.DepositRequestModel();
    const data = await depositModel.getAgentDepositRequestList(query, true);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  public async getSingleDepositRequest(req: Request) {
    const { id } = req.params;
    const depositModel = this.Model.DepositRequestModel();
    const data = await depositModel.getSingleAgentDepositRequest(Number(id));

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data,
    };
  }

  public async updateDepositRequest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const depositModel = this.Model.DepositRequestModel(trx);
      const AgencyPaymentModel = this.Model.AgencyPaymentModel(trx);
      const data = await depositModel.getSingleAgentDepositRequest(Number(id));

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (data.status !== DEPOSIT_STATUS_PENDING) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: this.ResMsg.REQUEST_STATUS_NOT_ALLOWED_TO_CHANGE,
        };
      }

      const { status } = req.body;

      if (status === DEPOSIT_STATUS_REJECTED) {
        await depositModel.updateDepositRequest({ status }, Number(id));
      } else if (status === DEPOSIT_STATUS_APPROVED) {
        await depositModel.updateDepositRequest({ status }, Number(id));

        await AgencyPaymentModel.insertAgencyLedger({
          agency_id: data.agency_id,
          amount: data.amount,
          voucher_no: data.request_no,
          type: 'Credit',
          details: `Deposit request - ${data.request_no} has been approved.`,
        });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: `Deposit request has been updated`,
      };
    });
  }

  public async adjustBalance(req: Request) {
    return await this.db.transaction(async (trx) => {
      const body = req.body as IInsertAgencyLedgerReqBody;
      const paymentModel = this.Model.AgencyPaymentModel(trx);
      const voucher_no = await Lib.generateNo({
        trx,
        type: GENERATE_AUTO_UNIQUE_ID.agent_deposit_request,
      });
      const ledger_body = {
        voucher_no,
        ...body,
      };
      const res = await paymentModel.insertAgencyLedger(ledger_body);
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Agency Balance has been updated',
        data: {
          id: res[0].id,
          voucher_no,
        },
      };
    });
  }

  public async createADM(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id } = req.admin;
      const admModel = this.Model.ADMManagementModel(trx);
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const agentPaymentModel = this.Model.AgencyPaymentModel(trx);

      const { booking_id, amount, note } = req.body;

      //get booking
      const getBooking = await flightBookingModel.getSingleFlightBooking({
        id: Number(booking_id),
        booked_by: SOURCE_AGENT,
      });
      if (!getBooking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'No booking has been found with this ID',
        };
      }

      //create ADM
      const ref_no = await Lib.generateNo({
        trx,
        type: GENERATE_AUTO_UNIQUE_ID.adm_management,
      });
      const adm_body = {
        ref_no,
        booking_id,
        source_type: SOURCE_AGENT,
        source_id: getBooking.source_id,
        amount,
        note,
        created_by: user_id,
      };

      await admModel.createADMManagement(adm_body);

      //Create Transaction (DEBIT)
      await agentPaymentModel.insertAgencyLedger({
        agency_id: Number(getBooking.source_id),
        amount,
        type: 'Debit',
        voucher_no: ref_no,
        details: `An ADM charge has been applied for booking - ${getBooking.booking_ref}`,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'New data has been created for ADM Management',
      };
    });
  }

  public async getADMList(req: Request) {
    return await this.db.transaction(async (trx) => {
      const query = req.query;
      const admModel = this.Model.ADMManagementModel(trx);
      const data = await admModel.getADMManagementList(
        { ...query, adm_for: SOURCE_AGENT },
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

  public async getSingleADM(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const admModel = this.Model.ADMManagementModel(trx);
      const data = await admModel.getSingleADMManagementData({
        id: Number(id),
        adm_for: SOURCE_AGENT,
      });
      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data,
      };
    });
  }

  public async updateADM(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const admModel = this.Model.ADMManagementModel(trx);
      const data = await admModel.getSingleADMManagementData({
        id: Number(id),
        adm_for: SOURCE_AGENT,
      });
      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const body = req.body;
      await admModel.updateADMmanagement(body, Number(id));

      if (body.amount && Number(body.amount) !== Number(data.amount)) {
        const paymentModel = this.Model.AgencyPaymentModel(trx);
        const getLedger = await paymentModel.getAgencyLedger({
          voucher_no: data.ref_no,
        });
        if (getLedger.data.length) {
          await paymentModel.updateAgencyLedgerByVoucherNo(
            {
              amount: body.amount,
              details:
                getLedger.data[0].details +
                `. ADM Amount has been updated from ${data.amount}/= to ${body.amount}`,
            },
            data.ref_no
          );
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'ADM has been updated',
      };
    });
  }

  public async deleteADM(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const admModel = this.Model.ADMManagementModel(trx);
      const data = await admModel.getSingleADMManagementData({
        id: Number(id),
        adm_for: SOURCE_AGENT,
      });
      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await admModel.deleteADMmanagement(Number(id));

      const paymentModel = this.Model.AgencyPaymentModel(trx);
      const getLedger = await paymentModel.getAgencyLedger({
        voucher_no: data.ref_no,
      });
      if (getLedger.data.length) {
        await paymentModel.deleteAgencyLedgerByVoucherNo(data.ref_no);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'ADM has been deleted',
      };
    });
  }
}
