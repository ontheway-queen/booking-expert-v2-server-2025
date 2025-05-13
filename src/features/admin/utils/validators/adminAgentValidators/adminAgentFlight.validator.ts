import Joi from "joi";
import { FLIGHT_BOOKING_CANCELLED, FLIGHT_BOOKING_CONFIRMED, FLIGHT_BOOKING_EXPIRED, FLIGHT_BOOKING_IN_PROCESS, FLIGHT_BOOKING_ON_HOLD, FLIGHT_BOOKING_REFUNDED, FLIGHT_BOOKING_REISSUED, FLIGHT_BOOKING_REQUEST, FLIGHT_BOOKING_VOID, FLIGHT_TICKET_IN_PROCESS, FLIGHT_TICKET_ISSUE } from "../../../../../utils/miscellaneous/flightConstent";

export class AdminAgentFlightValidator {

    public getFlightListSchema = Joi.object({
        status: Joi.string().valid(FLIGHT_BOOKING_REQUEST, FLIGHT_BOOKING_CONFIRMED, FLIGHT_BOOKING_VOID, FLIGHT_BOOKING_IN_PROCESS,FLIGHT_TICKET_IN_PROCESS, FLIGHT_BOOKING_ON_HOLD, FLIGHT_TICKET_ISSUE, FLIGHT_BOOKING_EXPIRED,FLIGHT_BOOKING_CANCELLED,FLIGHT_BOOKING_REFUNDED,FLIGHT_BOOKING_REISSUED),
        from_date: Joi.date(),
        to_date: Joi.date(),
        filter: Joi.string(),
        limit: Joi.number(),
        skip: Joi.number()
    });

    public getBookingTrackingDataSchema = Joi.object({
        limit: Joi.number().allow(""),
        skip: Joi.number().allow("")
    });
}