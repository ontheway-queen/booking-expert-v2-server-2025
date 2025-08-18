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
  });
}
