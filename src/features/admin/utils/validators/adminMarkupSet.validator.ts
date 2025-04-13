import Joi from 'joi';

export default class AdminMarkupSetValidator {

  public createMarkupSetSchema = Joi.object({
    name: Joi.string().required(),
    api: Joi.array()
      .items(
        Joi.object({
          api_id: Joi.number().required(),
          airlines: Joi.array()
            .min(1)
            .items(Joi.string().length(2).required())
            .required(),
          markup_domestic: Joi.number().required(),
          markup_from_dac: Joi.number().required(),
          markup_to_dac: Joi.number().required(),
          markup_soto: Joi.number().required(),
          markup_type: Joi.string().valid('PER', 'FLAT').required(),
          markup_mode: Joi.string().valid('INCREASE', 'DECREASE').required(),
        })
      )
      .min(1)
      .optional(),
  });


}
