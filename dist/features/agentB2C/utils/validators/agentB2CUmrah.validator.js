"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CUmrahValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AgentB2CUmrahValidator {
    constructor() {
        this.umrahBooking = joi_1.default.object({
            traveler_adult: joi_1.default.number().required(),
            traveler_child: joi_1.default.number().optional(),
            note: joi_1.default.string().max(1000).trim().optional(),
            name: joi_1.default.string().trim().max(500).required(),
            email: joi_1.default.string().email().trim().required(),
            phone: joi_1.default.string().trim().required(),
            address: joi_1.default.string().trim().required(),
        });
        this.getUmrahBooking = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            status: joi_1.default.string()
                .valid('PENDING', 'PROCESSING', 'PROCESSED', 'CONFIRMED', 'CANCELLED')
                .trim()
                .max(50)
                .optional(),
            from_date: joi_1.default.date().raw().optional(),
            to_date: joi_1.default.date().raw().optional(),
        });
    }
}
exports.AgentB2CUmrahValidator = AgentB2CUmrahValidator;
