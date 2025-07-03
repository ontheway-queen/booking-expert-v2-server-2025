import Joi from 'joi';

export default class AdminHotelMarkupSetValidator {
  public getMarkupSetSchema = Joi.object({
    filter: Joi.string().optional(),
    status: Joi.boolean().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
  });

  public createHotelMarkup = Joi.object({
    name: Joi.string().trim().required(),
    book: Joi.object({
      markup: Joi.number().required(),
      type: Joi.string().valid('PER', 'FLAT').required(),
      mode: Joi.string().valid('INCREASE', 'DECREASE').required(),
    }),
    cancel: Joi.object({
      markup: Joi.number().required(),
      type: Joi.string().valid('PER', 'FLAT').required(),
      mode: Joi.string().valid('INCREASE', 'DECREASE').required(),
    }),
  });

  public updateHotelMarkup = Joi.object({
    name: Joi.string().optional(),
    status: Joi.boolean().optional(),
    book: Joi.object({
      markup: Joi.number().required(),
      type: Joi.string().valid('PER', 'FLAT').required(),
      mode: Joi.string().valid('INCREASE', 'DECREASE').required(),
    }).optional(),
    cancel: Joi.object({
      markup: Joi.number().required(),
      type: Joi.string().valid('PER', 'FLAT').required(),
      mode: Joi.string().valid('INCREASE', 'DECREASE').required(),
    }).optional(),
  });
}
