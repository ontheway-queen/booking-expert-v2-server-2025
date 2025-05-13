import AbstractServices from "../../../../abstract/abstract.service";
import { Request } from 'express';
import { SOURCE_AGENT } from "../../../../utils/miscellaneous/constants";

export class AdminAgentFlightService extends AbstractServices {

    constructor() {
        super();
    }

    public async getAllFlightBooking(req: Request) {
        return await this.db.transaction(async (trx) => {
            const flightBookingModel = this.Model.FlightBookingModel(trx);
            const query = req.query;
            const data = await flightBookingModel.getFlightBookingList({ ...query, booked_by: SOURCE_AGENT }, true);

            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data
            };
        });
    }

    public async getSingleBooking(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { id } = req.params;
            const flightBookingModel = this.Model.FlightBookingModel(trx);
            const flightSegmentModel = this.Model.FlightBookingSegmentModel(trx);
            const flightTravelerModel = this.Model.FlightBookingTravelerModel(trx);
            const flightPriceBreakdownModel = this.Model.FlightBookingPriceBreakdownModel(trx);

            const booking_data = await flightBookingModel.getSingleFlightBooking({
                id: Number(id),
                booked_by: SOURCE_AGENT
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

    public async getBookingTrackingData(req: Request) {
        return await this.db.transaction(async (trx) => {
            const flightBookingModel = this.Model.FlightBookingModel(trx);
            const bookingTrackingModel = this.Model.FlightBookingTrackingModel();
            const { id } = req.params;
            const { limit, skip } = req.query as unknown as { limit: number, skip: number };

            const booking_data = await flightBookingModel.getSingleFlightBooking({
                id: Number(id),
                booked_by: SOURCE_AGENT
            });

            if (!booking_data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                };
            };

            const tracking_data = await bookingTrackingModel.getFlightBookingTracking({ flight_booking_id: Number(id), limit, skip }, true);

            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: tracking_data.total,
                data: tracking_data.data
            };
        });
    }

}