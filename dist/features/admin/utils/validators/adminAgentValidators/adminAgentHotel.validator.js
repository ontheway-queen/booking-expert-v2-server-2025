"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminAgentHotelValidator {
    constructor() {
        this.getBooking = joi_1.default.object({
            agency_id: joi_1.default.number().optional(),
            filter: joi_1.default.string().optional(),
            from_date: joi_1.default.date().optional(),
            to_date: joi_1.default.date().optional(),
            limit: joi_1.default.string().optional(),
            skip: joi_1.default.string().optional(),
        });
    }
}
exports.default = AdminAgentHotelValidator;
