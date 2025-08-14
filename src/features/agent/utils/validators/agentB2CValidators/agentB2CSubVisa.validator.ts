import Joi, { LanguageMessages } from 'joi';

export class AgentB2CSubVisaValidator {
  public createVisaValidator = Joi.object({
    country_id: Joi.number().required(),
    visa_fee: Joi.number().required().max(9999999999999999.99),
    processing_fee: Joi.number().required().max(9999999999999999.99),
    max_validity: Joi.number().required(),
    stay_validity: Joi.number().required(),
    visa_type: Joi.string().required(),
    visa_mode: Joi.string().optional(),
    title: Joi.string().required(),
    description: Joi.string().optional(),
    documents_details: Joi.string().optional(),
    slug: Joi.string().required(),
    meta_title: Joi.string().required(),
    meta_description: Joi.string().required(),
    required_fields: Joi.alternatives()
      .try(
        Joi.object().optional(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedRequiredFields = JSON.parse(value);

            const parsedRequiredFieldsSchema = Joi.object({
              passport: Joi.boolean().optional(),
              nid: Joi.boolean().optional(),
              birth_certificate: Joi.boolean().optional(),
              marriage_certificate: Joi.boolean().optional(),
              bank_statement: Joi.boolean().optional(),
            });

            const { error } = parsedRequiredFieldsSchema.validate(parsedRequiredFields);
            if (error) {
              return helpers.message(`Invalid required_fields: ${error.message}` as any);
            }

            return parsedRequiredFields;
          } catch (error) {
            console.error('Error parsing passengers field:', error);
            return helpers.error('any.invalid');
          }
        })
      )
      .optional(),
    visa_for: Joi.string().valid('AGENT', 'B2C', 'BOTH').required(),
  });
}
