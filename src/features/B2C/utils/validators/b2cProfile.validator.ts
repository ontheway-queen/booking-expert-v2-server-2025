import Joi from 'joi';

export default class B2CProfileValidator {
  //Update Profile schema
  public updateProfileSchema = Joi.object({
    name: Joi.string().max(500).optional(),
    two_fa: Joi.boolean().optional(),
    phone_number: Joi.string().max(20).optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  });

  public changePassword = Joi.object({
    old_password: Joi.string().required().min(8).max(100),
    new_password: Joi.string().required().min(8).max(100),
  });
}
