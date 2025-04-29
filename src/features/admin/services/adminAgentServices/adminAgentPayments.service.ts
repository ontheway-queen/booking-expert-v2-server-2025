import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import {
  ICreateLoanReqBody,
  IGetLoanHistoryQuery,
} from '../../utils/types/adminAgentTypes/adminAgentPayments.types';
import { IUpdateAgencyPayload } from '../../../../utils/modelTypes/agentModel/agencyModelTypes';

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
}
