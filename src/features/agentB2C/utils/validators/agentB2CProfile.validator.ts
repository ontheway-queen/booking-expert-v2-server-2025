import Joi from 'joi';

export class AgentB2CProfileValidator {
  //Update Profile schema
  public updateProfileSchema = Joi.object({
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    name: Joi.string().trim().max(500).optional(),
    phone_number: Joi.string().trim().max(20).optional(),
  });

  public changePassword = Joi.object({
    old_password: Joi.string().required().trim().min(8).max(50),
    new_password: Joi.string()
      .required()
      .trim()
      .min(8)
      .max(50)
      .invalid(Joi.ref('old_password'))
      .messages({
        'any.invalid': 'New password must be different from the old password.',
      }),
  });
}
