import Joi from 'joi';
import {
  DEPOSIT_STATUS_APPROVED,
  DEPOSIT_STATUS_CANCELLED,
  DEPOSIT_STATUS_PENDING,
  DEPOSIT_STATUS_REJECTED,
} from '../../../../../utils/miscellaneous/constants';

export class AgentB2CSubPaymentValidator {
  public getDepositRequest = Joi.object({
    from_date: Joi.string().optional(),
    user_id: Joi.number().optional(),
    to_date: Joi.string().optional(),
    status: Joi.string().valid(
      DEPOSIT_STATUS_PENDING,
      DEPOSIT_STATUS_APPROVED,
      DEPOSIT_STATUS_CANCELLED,
      DEPOSIT_STATUS_REJECTED
    ),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    filter: Joi.string(),
  });

  public updateDepositRequest = Joi.object({
    status: Joi.string()
      .valid(DEPOSIT_STATUS_APPROVED, DEPOSIT_STATUS_REJECTED)
      .required(),
    note: Joi.string().optional(),
  });

  public getLedger = Joi.object({
    user_id: Joi.number().required(),
    from_date: Joi.string().optional(),
    to_date: Joi.string().optional(),
    voucher_no: Joi.string().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
  });

  public balanceAdjust = Joi.object({
    user_id: Joi.number().required(),
    amount: Joi.number().required(),
    type: Joi.string().valid('Debit', 'Credit').required(),
    details: Joi.string().required(),
    voucher_no: Joi.string().required(),
    payment_date: Joi.string().required(),
  });
}
