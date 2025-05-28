import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { CTHotelSupportService } from '../../../utils/supportServices/hotelSupportServices/ctHotelSupport.service';
import {
  IAgentHotelBookingReqBody,
  IAgentHotelSearchReqBody,
} from '../utils/types/agentHotel.types';
import { ICTHotelBookingPayload } from '../../../utils/supportTypes/hotelTypes/ctHotelSupport.types';
import CustomError from '../../../utils/lib/customError';
import DateTimeLib from '../../../utils/lib/dateTimeLib';

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

      const files = (req.files as Express.Multer.File[]) || [];

      const body = req.body as IAgentHotelBookingReqBody;

      const payload: ICTHotelBookingPayload = body;

      if (payload.booking_items.length < files.length) {
        return {
          success: false,
          message:
            'Number of files does not match the number of booking items.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      if (files.length) {
        let totalPax = 0;

        payload.booking_items.forEach((item) => {
          item.rooms.forEach((room) => {
            totalPax += room.paxes.length;
          });
        });

        if (totalPax < files.length) {
          return {
            success: false,
            message:
              'Number of files does not match the total number of paxes.',
            code: this.StatusCode.HTTP_BAD_REQUEST,
          };
        }

        files.forEach((file) => {
          const splitName = file.fieldname.split('_');

          if (splitName.length !== 4) {
            throw new CustomError(
              'Invalid file field name format.',
              this.StatusCode.HTTP_BAD_REQUEST
            );
          }

          if (
            !payload.booking_items[0]?.rooms[Number(splitName[1]) - 1]?.paxes[
              Number(splitName[3]) - 1
            ]
          ) {
            throw new CustomError(
              `Room no or room pax no does not match with passport/id filename. Filename example: room_1_pax_1 - room_1(Room Number)_pax_1(Pax number)`,
              this.StatusCode.HTTP_BAD_REQUEST
            );
          }

          payload.booking_items[0].rooms[Number(splitName[1]) - 1].paxes[
            Number(splitName[3]) - 1
          ].id_file = file.filename;
        });
      }

      const recheckRoomsPayload = payload.booking_items.map((item) => {
        return {
          rate_key: item.rate_key,
          group_code: payload.group_code,
        };
      });

      const nights = DateTimeLib.nightsCount(payload.checkin, payload.checkout);

      const recheck = await ctHotelSupport.HotelRecheck(
        {
          search_id: payload.search_id,
          rooms: recheckRoomsPayload,
          nights: nights,
        },
        agent.hotel_markup_set
      );

      if (!recheck) {
        return {
          success: false,
          message: 'Booking failed. Please try again with another room.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      const booking = await ctHotelSupport.HotelBooking(
        body,
        agent.hotel_markup_set
      );

      if (!booking) {
        return {
          success: false,
          message: 'Booking failed. Please try again with another room.',
          code: this.StatusCode.HTTP_BAD_REQUEST,
        };
      }

      return {
        success: true,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        data: booking,
      };
    });
  }
}
