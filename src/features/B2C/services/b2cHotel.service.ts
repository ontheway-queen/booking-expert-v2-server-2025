import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { IB2CHotelSearchReqBody } from '../utils/types/b2cHotel.types';
import { CTHotelSupportService } from '../../../utils/supportServices/hotelSupportServices/ctHotelSupport.service';

export default class B2CHotelService extends AbstractServices {
  constructor() {
    super();
  }

  public async hotelSearch(req: Request) {
    return this.db.transaction(async (trx) => {
      const ctHotelSupport = new CTHotelSupportService(trx);
      const OthersModel = this.Model.OthersModel(trx);

      const { name, ...payload } = req.body as IB2CHotelSearchReqBody;

      await OthersModel.insertHotelSearchHistory({
        check_in_date: payload.checkin,
        check_out_date: payload.checkout,
        guest_n_rooms: JSON.stringify(payload.rooms),
        destination_type: payload.destination,
        nationality: payload.client_nationality,
        user_type: 'B2C',
        code: payload.code,
        name: name,
      });

      const configMarkup = this.Model.B2CMarkupConfigModel(trx);
      const markup = await configMarkup.getB2CMarkupConfigData('Hotel');

      if (!markup.length) {
        return {
          success: false,
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      const result = await ctHotelSupport.HotelSearch(
        payload,
        markup[0].markup_set_id
      );

      if (result) {
        return {
          success: true,
          message: this.ResMsg.HTTP_OK,
          code: this.StatusCode.HTTP_OK,
          data: result,
        };
      }

      return {
        success: false,
        message: this.ResMsg.HTTP_NOT_FOUND,
        code: this.StatusCode.HTTP_NOT_FOUND,
      };
    });
  }

  public async getHotelRooms(req: Request) {
    return this.db.transaction(async (trx) => {
      const ctHotelSupport = new CTHotelSupportService(trx);
      const configMarkup = this.Model.B2CMarkupConfigModel(trx);
      const markup = await configMarkup.getB2CMarkupConfigData('Hotel');

      if (!markup.length) {
        return {
          success: false,
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      const payload = req.body as { hcode: number; search_id: string };

      const result = await ctHotelSupport.HotelRooms(
        payload,
        markup[0].markup_set_id
      );

      if (result) {
        return {
          success: true,
          message: this.ResMsg.HTTP_OK,
          code: this.StatusCode.HTTP_OK,
          data: result,
        };
      }

      return {
        success: false,
        message: this.ResMsg.HTTP_NOT_FOUND,
        code: this.StatusCode.HTTP_NOT_FOUND,
      };
    });
  }

  public async hotelRoomRecheck(req: Request) {
    return this.db.transaction(async (trx) => {
      const ctHotelSupport = new CTHotelSupportService(trx);

      const payload = req.body as {
        search_id: string;
        nights: number;
        rooms: { rate_key: string; group_code: string }[];
      };

      const configMarkup = this.Model.B2CMarkupConfigModel(trx);
      const markup = await configMarkup.getB2CMarkupConfigData('Hotel');

      if (!markup.length) {
        return {
          success: false,
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      const data = await ctHotelSupport.HotelRecheck(
        payload,
        markup[0].markup_set_id
      );

      if (!data) {
        return {
          success: false,
          message: this.ResMsg.HTTP_NOT_FOUND,
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }

      return {
        success: true,
        message: this.ResMsg.HTTP_OK,
        code: this.StatusCode.HTTP_OK,
        data: data,
      };
    });
  }
}
