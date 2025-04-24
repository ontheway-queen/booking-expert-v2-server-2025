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
    agency_name: Joi.string().trim().optional(),
    email: Joi.string().trim().optional(),
    phone: Joi.string().trim().optional(),
    address: Joi.string().trim().optional(),
    flight_markup_set: Joi.number().optional(),
    hotel_markup_set: Joi.number().optional(),
    white_label: Joi.boolean().optional(),
    allow_api: Joi.boolean().optional(),
    status: Joi.string().valid('Active', 'Inactive').optional(),
    white_label_permissions: Joi.string()
      .optional()
      .custom((value, helpers) => {
        try {
          const innerSchema = Joi.object({
            flight: Joi.boolean().required(),
            hotel: Joi.boolean().required(),
            visa: Joi.boolean().required(),
            holiday: Joi.boolean().required(),
            umrah: Joi.boolean().required(),
            group_fare: Joi.boolean().required(),
            blog: Joi.boolean().required(),
          });
          const parsedValue = JSON.parse(value);

          const { error } = innerSchema.validate(parsedValue);

          if (error) {
            return helpers.error('any.invalid');
          } else {
            return parsedValue;
          }
        } catch (err) {
          return helpers.error('any.invalid');
        }
      }),
  });

  public updateAgencyApplication = Joi.object({
    status: Joi.string().valid('Active', 'Rejected').required(),
    flight_markup_set: Joi.alternatives().conditional('status', {
      is: 'Active',
      then: Joi.number().required(),
    }),
    hotel_markup_set: Joi.alternatives().conditional('status', {
      is: 'Active',
      then: Joi.number().required(),
    }),
  });
}
