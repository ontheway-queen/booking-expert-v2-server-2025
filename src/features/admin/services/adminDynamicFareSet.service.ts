import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { TYPE_FLIGHT } from '../../../utils/miscellaneous/constants';

export default class AdminDynamicFareSetService extends AbstractServices {
  constructor() {
    super();
  }

  public async createSet(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { name } = req.body;
      const { user_id: created_by } = req.admin;
      const model = this.Model.DynamicFareSetModel(trx);
      const check_duplicate = await model.checkDynamicFareSet({
        type: TYPE_FLIGHT,
        name,
      });

      if (check_duplicate) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'Set already exists with this name',
        };
      }
      const res = await model.createDynamicFareSet({
        name,
        created_by,
        type: TYPE_FLIGHT,
      });
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Dynamic fare set has been created',
        data: { id: res[0]?.id },
      };
    });
  }

  public async getSets(req: Request) {
    const model = this.Model.DynamicFareSetModel();
    const data = await model.getAllDynamicFareSet({ type: TYPE_FLIGHT });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateSet(req: Request) {
    const model = this.Model.DynamicFareSetModel();
    const { id } = req.params;
    const body = req.body;
    const existing = await model.checkDynamicFareSet({
      type: TYPE_FLIGHT,
      id: Number(id),
    });
    if (!existing) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    if (body.name) {
      const check_duplicate = await model.checkDynamicFareSet({
        name: body.name,
        type: TYPE_FLIGHT,
      });

      if (check_duplicate) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'Set already exists with this name',
        };
      }
    }

    await model.updateDynamicFareSet(body, {
      id: Number(id),
      type: TYPE_FLIGHT,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Dynamic fare set updated',
    };
  }

  public async deleteSet(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.DynamicFareSetModel(trx);
      const { id } = req.params;
      const existing = await model.checkDynamicFareSet({
        type: TYPE_FLIGHT,
        id: Number(id),
      });

      if (!existing) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const checkUsage = await model.checkUsages({
        id: Number(id),
        type: TYPE_FLIGHT,
      });

      if (checkUsage) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message:
            'This set is already used for agencies. To continue update sets of the agencies.',
        };
      }

      await model.updateDynamicFareSet(
        { is_deleted: true },
        { id: Number(id), type: TYPE_FLIGHT }
      );
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Dynamic fare set deleted',
      };
    });
  }

  public async getSupplierList(req: Request) {
    const model = this.Model.DynamicFareModel();
    const data = await model.getSupplierList();
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }
}
