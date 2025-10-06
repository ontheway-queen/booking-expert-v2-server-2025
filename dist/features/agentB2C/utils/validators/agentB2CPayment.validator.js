"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AgentB2CPaymentValidator {
    constructor() {
        this.createDeposit = joi_1.default.object({
            account_id: joi_1.default.number().required(),
            amount: joi_1.default.number().required().min(10),
            payment_date: joi_1.default.date().raw().required(),
            remarks: joi_1.default.string().optional(),
        });
        this.getDeposit = joi_1.default.object({
            status: joi_1.default.string().valid(constants_1.DEPOSIT_STATUS_PENDING, constants_1.DEPOSIT_STATUS_APPROVED, constants_1.DEPOSIT_STATUS_CANCELLED, constants_1.DEPOSIT_STATUS_REJECTED),
            from_date: joi_1.default.date(),
            to_date: joi_1.default.date(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
            filter: joi_1.default.string(),
        });
        this.getInvoicesFilterQuery = joi_1.default.object({
            from_date: joi_1.default.date(),
            to_date: joi_1.default.date(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
        });
        this.getLedger = joi_1.default.object({
            type: joi_1.default.string().valid('Debit', 'Credit'),
            from_date: joi_1.default.date(),
            to_date: joi_1.default.date(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
        });
        this.topUpUsingPaymentGateway = joi_1.default.object({
            amount: joi_1.default.number().min(10).required(),
            payment_gateway: joi_1.default.string().valid('SSL', 'BKASH').required(),
            success_page: joi_1.default.string().required(),
            failed_page: joi_1.default.string().required(),
            cancelled_page: joi_1.default.string().required(),
            is_app: joi_1.default.boolean().optional(),
        });
    }
}
exports.default = AgentB2CPaymentValidator;
