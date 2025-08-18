"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CSubPaymentValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../../utils/miscellaneous/constants");
class AgentB2CSubPaymentValidator {
    constructor() {
        this.getDepositRequest = joi_1.default.object({
            from_date: joi_1.default.string().optional(),
            user_id: joi_1.default.number().optional(),
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
        });
    }
}
exports.AgentB2CSubPaymentValidator = AgentB2CSubPaymentValidator;
