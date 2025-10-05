import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import {
  deposit_status,
  IGetDepositRequestListFilterQuery,
} from '../../../../utils/modelTypes/commonModelTypes/depositRequestModel.types';
import {
  DEPOSIT_STATUS_APPROVED,
  DEPOSIT_STATUS_PENDING,
  DEPOSIT_STATUS_REJECTED,
} from '../../../../utils/miscellaneous/constants';
import {
  IAdjustAgentSubAgentLedgerReqBody,
  IGetAgentSubAgentLedgerHistoryQuery,
} from '../../utils/types/agentSubAgentTypes/agentSubAgentPayments.types';

export class AgentSubAgentPaymentService extends AbstractServices {
  constructor() {
    super();
  }

  public async getDepositRequestList(req: Request) {
    const query = req.query as {
      from_date?: string;
      to_date?: string;
      agency_id?: number;
      status?: deposit_status;
      limit?: string;
      skip?: string;
      filter?: string;
    };
    const { agency_id } = req.agencyUser;
    const depositModel = this.Model.DepositRequestModel();

    const queryParams: IGetDepositRequestListFilterQuery = {
      ref_agency_id: agency_id,
    };

    if (query.filter) {
      queryParams.filter = query.filter;
    }
    if (query.from_date && query.to_date) {
      queryParams.from_date = query.from_date;
    }

    if (query.agency_id) {
      queryParams.agency_id = query.agency_id;
    }
    if (query.limit) {
      queryParams.limit = Number(query.limit);
    }
    if (query.status !== undefined) {
      queryParams.status = query.status;
    }
    if (query.skip) {
      queryParams.skip = Number(query.skip);
    }

    const data = await depositModel.getSubAgentDepositRequestList(
      queryParams,
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  public async getSingleDepositRequest(req: Request) {
    const { id } = req.params;
    const { agency_id } = req.agencyUser;

    const depositModel = this.Model.DepositRequestModel();
    const data = await depositModel.getSingleSubAgentDepositRequest({
      id: Number(id),
      ref_agency_id: agency_id,
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
      data: data,
    };
  }

  public async updateDepositRequest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { agency_id, user_id } = req.agencyUser;
      const depositModel = this.Model.DepositRequestModel(trx);

      const AgencyPaymentModel = this.Model.AgencyPaymentModel(trx);
      const data = await depositModel.getSingleSubAgentDepositRequest({
        id: Number(id),
        ref_agency_id: agency_id,
      });

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

      const { status, note } = req.body as {
        status: 'APPROVED' | 'REJECTED';
        note?: string;
      };

      if (status === DEPOSIT_STATUS_REJECTED) {
        await depositModel.updateDepositRequest(
          {
            status,
            update_note: note,
            updated_by: user_id,
            updated_at: new Date(),
          },
          Number(id)
        );
      } else if (status === DEPOSIT_STATUS_APPROVED) {
        await depositModel.updateDepositRequest(
          {
            status,
            update_note: note,
            updated_by: user_id,
            updated_at: new Date(),
          },
          Number(id)
        );

        await AgencyPaymentModel.insertAgencyLedger({
          agency_id: agency_id,
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

  public async getLedger(req: Request) {
    const { agency_id: main_agency_id } = req.agencyUser;
    const query = req.query as IGetAgentSubAgentLedgerHistoryQuery;
    const AgencyB2CPaymentModel = this.Model.AgencyPaymentModel();

    const data = await AgencyB2CPaymentModel.getAgencyLedger(
      {
        ref_agency_id: main_agency_id,
        ...query,
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

  public async balanceAdjust(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id: main_agency_id } = req.agencyUser;
      const { amount, type, details, voucher_no, payment_date, agency_id } =
        req.body as IAdjustAgentSubAgentLedgerReqBody;

      const AgencyPaymentModel = this.Model.AgencyPaymentModel(trx);

      const checkVoucher = await AgencyPaymentModel.getAgencyLedger({
        voucher_no,
        agency_id,
        ref_agency_id: main_agency_id,
      });

      if (checkVoucher.data.length > 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'Voucher No already exists',
        };
      }

      await AgencyPaymentModel.insertAgencyLedger({
        agency_id,
        amount,
        details,
        type,
        voucher_no,
        ledger_date: payment_date,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Balance adjusted successfully',
      };
    });
  }
}
