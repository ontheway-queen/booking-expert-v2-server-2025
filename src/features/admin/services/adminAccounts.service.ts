import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { SOURCE_ADMIN } from '../../../utils/miscellaneous/constants';
import {
  ICreateAdminAccountReqBody,
  IUpdateAdminAccountReqBody,
} from '../utils/types/adminAccounts.types';

export class AdminAccountsService extends AbstractServices {
  constructor() {
    super();
  }

  public async getAccounts(req: Request) {
    const { limit, skip, filter, status } = req.query as {
      limit?: string;
      skip?: string;
      status?: boolean;
      filter?: string;
    };

    const configModel = this.Model.OthersModel();
    const { data, total } = await configModel.getAccount(
      {
        source_type: SOURCE_ADMIN,
        limit,
        skip,
        filter,
        status,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  public async updateAccounts(req: Request) {
    return this.db.transaction(async (trx) => {
      const { user_id } = req.admin;
      const configModel = this.Model.OthersModel(trx);
      const { id } = req.params;
      const account_id = Number(id);

      const account = await configModel.checkAccount({
        source_type: SOURCE_ADMIN,
        id: account_id,
      });
      const payload = req.body as IUpdateAdminAccountReqBody;

      if (!account || !Object.keys(payload).length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await configModel.updateAccount(
        { id: account_id, source_type: SOURCE_ADMIN },
        payload
      );

      await this.insertAdminAudit(trx, {
        created_by: user_id,
        details: 'Updated Account data.',
        payload: JSON.stringify(payload),
        type: 'UPDATE',
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
      const { user_id } = req.admin;

      const OtersModel = this.Model.OthersModel(trx);
      const CommonModel = this.Model.CommonModel(trx);

      const body = req.body as ICreateAdminAccountReqBody;

      const checkBank = await CommonModel.getBanks({
        id: body.bank_id,
        status: true,
      });

      if (!checkBank.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Bank not found.',
        };
      }

      const account = await OtersModel.createAccount({
        ...body,
        source_type: SOURCE_ADMIN,
      });

      await this.insertAdminAudit(trx, {
        created_by: user_id,
        details: 'New Account created.',
        payload: JSON.stringify({ ...body, bank: checkBank.data[0].name }),
        type: 'CREATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: {
          id: account[0].id,
        },
      };
    });
  }

  public async deleteAccounts(req: Request) {
    const { user_id } = req.admin;

    const OthersModel = this.Model.OthersModel();

    const { id } = req.params;
    const account_id = Number(id);

    const account = await OthersModel.checkAccount({
      source_type: SOURCE_ADMIN,
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
      source_type: SOURCE_ADMIN,
    });

    await this.insertAdminAudit(undefined, {
      created_by: user_id,
      details: `Account ${account.account_name}(${account.bank_name})[${account.account_number}] is deleted.`,
      type: 'DELETE',
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }
}
