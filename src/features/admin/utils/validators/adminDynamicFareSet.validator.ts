import Joi from 'joi';

export class AdminDynamicFareSetValidator {
  public createSet = Joi.object({
    name: Joi.string().required(),
  });

  public updateSet = Joi.object({
    name: Joi.string().optional(),
  });
}
