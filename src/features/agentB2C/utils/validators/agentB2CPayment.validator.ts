import Joi from 'joi';
import {
  DEPOSIT_STATUS_APPROVED,
  DEPOSIT_STATUS_CANCELLED,
  DEPOSIT_STATUS_PENDING,
  DEPOSIT_STATUS_REJECTED,
} from '../../../../utils/miscellaneous/constants';

export default class AgentB2CPaymentValidator {
  public createDeposit = Joi.object({
    account_id: Joi.number().required(),
    amount: Joi.number().required().min(10),
    payment_date: Joi.date().raw().required(),
    remarks: Joi.string().optional(),
  });

  public getDeposit = Joi.object({
    status: Joi.string().valid(
      DEPOSIT_STATUS_PENDING,
      DEPOSIT_STATUS_APPROVED,
      DEPOSIT_STATUS_CANCELLED,
      DEPOSIT_STATUS_REJECTED
    ),
    from_date: Joi.date(),
    to_date: Joi.date(),
    limit: Joi.number(),
    skip: Joi.number(),
    filter: Joi.string(),
  });

  public getInvoicesFilterQuery = Joi.object({
    from_date: Joi.date(),
    to_date: Joi.date(),
    limit: Joi.number(),
    skip: Joi.number(),
  });

  public getLedger = Joi.object({
    type: Joi.string().valid('Debit', 'Credit'),
    from_date: Joi.date(),
    to_date: Joi.date(),
    limit: Joi.number(),
    skip: Joi.number(),
  });
}
