"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAccountsValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AdminAccountsValidator {
    constructor() {
        this.updateAccounts = joi_1.default.object({
            account_name: joi_1.default.string().optional().trim(),
            account_number: joi_1.default.string().optional().trim(),
            branch: joi_1.default.string().optional().trim(),
            routing_no: joi_1.default.string().optional().trim(),
            swift_code: joi_1.default.string().optional().trim(),
            status: joi_1.default.boolean().optional(),
        });
        this.createAccounts = joi_1.default.object({
            bank_id: joi_1.default.number().required(),
            account_name: joi_1.default.string().required().trim(),
            account_number: joi_1.default.string().required().trim(),
            branch: joi_1.default.string().optional().trim(),
            routing_no: joi_1.default.string().optional().trim(),
            swift_code: joi_1.default.string().optional().trim(),
        });
        this.getAccounts = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            status: joi_1.default.boolean().optional(),
            filter: joi_1.default.string().optional().trim(),
        });
    }
}
exports.AdminAccountsValidator = AdminAccountsValidator;
