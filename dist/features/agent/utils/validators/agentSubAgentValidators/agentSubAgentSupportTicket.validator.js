"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AgentSubAgentSupportTicketValidator {
    constructor() {
        this.createSupportTicket = joi_1.default.object({
            agency_id: joi_1.default.number().required(),
            subject: joi_1.default.string().trim().required(),
            priority: joi_1.default.string().valid('Low', 'Medium', 'High', 'Urgent').required(),
            ref_type: joi_1.default.string()
                .valid('Flight', 'Visa', 'Hotel', 'Holiday', 'Umrah', 'Others', 'Accounts', 'Payments')
                .required(),
            ref_id: joi_1.default.number().optional(),
            details: joi_1.default.string().required(),
        });
        this.getSupportTicket = joi_1.default.object({
            agency_id: joi_1.default.number().optional(),
            status: joi_1.default.string().valid('Open', 'Closed', 'ReOpen').optional(),
            from_date: joi_1.default.date().strict().optional(),
            to_date: joi_1.default.date().strict().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
        });
        this.sendMsg = joi_1.default.object({
            message: joi_1.default.string().trim().required(),
        });
    }
}
exports.default = AgentSubAgentSupportTicketValidator;
