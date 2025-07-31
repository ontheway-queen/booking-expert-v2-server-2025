import Joi from 'joi';

export class AgentB2CSubUmrahValidator {
  public parsedSchema = Joi.array().items(Joi.string());

  public createUmrahSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    short_description: Joi.string().optional(),
    duration: Joi.number().optional().positive(),
    valid_till_date: Joi.string().isoDate().optional(),
    group_size: Joi.number().optional().positive(),
    adult_price: Joi.number().required().positive(),
    child_price: Joi.number().required().positive(),
    package_details: Joi.string().optional(),
    umrah_for: Joi.string().valid('AGENT', 'B2C', 'BOTH').required(),
    slug: Joi.string().required(),
    meta_title: Joi.string().required(),
    meta_description: Joi.string().required(),
    package_price_details: Joi.string().optional(),
    package_accommodation_details: Joi.string().optional(),
    package_include: Joi.array().items(Joi.string()).required(),
  });

  public getUmrahListQuerySchema = Joi.object({
    limit: Joi.number().required(),
    skip: Joi.number().required(),
    filter: Joi.string().optional(),
    status: Joi.boolean().optional(),
  });


  public updateUmrahSchema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    short_description: Joi.string().optional(),
    duration: Joi.number().optional().positive(),
    valid_till_date: Joi.string().isoDate().optional(),
    group_size: Joi.number().optional().positive(),
    adult_price: Joi.number().optional().positive(),
    child_price: Joi.number().optional().positive(),
    package_details: Joi.string().optional(),
    umrah_for: Joi.string().valid('AGENT', 'B2C', 'BOTH').optional(),
    slug: Joi.string().optional(),
    status: Joi.boolean().optional(),
    meta_title: Joi.string().optional(),
    meta_description: Joi.string().optional(),
    package_price_details: Joi.string().optional(),
    package_accommodation_details: Joi.string().optional(),
    add_package_include: Joi.array().items(Joi.string().allow('')).optional().required(),
    remove_package_include: Joi.array().items(Joi.number().allow('')).required(),
    remove_images: Joi.array().items(Joi.number().allow('')).required(),
  });
}
