import Joi from 'joi';

export class AgentB2CSubVisaValidator {
  public createVisaValidatorSchema = Joi.object({
    country_id: Joi.number().required(),
    visa_fee: Joi.number().required().max(9999999999999999.99),
    processing_fee: Joi.number().required().max(9999999999999999.99),
    max_validity: Joi.number().required(),
    stay_validity: Joi.number().required(),
    visa_type_id: Joi.number().required(),
    visa_mode_id: Joi.number().required(),
    title: Joi.string().required(),
    description: Joi.string().optional(),
    documents_details: Joi.string().optional(),
    slug: Joi.string().required(),
    meta_title: Joi.string().required(),
    meta_description: Joi.string().required(),
    visa_for: Joi.string().valid('AGENT', 'B2C', 'BOTH').required(),
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
  });

  public getVisaListValidatorSchema = Joi.object({
    filter: Joi.string().max(100).optional(),
    country_id: Joi.number().optional(),
    status: Joi.boolean().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
  });

  public updateVisaValidatorSchema = Joi.object({
    country_id: Joi.number().optional(),
    visa_fee: Joi.number().optional().max(9999999999999999.99),
    processing_fee: Joi.number().optional().max(9999999999999999.99),
    max_validity: Joi.number().optional(),
    stay_validity: Joi.number().optional(),
    visa_type_id: Joi.number().optional(),
    visa_mode_id: Joi.number().optional(),
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    documents_details: Joi.string().optional(),
    slug: Joi.string().optional(),
    meta_title: Joi.string().optional(),
    meta_description: Joi.string().optional(),
    visa_for: Joi.string().valid('AGENT', 'B2C', 'BOTH').optional(),
    status: Joi.boolean().optional(),
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
  });

  public getAgentB2CApplicationListValidatorSchema = Joi.object({
    from_date: Joi.date().optional(),
    to_date: Joi.date().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    status: Joi.string().optional(),
    filter: Joi.string().max(100).optional(),
  });

  public updateVisaApplicationValidatorSchema = Joi.object({
    status: Joi.string()
      .valid(
        'Pending',
        'Papers Submitted',
        'Application Received',
        'In Process',
        'Document Verification',
        'Approved',
        'Rejected',
        'Collected'
      )
      .required(),
    details: Joi.string().required(),
  });
}
