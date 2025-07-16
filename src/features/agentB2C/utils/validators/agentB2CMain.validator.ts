import Joi from 'joi';
import { OTP_TYPES } from '../../../../utils/miscellaneous/constants';

export default class AgentB2CMainValidator {
  // send email otp input validator
  public sendOtpInputValidator = Joi.object({
    type: Joi.string().valid(OTP_TYPES.reset_agent_b2c).required().messages({
      'string.base': 'Please enter valid OTP type',
      'any.only': 'Please enter valid OTP type',
      'any.required': 'OTP type is required',
    }),
    email: Joi.string().email().trim().lowercase().required().messages({
      'string.base': 'Enter valid email address',
      'string.email': 'Enter valid email address',
      'any.required': 'Email is required',
    }),
  });

  // match email otp input validator
  public matchEmailOtpInputValidator = Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
      'string.base': 'Enter valid email',
      'string.email': 'Enter valid email',
      'any.required': 'Email is required',
    }),
    otp: Joi.string().length(6).required().messages({
      'string.base': 'Enter valid otp',
      'any.required': 'OTP is required',
    }),
    type: Joi.string().valid(OTP_TYPES.reset_agent_b2c).required().messages({
      'string.base': 'Enter valid otp type',
      'any.only': 'Enter valid otp type',
      'any.required': 'OTP type is required',
    }),
  });
}
