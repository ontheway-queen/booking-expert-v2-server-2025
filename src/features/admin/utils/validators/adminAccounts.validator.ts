import Joi from 'joi';

export class AdminAccountsValidator {
  public updateAccounts = Joi.object({
    account_name: Joi.string().optional().trim(),
    account_number: Joi.string().optional().trim(),
    branch: Joi.string().optional().trim(),
    routing_no: Joi.string().optional().trim(),
    swift_code: Joi.string().optional().trim(),
    status: Joi.boolean().optional(),
  });

  public createAccounts = Joi.object({
    bank_id: Joi.number().required(),
    account_name: Joi.string().required().trim(),
    account_number: Joi.string().required().trim(),
    branch: Joi.string().optional().trim(),
    routing_no: Joi.string().optional().trim(),
    swift_code: Joi.string().optional().trim(),
  });

  public getAccounts = Joi.object({
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    status: Joi.boolean().optional(),
    filter: Joi.string().optional().trim(),
  });
}
