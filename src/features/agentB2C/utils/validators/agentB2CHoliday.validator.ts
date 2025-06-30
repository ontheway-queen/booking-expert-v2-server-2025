import Joi from 'joi';
import { HOLIDAY_BOOKING_STATUS } from '../../../../utils/miscellaneous/holidayConstants';

export class AgentB2CHolidayValidator {
  public holidayPackageSearchFilterQuerySchema = Joi.object({
    city_id: Joi.number().optional(),
    date: Joi.date().optional(),
    limit: Joi.number().optional().allow(''),
    skip: Joi.number().optional().allow(''),
  });

  public holidayPackageCreateBookingSchema = Joi.object({
    holiday_package_id: Joi.number().required(),
    total_adult: Joi.number().required(),
    total_child: Joi.number().required(),
    travel_date: Joi.date().required(),
    contact_email: Joi.string().email().lowercase().trim().required(),
    contact_number: Joi.string().trim().required(),
    note_from_customer: Joi.string().optional().allow(''),
  });

  public holidayPackageBookingListFilterQuery = Joi.object({
    status: Joi.string()
      .optional()
      .valid(...Object.values(HOLIDAY_BOOKING_STATUS)),
    from_date: Joi.date().optional(),
    to_date: Joi.date().optional(),
    filter: Joi.string().trim().optional(),
    limit: Joi.number().optional().allow(''),
    skip: Joi.number().optional().allow(''),
  });
}
