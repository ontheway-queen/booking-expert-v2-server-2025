"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../../utils/miscellaneous/constants");
class AdminAgentPaymentsValidator {
    constructor() {
        this.createLoan = joi_1.default.object({
            agency_id: joi_1.default.number().required(),
            details: joi_1.default.string().trim().required(),
            type: joi_1.default.string().valid('Given', 'Taken').required(),
            amount: joi_1.default.number().required(),
        });
        this.getLoanHistory = joi_1.default.object({
            type: joi_1.default.string().valid('Given', 'Taken').optional(),
            agency_id: joi_1.default.number().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            from_date: joi_1.default.string().optional(),
            to_date: joi_1.default.string().optional(),
        });
        this.getLedger = joi_1.default.object({
            agency_id: joi_1.default.number().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            from_date: joi_1.default.string().optional(),
            to_date: joi_1.default.string().optional(),
            voucher_no: joi_1.default.string().trim().optional(),
        });
        this.getDepositRequest = joi_1.default.object({
            from_date: joi_1.default.string().optional(),
            to_date: joi_1.default.string().optional(),
            status: joi_1.default.string().valid(constants_1.DEPOSIT_STATUS_PENDING, constants_1.DEPOSIT_STATUS_APPROVED, constants_1.DEPOSIT_STATUS_CANCELLED, constants_1.DEPOSIT_STATUS_REJECTED),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            filter: joi_1.default.string()
        });
        this.updateDepositRequest = joi_1.default.object({
            status: joi_1.default.string().valid(constants_1.DEPOSIT_STATUS_APPROVED, constants_1.DEPOSIT_STATUS_REJECTED).required()
        });
        this.adjustBalance = joi_1.default.object({
            agency_id: joi_1.default.number().required(),
            type: joi_1.default.string().valid("Debit", "Credit"),
            amount: joi_1.default.number().required(),
            details: joi_1.default.string().required(),
            ledger_date: joi_1.default.date().required()
        });
        this.createADM = joi_1.default.object({
            booking_id: joi_1.default.number().required(),
            amount: joi_1.default.number().required(),
            note: joi_1.default.string().optional()
        });
        this.getADM = joi_1.default.object({
            filter: joi_1.default.string(),
            from_date: joi_1.default.string().optional(),
            to_date: joi_1.default.string().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
        });
        this.updateADM = joi_1.default.object({
            amount: joi_1.default.number().optional(),
            note: joi_1.default.string().optional()
        });
    }
}
exports.default = AdminAgentPaymentsValidator;
