import Joi from 'joi';

export default class PublicCommonValidator {
  //single param number validator
  public singleParamNumValidator = (idFieldName: string = 'id') => {
    const schemaObject: any = {};
    schemaObject[idFieldName] = Joi.number().required();
    return Joi.object(schemaObject);
  };

  // single param string validator
  public singleParamStringValidator = (idFieldName: string = 'id') => {
    const schemaObject: any = {};
    schemaObject[idFieldName] = Joi.string().required();
    return Joi.object(schemaObject);
  };

  // multiple params number validator
  public multipleParamsNumValidator(fields: string[]) {
    const schemaObject: any = {};

    fields.forEach((item) => {
      schemaObject[item] = Joi.number().required();
    });

    return Joi.object(schemaObject);
  }

  // multiple params string validator
  public multipleParamsStringValidator(fields: string[]) {
    const schemaObject: any = {};

    fields.forEach((item) => {
      schemaObject[item] = Joi.number().required();
    });

    return Joi.object(schemaObject);
  }

  // common forget password input validator
  public commonForgetPassInputValidation = Joi.object({
    token: Joi.string().required().messages({
      'string.base': 'Provide valid token',
      'any.required': 'Token is required',
    }),
    email: Joi.string().email().trim().optional().lowercase().messages({
      'string.base': 'Provide valid email',
      'string.email': 'Provide valid email',
    }),
    password: Joi.string().min(8).required().messages({
      'string.base': 'Provide valid password',
      'string.min': "Please provide valid password that's length must be min 8",
      'any.required': 'Password is required',
    }),
  });

  // common change password input validation
  public changePassInputValidation = Joi.object({
    old_password: Joi.string().min(8).required().messages({
      'string.base': 'Provide a valid old password',
      'string.min': 'Provide a valid old password minimum length is 8',
      'any.required': 'Old password is required',
    }),
    new_password: Joi.string().min(8).required().messages({
      'string.base': 'Provide a valid new password',
      'string.min': 'Provide a valid new password minimum length is 8',
      'any.required': 'New password is required',
    }),
  });

  //airline get filter
  public getAirlinesSchema = Joi.object({
    code: Joi.string().optional().uppercase(),
    name: Joi.string().optional(),
    limit: Joi.number(),
    skip: Joi.number(),
  });

  //airport get filter
  public getAirportSchema = Joi.object({
    country_id: Joi.number().optional(),
    name: Joi.string().optional(),
    limit: Joi.number(),
    skip: Joi.number(),
  });

  //location Hotel get filter
  public getLocationHotelSchema = Joi.object({
    filter: Joi.string().optional(),
  });

  // get country
  public getCountry = Joi.object({
    name: Joi.string().optional(),
  });
  // get city
  public getCity = Joi.object({
    name: Joi.string().optional(),
    country_id: Joi.number().optional(),
    city_id: Joi.number().optional(),
    limit: Joi.number(),
    skip: Joi.number(),
  });
}
