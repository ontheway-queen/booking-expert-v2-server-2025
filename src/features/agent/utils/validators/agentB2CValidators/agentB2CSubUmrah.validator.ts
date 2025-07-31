import Joi from 'joi';

export class AgentB2CSubUmrahValidator {
  public createUmrahSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    short_description: Joi.string().optional(),
    duration: Joi.number().optional().positive(),
    valid_till_date: Joi.string().optional(),
    group_size: Joi.number().optional().positive(),
    adult_price: Joi.number().required().positive(),
    child_price: Joi.number().required().positive(),
    package_details: Joi.string().optional(),
    umrah_for: Joi.string().valid('AGENT', 'B2C', 'BOTH').required(),
    slug: Joi.string().required(),
    meta_tag: Joi.string().required(),
    meta_description: Joi.string().required(),
    package_price_details: Joi.string().optional(),
    package_accommodation_details: Joi.string().optional(),
    package_include: Joi.array().items(Joi.string()).optional(),
  });
}
