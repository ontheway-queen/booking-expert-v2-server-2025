import Joi from 'joi';

export default class AdminAgentHotelValidator {
  public getBooking = Joi.object({
    agency_id: Joi.number().optional(),
    filter: Joi.string().optional(),
    from_date: Joi.date().optional(),
    to_date: Joi.date().optional(),
    limit: Joi.string().optional(),
    skip: Joi.string().optional(),
  });
}
