import { Request } from "express";
import AbstractServices from "../../../../abstract/abstract.service";
import {
  SOURCE_AGENT,
  SOURCE_SUB_AGENT,
} from "../../../../utils/miscellaneous/constants";
import { ISubAgentGetFlightBookingReqQuery } from "../../../subAgent/utils/types/subAgentFlight.types";

export class AgentSubAgentFlightService extends AbstractServices {
  constructor() {
    super();
  }

  public async getAllBookingList(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const query = req.query as ISubAgentGetFlightBookingReqQuery;

      const data = await flightBookingModel.getFlightBookingList(
        { ...query, source_id: agency_id, booked_by: SOURCE_SUB_AGENT },
        true
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        total: data.total,
        data: data.data,
      };
    });
  }

  public async getSingleBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const { id } = req.params;
      const flightBookingModel = this.Model.FlightBookingModel(trx);
      const flightSegmentModel = this.Model.FlightBookingSegmentModel(trx);
      const flightTravelerModel = this.Model.FlightBookingTravelerModel(trx);
      const flightPriceBreakdownModel =
        this.Model.FlightBookingPriceBreakdownModel(trx);

      const booking_data = await flightBookingModel.getSingleFlightBooking({
        id: Number(id),
        booked_by: SOURCE_AGENT,
        agency_id,
      });

      if (!booking_data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const price_breakdown_data =
        await flightPriceBreakdownModel.getFlightBookingPriceBreakdown(
          Number(id)
        );

      const segment_data = await flightSegmentModel.getFlightBookingSegment(
        Number(id)
      );
      const traveler_data = await flightTravelerModel.getFlightBookingTraveler(
        Number(id)
      );

      const { vendor_fare, source_type, ...restData } = booking_data;

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: {
          ...restData,
          price_breakdown_data,
          segment_data,
          traveler_data,
        },
      };
    });
  }
}
