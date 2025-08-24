import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import { IGetAdminHotelBookingQuery } from '../../utils/types/adminAgentTypes/adminAgentHotel.types';
import { SOURCE_AGENT } from '../../../../utils/miscellaneous/constants';

export default class AdminAgentHotelService extends AbstractServices {
  constructor() {
    super();
  }

  public async getBooking(req: Request) {
    const { agency_id, filter, from_date, limit, skip, to_date } =
      req.query as IGetAdminHotelBookingQuery;

    const hotelBookingModel = this.Model.HotelBookingModel();

    const data = await hotelBookingModel.getHotelBooking(
      {
        source_type: SOURCE_AGENT,
        filter,
        from_date,
        to_date,
        limit,
        skip,
        source_id: agency_id,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: data.data,
      total: data.total,
    };
  }

  public async getSingleBooking(req: Request) {
    const { id } = req.params;

    const booking_id = Number(id);

    const hotelBookingModel = this.Model.HotelBookingModel();

    const data = await hotelBookingModel.getSingleHotelBooking({
      booking_id,
      source_type: SOURCE_AGENT,
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const travelers = await hotelBookingModel.getHotelBookingTraveler(
      booking_id
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: { ...data, travelers },
    };
  }

  public async updateBooking(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const booking_id = Number(id);
      const payload = req.body as {
        status?: string;
        confirmation_no?: string;
        supplier_ref?: string;
      };

      const hotelBookingModel = this.Model.HotelBookingModel(trx);

      const checkBooking = await hotelBookingModel.getSingleHotelBooking({
        booking_id,
        source_type: SOURCE_AGENT,
      });

      if (!checkBooking || Object.keys(checkBooking).length === 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await hotelBookingModel.updateHotelBooking(payload, {
        id: booking_id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
