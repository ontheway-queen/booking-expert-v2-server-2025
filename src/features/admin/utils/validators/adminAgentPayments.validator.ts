import Joi from 'joi';

export default class AdminAgentPaymentsValidator {
  public createLoan = Joi.object({
    agency_id: Joi.number().required(),
    details: Joi.string().required(),
    type: Joi.string().valid('Given', 'Taken').required(),
    amount: Joi.number().required(),
  });

  public getLoanHistory = Joi.object({
    type: Joi.string().valid('Given', 'Taken').optional(),
    agency_id: Joi.number().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    from_date: Joi.string().optional(),
    to_date: Joi.string().optional(),
  });

  public getLedger = Joi.object({
    agency_id: Joi.number().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    from_date: Joi.string().optional(),
    to_date: Joi.string().optional(),
    voucher_no: Joi.string().optional(),
  });
}
