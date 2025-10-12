import Joi from 'joi';

export default class AgentSubAgentHotelValidator {
  public getBooking = Joi.object({
    agency_id: Joi.number().optional(),
    filter: Joi.string().optional(),
    from_date: Joi.date().optional(),
    to_date: Joi.date().optional(),
    limit: Joi.string().optional(),
    skip: Joi.string().optional(),
  });

  public updateBooking = Joi.object({
    status: Joi.string().valid('Booked', 'Cancelled', 'Confirmed').optional(),
    confirmation_no: Joi.string().optional(),
    supplier_ref: Joi.string().optional(),
  });
}
