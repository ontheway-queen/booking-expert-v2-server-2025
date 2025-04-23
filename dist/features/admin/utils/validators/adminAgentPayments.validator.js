"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminAgentPaymentsValidator {
    constructor() {
        this.createLoan = joi_1.default.object({
            agency_id: joi_1.default.number().required(),
            details: joi_1.default.string().required(),
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
            voucher_no: joi_1.default.string().optional(),
        });
    }
}
exports.default = AdminAgentPaymentsValidator;
