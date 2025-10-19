"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AgentB2CSubHotelValidator {
    constructor() {
        this.getBooking = joi_1.default.object({
            user_id: joi_1.default.number().optional(),
            filter: joi_1.default.string().optional(),
            from_date: joi_1.default.date().optional(),
            to_date: joi_1.default.date().optional(),
            limit: joi_1.default.string().optional(),
            skip: joi_1.default.string().optional(),
        });
        this.updateBooking = joi_1.default.object({
            status: joi_1.default.string().valid('Booked', 'Cancelled', 'Confirmed').optional(),
            confirmation_no: joi_1.default.string().optional(),
            supplier_ref: joi_1.default.string().optional(),
        });
    }
}
exports.default = AgentB2CSubHotelValidator;
