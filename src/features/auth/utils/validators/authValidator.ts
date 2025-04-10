import Joi from 'joi';

export default class AuthValidator {
  // common login input validator
  public loginValidator = Joi.object({
    user_or_email: Joi.string().required().lowercase().trim(),
    password: Joi.string().min(8).max(100).trim().required().messages({
      'string.base': 'Enter valid password',
      'string.min': 'Enter valid password minimum length 8',
      'any.required': 'Password is required',
    }),
  });

  //common register validator
  public registerValidator = Joi.object({
    first_name: Joi.string().min(1).max(255).required(),
    last_name: Joi.string().min(1).max(255).required(),
    gender: Joi.string().valid('Male', 'Female', 'Other').required(),
    email: Joi.string().email().lowercase().min(1).max(255).required(),
    password: Joi.string().min(8).max(100).required().trim(),
    phone_number: Joi.string().min(7).max(20).required(),
  });

  //login with google validator
  public loginWithGoogleValidator = Joi.object({
    accessToken: Joi.string().required(),
    image: Joi.string().optional(),
    name: Joi.string().min(1).max(255).required(),
    email: Joi.string().email().lowercase().min(1).max(255).required(),
  });

  // reset password validator
  public resetPasswordValidator = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).max(100).required().trim(),
  });
}
