import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import {
  DEPOSIT_STATUS_APPROVED,
  DEPOSIT_STATUS_PENDING,
  DEPOSIT_STATUS_REJECTED,
} from '../../../../utils/miscellaneous/constants';
import {
  deposit_status,
  IGetAgentB2CDepositRequestListFilterQuery,
} from '../../../../utils/modelTypes/commonModelTypes/depositRequestModel.types';

export class AgentB2CSubPaymentService extends AbstractServices {
  constructor() {
    super();
  }

  public async getDepositRequestList(req: Request) {
    const query = req.query as {
      from_date?: string;
      to_date?: string;
      user_id?: number;
      status?: deposit_status;
      limit?: string;
      skip?: string;
      filter?: string;
    };
    const { agency_id } = req.agencyUser;
    const depositModel = this.Model.DepositRequestModel();

    const queryParams: IGetAgentB2CDepositRequestListFilterQuery = {
      agency_id,
    };
    if (query.filter) {
      queryParams.filter = query.filter;
    }
    if (query.from_date && query.to_date) {
      queryParams.from_date = query.from_date;
    }

    if (query.user_id) {
      queryParams.created_by = query.user_id;
    }
    if (query.limit) {
      queryParams.filter = query.limit;
    }
    if (query.status !== undefined) {
      queryParams.status = query.status;
    }
    if (query.skip) {
      queryParams.filter = query.skip;
    }

    const data = await depositModel.getAgentB2CDepositRequestList(
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
    const data = await depositModel.getSingleAgentB2CDepositRequest(
      Number(id),
      agency_id
    );

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
      const { agency_id } = req.agencyUser;

      const depositModel = this.Model.DepositRequestModel(trx);
      const AgencyPaymentModel = this.Model.AgencyB2CPaymentModel(trx);
      const data = await depositModel.getSingleAgentB2CDepositRequest(
        Number(id),
        agency_id
      );

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

        await AgencyPaymentModel.insertLedger({
          agency_id: agency_id,
          user_id: data.created_by,
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
}
