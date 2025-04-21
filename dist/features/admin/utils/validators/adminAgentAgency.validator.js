"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminAgentAgencyValidator {
    constructor() {
        this.getAgencySchema = joi_1.default.object({
            filter: joi_1.default.string().max(100).optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            status: joi_1.default.string()
                .valid('Pending', 'Active', 'Inactive', 'Rejected', 'Incomplete')
                .required(),
        });
    }
}
exports.default = AdminAgentAgencyValidator;
