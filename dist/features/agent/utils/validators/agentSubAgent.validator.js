"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSubAgentValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AgentSubAgentValidator {
    constructor() {
        this.createSubAgencySchema = joi_1.default.object({
            email: joi_1.default.string().email().trim().lowercase().required(),
            agency_name: joi_1.default.string().required(),
            user_name: joi_1.default.string().required(),
            address: joi_1.default.string().required(),
            phone: joi_1.default.string().min(11).max(14).required(),
            flight_markup_type: joi_1.default.string().valid("PER", "FLAT").required(),
            hotel_markup_type: joi_1.default.string().valid("PER", "FLAT").required(),
            flight_markup_mode: joi_1.default.string().valid("INCREASE", "DECREASE").required(),
            hotel_markup_mode: joi_1.default.string().valid("INCREASE", "DECREASE").required(),
            flight_markup: joi_1.default.number().min(0).required(),
            hotel_markup: joi_1.default.number().min(0).required(),
        });
        this.getSubAgencyQuerySchema = joi_1.default.object({
            filter: joi_1.default.string(),
            status: joi_1.default.string().valid('Pending', 'Active', 'Inactive', 'Rejected', 'Incomplete'),
            limit: joi_1.default.number().allow(""),
            skip: joi_1.default.number().allow("")
        });
        this.updateSubAgencySchema = joi_1.default.object({
            email: joi_1.default.string().email().trim().lowercase(),
            agency_name: joi_1.default.string(),
            phone: joi_1.default.string().min(11).max(14),
            address: joi_1.default.string(),
            status: joi_1.default.string().valid("Active", "Inactive"),
            flight_markup_type: joi_1.default.string().valid("PER", "FLAT"),
            hotel_markup_type: joi_1.default.string().valid("PER", "FLAT"),
            flight_markup_mode: joi_1.default.string().valid("INCREASE", "DECREASE"),
            hotel_markup_mode: joi_1.default.string().valid("INCREASE", "DECREASE"),
            flight_markup: joi_1.default.number().min(0),
            hotel_markup: joi_1.default.number().min(0),
        });
    }
}
exports.AgentSubAgentValidator = AgentSubAgentValidator;
