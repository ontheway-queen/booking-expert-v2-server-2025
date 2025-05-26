"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPaymentsValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AgentPaymentsValidator {
    constructor() {
        this.createDeposit = joi_1.default.object({
            bank_name: joi_1.default.string().required().trim(),
            amount: joi_1.default.number().required().min(10),
            remarks: joi_1.default.string().optional(),
            payment_date: joi_1.default.date().required()
        });
        this.getDeposit = joi_1.default.object({
            status: joi_1.default.string().valid(constants_1.DEPOSIT_STATUS_PENDING, constants_1.DEPOSIT_STATUS_APPROVED, constants_1.DEPOSIT_STATUS_CANCELLED, constants_1.DEPOSIT_STATUS_REJECTED),
            from_date: joi_1.default.date(),
            to_date: joi_1.default.date(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
            filter: joi_1.default.string()
        });
        this.getADM = joi_1.default.object({
            from_date: joi_1.default.date(),
            to_date: joi_1.default.date(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
            filter: joi_1.default.string()
        });
        this.getLoanHistory = joi_1.default.object({
            type: joi_1.default.string().valid('Given', 'Taken'),
            from_date: joi_1.default.date(),
            to_date: joi_1.default.date(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number()
        });
        this.getLedger = joi_1.default.object({
            type: joi_1.default.string().valid('Debit', 'Credit'),
            from_date: joi_1.default.date(),
            to_date: joi_1.default.date(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number()
        });
        this.topUpUsingPaymentGateway = joi_1.default.object({
            amount: joi_1.default.number().min(10).required(),
            currency: joi_1.default.string().valid("BDT").required(),
            payment_gateway: joi_1.default.string().valid("SSL").required(),
            success_page: joi_1.default.string().required(),
            failed_page: joi_1.default.string().required(),
            cancelled_page: joi_1.default.string().required(),
            is_app: joi_1.default.boolean().optional()
        });
        this.getInvoicesFilterQuery = joi_1.default.object({
            from_date: joi_1.default.date(),
            to_date: joi_1.default.date(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number()
        });
        this.getPartialPaymentsFilterQuery = joi_1.default.object({
            from_date: joi_1.default.date(),
            to_date: joi_1.default.date(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number()
        });
    }
}
exports.AgentPaymentsValidator = AgentPaymentsValidator;
