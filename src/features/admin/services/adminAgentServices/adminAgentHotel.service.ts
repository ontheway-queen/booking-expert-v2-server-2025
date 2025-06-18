import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import { IGetAdminHotelBookingQuery } from '../../utils/types/adminAgentTypes/adminAgentHotel.types';

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
        source_type: 'AGENT',
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

    const hotelBookingModel = this.Model.HotelBookingModel();

    const data = await hotelBookingModel.getSingleBooking({
      booking_id: Number(id),
      source_type: 'AGENT',
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
  }
}
