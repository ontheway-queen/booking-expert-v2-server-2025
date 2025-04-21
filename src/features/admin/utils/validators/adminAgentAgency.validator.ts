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
}
