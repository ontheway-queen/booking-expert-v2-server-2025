import Joi from 'joi';

export class AgentB2CVisaValidator {
  public getAllVisaListQuerySchema = Joi.object({
    country_id: Joi.number().required(),
    visa_type_id: Joi.number().required(),
  });

  private traveler_types = [
    'ADT',
    'INF',
    'C02',
    'C03',
    'C04',
    'C05',
    'C06',
    'C07',
    'C08',
    'C09',
    'C10',
    'C11',
  ];

  private traveler_titles = ['MISS', 'MASTER', 'MS', 'MR', 'MRS'];

  private passengerSchema = Joi.array().items(
    Joi.object({
      key: Joi.number().required(),
      title: Joi.string()
        .trim()
        .valid(...this.traveler_titles)
        .required(),
      type: Joi.string()
        .trim()
        .valid(...this.traveler_types)
        .required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      date_of_birth: Joi.date().raw().required(),
      passport_number: Joi.string().required(),
      passport_expiry_date: Joi.date().raw().required(),
      passport_type: Joi.string().required(),
      city: Joi.string().optional(),
      country_id: Joi.number().optional(),
      address: Joi.string().optional(),
    })
  );

  public createVisaValidatorSchema = Joi.object({
    application_ref: Joi.string().required(),
    source_type: Joi.string().required(),
    source_id: Joi.number().required(),
    user_id: Joi.number().required(),
    visa_is: Joi.number().required(),
    from_date: Joi.date().raw().required(),
    to_date: Joi.date().raw().required(),
    traveler: Joi.number().required(),
    visa_fee: Joi.number().required(),
    processing_fee: Joi.number().required(),
    contact_email: Joi.string().email().trim().required(),
    contact_number: Joi.string().trim().required(),
    whatsapp_number: Joi.string().trim().optional(),
    nationality: Joi.string().trim().optional(),
    residence: Joi.string().trim().optional(),
    passengers: Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error } = this.passengerSchema.validate(parsed);
        if (error) throw new Error(error.details[0].message);
        return parsed;
      } catch (err: any) {
        return helpers.error('any.invalid', { message: err.message });
      }
    }),
  });
}
