import Joi from 'joi';
import {
  DEPOSIT_STATUS_APPROVED,
  DEPOSIT_STATUS_CANCELLED,
  DEPOSIT_STATUS_PENDING,
  DEPOSIT_STATUS_REJECTED,
} from '../../../../../utils/miscellaneous/constants';

export default class AdminAgentPaymentsValidator {
  public createLoan = Joi.object({
    agency_id: Joi.number().required(),
    details: Joi.string().trim().required(),
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
    voucher_no: Joi.string().trim().optional(),
  });

  public getDepositRequest = Joi.object({
    from_date: Joi.string().optional(),
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

  public adjustBalance = Joi.object({
    agency_id: Joi.number().required(),
    type: Joi.string().valid('Debit', 'Credit'),
    amount: Joi.number().required(),
    details: Joi.string().required(),
    ledger_date: Joi.date().required(),
  });

  public createADM = Joi.object({
    booking_id: Joi.number().required(),
    amount: Joi.number().required(),
    note: Joi.string().optional(),
  });

  public getADM = Joi.object({
    filter: Joi.string(),
    from_date: Joi.string().optional(),
    to_date: Joi.string().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
  });

  public updateADM = Joi.object({
    amount: Joi.number().optional(),
    note: Joi.string().optional(),
  });
}
