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

  public login2FAValidator = Joi.object({
    email: Joi.string().required().lowercase().trim(),
    otp: Joi.string().length(6).trim().required(),
  });

  //agency register validator
  public agencyRegisterValidator = Joi.object({
    user_name: Joi.string().trim().min(4).max(255).required(),
    agency_name: Joi.string().trim().min(4).max(255).required(),
    email: Joi.string().email().trim().lowercase().max(255).required(),
    address: Joi.string().min(8).max(100).required().trim(),
    phone: Joi.string().min(7).max(20).required().trim(),
  });

  //Complete Registration Validator
  public agencyRegisterCompleteValidator = Joi.object({
    token: Joi.string().required(),
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
