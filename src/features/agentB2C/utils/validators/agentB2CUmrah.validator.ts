import Joi from 'joi';

export class AgentB2CUmrahValidator {
  public umrahBooking = Joi.object({
    traveler_adult: Joi.number().required(),
    traveler_child: Joi.number().optional(),
    note: Joi.string().max(1000).trim().optional(),
    name: Joi.string().trim().max(500).required(),
    email: Joi.string().email().trim().required(),
    phone: Joi.string().trim().required(),
    address: Joi.string().trim().required(),
  });

  public getUmrahBooking = Joi.object({
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    status: Joi.string().trim().max(50).optional(),
    from_date: Joi.date().raw().optional(),
    to_date: Joi.date().raw().optional(),
  });
}
