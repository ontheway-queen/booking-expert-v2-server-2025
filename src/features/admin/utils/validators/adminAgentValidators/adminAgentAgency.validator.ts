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
    email: Joi.string().lowercase().trim().optional(),
    phone: Joi.string().trim().optional(),
    address: Joi.string().trim().optional(),
    flight_markup_set: Joi.number().optional(),
    hotel_markup_set: Joi.number().optional(),
    kam_id: Joi.number().optional(),
    ref_id: Joi.number().optional(),
    white_label: Joi.boolean().optional(),
    allow_api: Joi.boolean().optional(),
    status: Joi.string().valid('Active', 'Inactive').optional(),
    book_permission: Joi.boolean().optional(),
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
            b2c_link: Joi.string().optional(),
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
    book_permission: Joi.boolean().required(),
    flight_markup_set: Joi.alternatives().conditional('status', {
      is: 'Active',
      then: Joi.number().required(),
    }),
    hotel_markup_set: Joi.alternatives().conditional('status', {
      is: 'Active',
      then: Joi.number().required(),
    }),
    kam_id: Joi.alternatives().conditional('status', {
      is: 'Active',
      then: Joi.number().required(),
    }),
  });

  public updateAgencyUser = Joi.object({
    name: Joi.string().trim().optional(),
    email: Joi.string().lowercase().trim().optional(),
    phone_number: Joi.string().optional().trim(),
    status: Joi.boolean().optional(),
    is_main_user: Joi.boolean().optional(),
  });

  public createAgency = Joi.object({
    agency_name: Joi.string().trim().required(),
    email: Joi.string().lowercase().trim().required(),
    phone: Joi.string().trim().required(),
    address: Joi.string().trim().required(),
    user_name: Joi.string().trim().required(),
    flight_markup_set: Joi.number().required(),
    hotel_markup_set: Joi.number().required(),
    kam_id: Joi.number().required(),
    ref_id: Joi.number().optional(),
    white_label: Joi.boolean().required(),
    book_permission: Joi.boolean().required(),
    allow_api: Joi.boolean().required(),
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
            b2c_link: Joi.string().optional(),
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

  public upsertAgencyEmailCredential = Joi.object({
    type: Joi.string()
      .valid('GMAIL', 'HOSTINGER', 'NAMECHEAP', 'ZOHO', 'CPANEL', 'OTHER')
      .required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    host: Joi.string().optional(),
    port: Joi.number().optional(),
    status: Joi.boolean().optional(),
  });

  public upsertAgencyPaymentGatewayCredential = Joi.object({
    gateway_name: Joi.string().valid('SSL', 'BKASH').required(),

    cred: Joi.array()
      .items(
        Joi.object({
          key: Joi.when(Joi.ref('...gateway_name'), {
            switch: [
              {
                is: 'SSL',
                then: Joi.string()
                  .valid('SSL_STORE_ID', 'SSL_STORE_PASSWORD')
                  .required(),
              },
              {
                is: 'BKASH',
                then: Joi.string()
                  .valid(
                    'BKASH_APP_KEY',
                    'BKASH_APP_SECRET',
                    'BKASH_USERNAME',
                    'BKASH_PASSWORD'
                  )
                  .required(),
              },
            ],
            // otherwise: Joi.forbidden(),
          }),

          value: Joi.string().required(),
        })
      )
      .min(1)
      .required(),
  });
}
