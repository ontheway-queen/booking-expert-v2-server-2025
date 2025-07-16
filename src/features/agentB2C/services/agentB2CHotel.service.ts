import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { CTHotelSupportService } from '../../../utils/supportServices/hotelSupportServices/ctHotelSupport.service';
import { IAgentB2CHotelSearchReqBody } from '../utils/types/agentB2CHotel.types';

export default class AgentB2CHotelService extends AbstractServices {
  constructor() {
    super();
  }

  public async hotelSearch(req: Request) {
    return this.db.transaction(async (trx) => {
      const ctHotelSupport = new CTHotelSupportService(trx);
      const OthersModel = this.Model.OthersModel(trx);
      const { agency_id } = req.agencyB2CWhiteLabel;

      const { name, ...payload } = req.body as IAgentB2CHotelSearchReqBody;

      await OthersModel.insertHotelSearchHistory({
        check_in_date: payload.checkin,
        check_out_date: payload.checkout,
        guest_n_rooms: JSON.stringify(payload.rooms),
        destination_type: payload.destination,
        nationality: payload.client_nationality,
        user_type: 'Agent B2C',
        agency_id: agency_id,
        code: payload.code,
        name: name,
      });

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
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

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
      const ctHotelSupport = new CTHotelSupportService(trx);
      const agencyModel = this.Model.AgencyModel(trx);
      const { agency_id } = req.agencyB2CWhiteLabel;

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
          message: this.ResMsg.HTTP_BAD_REQUEST,
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
      const payload = req.body as {
        search_id: string;
        nights: number;
        rooms: { rate_key: string; group_code: string }[];
      };
      const { agency_id } = req.agencyB2CWhiteLabel;

      const agencyModel = this.Model.AgencyModel(trx);
      const ctHotelSupport = new CTHotelSupportService(trx);

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
          message: this.ResMsg.HTTP_BAD_REQUEST,
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

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

      return {
        success: true,
        message: this.ResMsg.HTTP_OK,
        code: this.StatusCode.HTTP_OK,
        data: data,
      };
    });
  }

  public async hotelBook(req: Request) {}

  public async hotelHotelBookingList(req: Request) {}

  public async singleHotelBooking(req: Request) {}
}
