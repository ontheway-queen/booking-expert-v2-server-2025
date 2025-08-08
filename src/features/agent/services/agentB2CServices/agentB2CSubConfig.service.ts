import AbstractServices from "../../../../abstract/abstract.service";
import { Request } from "express";
import {
  ICreateBankAccountReqBody,
  IUpdateBankAccountReqBody,
} from "../../utils/types/agentB2CSubTypes/agentB2CSubConfig.types";

export class AgentB2CSubConfigService extends AbstractServices {
  public async getB2CMarkup(req: Request) {
    const { agency_id } = req.agencyUser;
    const model = this.Model.AgencyModel();
    const data = await model.getAgentB2CMarkup(agency_id);
    if (!data) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "No markup has been set for B2C",
        data: {},
      };
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async upsertB2CMarkup(req: Request) {
    const { agency_id, user_id } = req.agencyUser;
    const model = this.Model.AgencyModel();
    const data = await model.getAgentB2CMarkup(agency_id);
    if (data) {
      await model.updateAgentB2CMarkup(req.body, agency_id);
    } else {
      await model.createAgentB2CMarkup({ agency_id, ...req.body });
    }

    await this.insertAgentAudit(undefined, {
      agency_id,
      created_by: user_id,
      details: "Updated/Inserted B2C markup.",
      payload: JSON.stringify(req.body),
      type: "UPDATE",
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Markup has been updated for B2C",
    };
  }

  public async getAccounts(req: Request) {
    const { agency_id } = req.agencyB2CUser;

    const configModel = this.Model.OthersModel();
    const accounts = await configModel.getAccount({
      source_type: "AGENT",
      source_id: agency_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: accounts,
    };
  }

  public async updateAccounts(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyB2CUser;

      const configModel = this.Model.OthersModel(trx);
      const { id } = req.params;
      const account_id = Number(id);

      const account = await configModel.checkAccount({
        source_type: "AGENT",
        source_id: agency_id,
        id: account_id,
      });
      const payload = req.body as IUpdateBankAccountReqBody;

      if (!account || !Object.keys(payload).length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await configModel.updateAccount(
        { id: account_id, source_type: "AGENT", source_id: agency_id },
        payload
      );

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: "Updated Account data.",
        payload: JSON.stringify(payload),
        type: "UPDATE",
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async createAccounts(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyB2CUser;

      const OtersModel = this.Model.OthersModel(trx);
      const CommonModel = this.Model.CommonModel(trx);

      const body = req.body as ICreateBankAccountReqBody;

      const checkBank = await CommonModel.getBanks({ id: body.bank_id });

      if (!checkBank.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Bank not found.",
        };
      }

      await OtersModel.createAccount(body);

      await this.insertAgentAudit(undefined, {
        agency_id,
        created_by: user_id,
        details: "New Account created.",
        payload: JSON.stringify({ ...body, bank: checkBank[0].name }),
        type: "CREATE",
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  public async deleteAccounts(req: Request) {
    const { agency_id, user_id } = req.agencyB2CUser;

    const OthersModel = this.Model.OthersModel();

    const { id } = req.params;
    const account_id = Number(id);

    const account = await OthersModel.checkAccount({
      source_type: "AGENT",
      source_id: agency_id,
      id: account_id,
    });

    if (!account) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    await OthersModel.deleteAccount({
      id: account_id,
      source_type: "AGENT",
      source_id: agency_id,
    });

    await this.insertAgentAudit(undefined, {
      agency_id,
      created_by: user_id,
      details: `Account ${account.account_name}(${account.bank_name})[${account.account_number}] is deleted.`,
      type: "DELETE",
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }
}
