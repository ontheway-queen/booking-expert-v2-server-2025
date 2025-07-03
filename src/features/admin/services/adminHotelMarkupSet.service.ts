import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import {
  ICreateHotelMarkupSetReqBody,
  IUpdateHotelMarkupsReqBody,
} from '../utils/types/adminMarkupSetTypes';
import { SET_TYPE_HOTEL } from '../../../utils/miscellaneous/constants';
import { IInsertHotelMarkupPayload } from '../../../utils/modelTypes/dynamicFareRulesModelTypes/hotelMarkupsTypes';

export class AdminHotelMarkupSetService extends AbstractServices {
  public async getMarkupSet(req: Request) {
    return this.db.transaction(async (trx) => {
      const query = req.query;
      const markupSetModel = this.Model.DynamicFareSetModel(trx);

      const data = await markupSetModel.getAllDynamicFareSet({
        ...query,
        type: 'Hotel',
      });

      return {
        success: true,
        data,
        code: this.StatusCode.HTTP_OK,
      };
    });
  }

  public async deleteMarkupSet(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { user_id } = req.admin;
      const markupSetModel = this.Model.DynamicFareSetModel(trx);
      const getMarkupSet = await markupSetModel.checkDynamicFareSet({
        id: Number(id),
        type: SET_TYPE_HOTEL,
      });
      if (!getMarkupSet) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await markupSetModel.updateDynamicFareSet(
        { is_deleted: true },
        { id: Number(id), type: SET_TYPE_HOTEL }
      );

      await this.insertAdminAudit(trx, {
        created_by: user_id,
        type: 'DELETE',
        details: `${getMarkupSet.type} markup set ${getMarkupSet.name} is deleted.`,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Markup Set has been deleted',
      };
    });
  }

  public async createHotelMarkupSet(req: Request) {
    return this.db.transaction(async (trx) => {
      const { user_id } = req.admin;
      const { name, book, cancel } = req.body as ICreateHotelMarkupSetReqBody;
      const MarkupSetModel = this.Model.DynamicFareSetModel(trx);
      const HotelMarkupsModel = this.Model.HotelMarkupsModel(trx);

      //check if markup set name already exists
      const checkName = await MarkupSetModel.checkDynamicFareSet({
        name,
        type: SET_TYPE_HOTEL,
      });

      if (checkName) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'Markup Set name already exists',
        };
      }

      const markupSet = await MarkupSetModel.createDynamicFareSet({
        created_by: user_id,
        name,
        type: SET_TYPE_HOTEL,
      });

      const hotelMarkupPayload: IInsertHotelMarkupPayload[] = [
        {
          markup: book.markup,
          mode: book.mode,
          markup_for: 'Book',
          type: book.type,
          set_id: markupSet[0].id,
        },
        {
          markup: cancel.markup,
          mode: cancel.mode,
          markup_for: 'Cancel',
          type: cancel.type,
          set_id: markupSet[0].id,
        },
      ];

      await HotelMarkupsModel.insertHotelMarkup(hotelMarkupPayload);

      await this.insertAdminAudit(trx, {
        created_by: user_id,
        type: 'CREATE',
        details: `Create hotel markup set ${name}.`,
        payload: JSON.stringify(req.body),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: {
          id: markupSet[0].id,
        },
      };
    });
  }

  public async getSingleHotelMarkupSet(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const set_id = Number(id);
      const markupSetModel = this.Model.DynamicFareSetModel(trx);
      const HotelMarkupsModel = this.Model.HotelMarkupsModel(trx);

      const getMarkupSet = await markupSetModel.checkDynamicFareSet({
        id: set_id,
        type: SET_TYPE_HOTEL,
      });

      if (!getMarkupSet) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const markups = await HotelMarkupsModel.getHotelMarkup({
        markup_for: 'Both',
        set_id,
      });

      let book:
        | {
            id: number;
            status: boolean;
            markup: string;
            type: 'PER' | 'FLAT';
            mode: 'INCREASE' | 'DECREASE';
          }
        | {} = {};

      let cancel:
        | {
            id: number;
            status: boolean;
            markup: string;
            type: 'PER' | 'FLAT';
            mode: 'INCREASE' | 'DECREASE';
          }
        | {} = {};

      markups.forEach((markup) => {
        if (markup.markup_for === 'Book') {
          book = {
            id: markup.id,
            markup: markup.markup,
            mode: markup.mode,
            status: markup.status,
            type: markup.type,
          };
        }

        if (markup.markup_for === 'Cancel') {
          cancel = {
            id: markup.id,
            markup: markup.markup,
            mode: markup.mode,
            status: markup.status,
            type: markup.type,
          };
        }
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          id: set_id,
          name: getMarkupSet.name,
          status: getMarkupSet.status,
          created_by: getMarkupSet.created_by,
          created_by_name: getMarkupSet.created_by_name,
          updated_by: getMarkupSet.updated_by,
          updated_by_name: getMarkupSet.updated_by_name,
          created_at: getMarkupSet.created_at,
          last_updated: getMarkupSet.last_updated,
          book,
          cancel,
        },
      };
    });
  }

  public async updateHotelMarkupSet(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { user_id } = req.admin;
      const set_id = Number(id);
      const markupSetModel = this.Model.DynamicFareSetModel(trx);
      const HotelMarkupsModel = this.Model.HotelMarkupsModel(trx);

      const getMarkupSet = await markupSetModel.checkDynamicFareSet({
        id: set_id,
        type: SET_TYPE_HOTEL,
      });

      if (!getMarkupSet) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { book, cancel, ...restBody } =
        req.body as IUpdateHotelMarkupsReqBody;

      if (book) {
        await HotelMarkupsModel.updateHotelMarkup(book, {
          set_id,
          markup_for: 'Book',
        });
      }

      if (cancel) {
        await HotelMarkupsModel.updateHotelMarkup(cancel, {
          set_id,
          markup_for: 'Cancel',
        });
      }

      await markupSetModel.updateDynamicFareSet(
        {
          ...restBody,
          updated_by: user_id,
          last_updated: new Date(),
        },
        { id: set_id, type: SET_TYPE_HOTEL }
      );

      await this.insertAdminAudit(trx, {
        created_by: user_id,
        type: 'UPDATE',
        details: `Update hotel markup set ${getMarkupSet.name}`,
        payload: JSON.stringify(req.body),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
