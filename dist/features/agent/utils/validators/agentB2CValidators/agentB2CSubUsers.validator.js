"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CSubUsersValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AgentB2CSubUsersValidator {
    constructor() {
        this.getB2CUsersFilterQuery = joi_1.default.object({
            filter: joi_1.default.string().trim(),
            status: joi_1.default.boolean(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
        });
        this.updateB2CUser = joi_1.default.object({
            name: joi_1.default.string().trim(),
            phone_number: joi_1.default.string().min(11),
            gender: joi_1.default.string().valid('Male', 'Female', 'Other'),
            status: joi_1.default.boolean().optional(),
        });
    }
}
exports.AgentB2CSubUsersValidator = AgentB2CSubUsersValidator;
