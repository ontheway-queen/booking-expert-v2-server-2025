import Joi from "joi";
import { DEPOSIT_STATUS_APPROVED, DEPOSIT_STATUS_CANCELLED, DEPOSIT_STATUS_PENDING, DEPOSIT_STATUS_REJECTED } from "../../../../utils/miscellaneous/constants";

export class AgentPaymentsValidator {

    public createDeposit = Joi.object({
        bank_name: Joi.string().required().trim(),
        amount: Joi.number().required().min(10),
        remarks: Joi.string().optional(),
        payment_date: Joi.date().required()
    });

    public getDeposit = Joi.object({
        status: Joi.string().valid(DEPOSIT_STATUS_PENDING, DEPOSIT_STATUS_APPROVED, DEPOSIT_STATUS_CANCELLED, DEPOSIT_STATUS_REJECTED),
        from_date: Joi.date(),
        to_date: Joi.date(),
        limit: Joi.number(),
        skip: Joi.number(),
        filter: Joi.string()
    });

    public getADM = Joi.object({
        from_date: Joi.date(),
        to_date: Joi.date(),
        limit: Joi.number(),
        skip: Joi.number(),
        filter: Joi.string()
    });

    public getLoanHistory = Joi.object({
        type: Joi.string().valid('Given', 'Taken'),
        from_date: Joi.date(),
        to_date: Joi.date(),
        limit: Joi.number(),
        skip: Joi.number()
    });

    public getLedger= Joi.object({
        type: Joi.string().valid('Debit', 'Credit'),
        from_date: Joi.date(),
        to_date: Joi.date(),
        limit: Joi.number(),
        skip: Joi.number()
    });

    public topUpUsingPaymentGateway = Joi.object({
        amount: Joi.number().min(10).required(),
        currency: Joi.string().valid("BDT").required(),
        payment_gateway: Joi.string().valid("SSL").required(),
        success_page: Joi.string().required(),
        failed_page: Joi.string().required(),
        cancelled_page: Joi.string().required(),
        is_app: Joi.boolean().optional()
    });
}