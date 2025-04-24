import Joi from 'joi';

export default class AdminProfileValidator {
  //Update Profile schema
  public updateProfileSchema = Joi.object({
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    name: Joi.string().trim().max(500).optional(),
    two_fa: Joi.boolean().optional(),
    phone_number: Joi.string().trim().max(20).optional(),
  });

  public changePassword = Joi.object({
    old_password: Joi.string().required().trim().min(8).max(100),
    new_password: Joi.string().required().trim().min(8).max(100),
  });
}
