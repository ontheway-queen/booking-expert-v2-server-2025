import Joi from 'joi';

export default class AgentProfileValidator {
  //Update Profile schema
  public updateProfileSchema = Joi.object({
    name: Joi.string().trim().max(500).optional(),
    two_fa: Joi.boolean().optional(),
    phone_number: Joi.string().trim().max(20).optional(),
  });

  public changePassword = Joi.object({
    old_password: Joi.string().trim().required().min(8).max(100),
    new_password: Joi.string().trim().required().min(8).max(100),
  });

  public searchDataSchema = Joi.object({
    filter: Joi.string().trim().required().max(100),
  });
}
