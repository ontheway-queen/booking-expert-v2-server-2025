import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';

export class AgentSubAgentHolidayService extends AbstractServices {
  constructor() {
    super();
  }

  public async getHolidayPackageBookingList(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const holidayPackageBookingModel =
        this.Model.HolidayPackageBookingModel(trx);
      const query = req.query;

      const getBookingList =
        await holidayPackageBookingModel.getHolidayBookingList(
          {
            source_type: SOURCE_SUB_AGENT,
            source_id: agency_id,
            ...query,
          },
          true
        );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        total: getBookingList.total,
        data: getBookingList.data,
      };
    });
  }

  public async getSingleHolidayPackageBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const holidayPackageBookingModel =
        this.Model.HolidayPackageBookingModel(trx);
      const { id } = req.params as unknown as { id: number };

      const get_booking =
        await holidayPackageBookingModel.getSingleHolidayBooking({
          id,
          booked_by: SOURCE_SUB_AGENT,
          source_id: agency_id,
        });

      if (!get_booking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      } else {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          data: get_booking,
        };
      }
    });
  }
}
