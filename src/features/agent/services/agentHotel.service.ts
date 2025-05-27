import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { CTHotelSupportService } from '../../../utils/supportServices/hotelSupportServices/ctHotelSupport.service';
import {
  IAgentHotelBookingReqBody,
  IAgentHotelSearchReqBody,
} from '../utils/types/agentHotel.types';
import { ICTHotelBookingPayload } from '../../../utils/supportTypes/hotelTypes/ctHotelSupport.types';

export class AgentHotelService extends AbstractServices {
  constructor() {
    super();
  }

  public async hotelSearch(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;
      const ctHotelSupport = new CTHotelSupportService(trx);
      const agencyModel = this.Model.AgencyModel(trx);
      const OthersModel = this.Model.OthersModel(trx);

      const agent = await agencyModel.checkAgency({
        agency_id,
        status: 'Active',
      });

      if (!agent) {
        return {
          success: false,
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      if (!agent.hotel_markup_set) {
        return {
          success: false,
          message: 'Hotel markup set is not configured for this agency.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      const { name, ...payload } = req.body as IAgentHotelSearchReqBody;

      await OthersModel.insertHotelSearchHistory({
        check_in_date: payload.checkin,
        check_out_date: payload.checkout,
        guest_n_rooms: JSON.stringify(payload.rooms),
        destination_type: payload.destination,
        user_id: user_id,
        nationality: payload.client_nationality,
        user_type: 'Agent',
        agency_id,
        code: payload.code,
        name: name,
      });

      const result = await ctHotelSupport.HotelSearch(
        payload,
        agent.hotel_markup_set
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
      const { agency_id } = req.agencyUser;
      const ctHotelSupport = new CTHotelSupportService(trx);
      const agencyModel = this.Model.AgencyModel(trx);

      const agent = await agencyModel.checkAgency({
        agency_id,
        status: 'Active',
      });

      if (!agent) {
        return {
          success: false,
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      if (!agent.hotel_markup_set) {
        return {
          success: false,
          message: 'Hotel markup set is not configured for this agency.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }
      const payload = req.body as { hcode: number; search_id: string };

      const result = await ctHotelSupport.HotelRooms(
        payload,
        agent.hotel_markup_set
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
      const { agency_id } = req.agencyUser;
      const ctHotelSupport = new CTHotelSupportService(trx);
      const agencyModel = this.Model.AgencyModel(trx);

      const agent = await agencyModel.checkAgency({
        agency_id,
        status: 'Active',
      });

      if (!agent) {
        return {
          success: false,
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      if (!agent.hotel_markup_set) {
        return {
          success: false,
          message: 'Hotel markup set is not configured for this agency.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      const payload = req.body as {
        search_id: string;
        nights: number;
        rooms: { rate_key: string; group_code: string }[];
      };

      const data = await ctHotelSupport.HotelRecheck(
        payload,
        agent.hotel_markup_set
      );

      if (!data) {
        return {
          success: false,
          message: this.ResMsg.HTTP_NOT_FOUND,
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }

      const { supplier_fee, supplier_rates, ...restData } = data;

      return {
        success: true,
        message: this.ResMsg.HTTP_OK,
        code: this.StatusCode.HTTP_OK,
        data: restData,
      };
    });
  }

  public async hotelBooking(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;
      const ctHotelSupport = new CTHotelSupportService(trx);
      const agencyModel = this.Model.AgencyModel(trx);

      const agent = await agencyModel.checkAgency({
        agency_id,
        status: 'Active',
      });

      if (!agent) {
        return {
          success: false,
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      if (!agent.hotel_markup_set) {
        return {
          success: false,
          message: 'Hotel markup set is not configured for this agency.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      // const files = (req.files as Express.Multer.File[]) || [];

      const body = req.body as IAgentHotelBookingReqBody;

      const payload: ICTHotelBookingPayload = req.body;

      // if (payload.booking_items.length < files.length) {
      //   return {
      //     success: false,
      //     message:
      //       'Number of files does not match the number of booking items.',
      //     code: this.StatusCode.HTTP_BAD_REQUEST,
      //   };
      // }

      // if (files.length) {
      //   files.forEach((file) => {
      //     if (file.fieldname === 'lead_passport') {
      //       payload.booking_items = file.filename;
      //     }
      //   });
      // }

      const booking = await ctHotelSupport.HotelBooking(
        body,
        agent.hotel_markup_set
      );

      return {
        success: true,
        message: this.ResMsg.HTTP_NOT_FOUND,
        code: this.StatusCode.HTTP_OK,
        data: body,
      };
    });
  }
}
