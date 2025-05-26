import AbstractServices from "../../../../abstract/abstract.service";
import { Request } from "express";
import { SOURCE_AGENT_B2C } from "../../../../utils/miscellaneous/constants";
export class AgentB2CSubFlightService extends AbstractServices {

    public async getAllBooking(req: Request) {
        const { agency_id } = req.agencyUser;
        const flightBookingModel = this.Model.FlightBookingModel();
        const query = req.query;
        const data = await flightBookingModel.getFlightBookingList({ ...query, source_id: agency_id, booked_by: SOURCE_AGENT_B2C }, true);

        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            total: data.total,
            data: data.data
        };
    }

    public async getSingleBooking(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { agency_id } = req.agencyUser;
            const { id } = req.params;
            const flightBookingModel = this.Model.FlightBookingModel(trx);
            const flightSegmentModel = this.Model.FlightBookingSegmentModel(trx);
            const flightTravelerModel = this.Model.FlightBookingTravelerModel(trx);
            const flightPriceBreakdownModel = this.Model.FlightBookingPriceBreakdownModel(trx);

            const booking_data = await flightBookingModel.getSingleFlightBooking({
                id: Number(id),
                booked_by: SOURCE_AGENT_B2C,
                agency_id,
            });

            if (!booking_data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                };
            };

            const price_breakdown_data = await flightPriceBreakdownModel.getFlightBookingPriceBreakdown(Number(id));
            const segment_data = await flightSegmentModel.getFlightBookingSegment(Number(id));
            const traveler_data = await flightTravelerModel.getFlightBookingTraveler(Number(id));

            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: {
                    ...booking_data,
                    price_breakdown_data,
                    segment_data,
                    traveler_data
                }
            };
        });
    }
}