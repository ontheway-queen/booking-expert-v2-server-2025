import Joi from "joi";
import { HOLIDAY_BOOKING_STATUS } from "../../../../../utils/miscellaneous/holidayConstants";

export class AdminAgentHolidayValidator {

    public holidayPackageBookingListFilterQuery = Joi.object({
        status: Joi.string().optional().valid(HOLIDAY_BOOKING_STATUS),
        from_date: Joi.date().optional(),
        to_date: Joi.date().optional(),
        filter: Joi.string().trim().optional(),
        limit: Joi.number().optional().allow(""),
        skip: Joi.number().optional().allow("")
    });

    public holidayPackageUpdateSchema = Joi.object({
        status: Joi.string().required().valid(HOLIDAY_BOOKING_STATUS.CONFIRMED,HOLIDAY_BOOKING_STATUS.COMPLETED,HOLIDAY_BOOKING_STATUS.IN_PROGRESS,HOLIDAY_BOOKING_STATUS.REFUNDED,HOLIDAY_BOOKING_STATUS.REJECTED)
    });
}