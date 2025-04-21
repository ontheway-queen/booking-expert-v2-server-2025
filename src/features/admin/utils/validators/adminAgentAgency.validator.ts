import Joi from 'joi';

export default class AdminAgentAgencyValidator {
  public getAgencySchema = Joi.object({
    filter: Joi.string().max(100).optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    status: Joi.string()
      .valid('Pending', 'Active', 'Inactive', 'Rejected', 'Incomplete')
      .required(),
  });

  public updateAgency = Joi.object({
    agency_name: Joi.string().optional(),
    email: Joi.string().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    flight_markup_set: Joi.number().optional(),
    hotel_markup_set: Joi.number().optional(),
    white_label: Joi.boolean().optional(),
    allow_api: Joi.boolean().optional(),
    status: Joi.string()
      .valid('Pending', 'Active', 'Inactive', 'Rejected', 'Incomplete')
      .optional(),
    white_label_permissions: Joi.object({
      flight: Joi.boolean().required(),
      hotel: Joi.boolean().required(),
      visa: Joi.boolean().required(),
      holiday: Joi.boolean().required(),
      umrah: Joi.boolean().required(),
      group_fare: Joi.boolean().required(),
      blog: Joi.boolean().required(),
    }).optional(),
  });
}
