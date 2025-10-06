"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSubAgentPaymentValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../../utils/miscellaneous/constants");
class AgentSubAgentPaymentValidator {
    constructor() {
        this.getDepositRequest = joi_1.default.object({
            from_date: joi_1.default.string().optional(),
            agency_id: joi_1.default.number().optional(),
            to_date: joi_1.default.string().optional(),
            status: joi_1.default.string().valid(constants_1.DEPOSIT_STATUS_PENDING, constants_1.DEPOSIT_STATUS_APPROVED, constants_1.DEPOSIT_STATUS_CANCELLED, constants_1.DEPOSIT_STATUS_REJECTED),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            filter: joi_1.default.string(),
        });
        this.updateDepositRequest = joi_1.default.object({
            status: joi_1.default.string()
                .valid(constants_1.DEPOSIT_STATUS_APPROVED, constants_1.DEPOSIT_STATUS_REJECTED)
                .required(),
            note: joi_1.default.string().optional(),
        });
        this.getLedger = joi_1.default.object({
            agency_id: joi_1.default.number().required(),
            from_date: joi_1.default.string().optional(),
            to_date: joi_1.default.string().optional(),
            voucher_no: joi_1.default.string().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
        });
        this.balanceAdjust = joi_1.default.object({
            agency_id: joi_1.default.number().required(),
            amount: joi_1.default.number().required(),
            type: joi_1.default.string().valid('Debit', 'Credit').required(),
            details: joi_1.default.string().required(),
            voucher_no: joi_1.default.string().required(),
            payment_date: joi_1.default.string().required(),
        });
    }
}
exports.AgentSubAgentPaymentValidator = AgentSubAgentPaymentValidator;
