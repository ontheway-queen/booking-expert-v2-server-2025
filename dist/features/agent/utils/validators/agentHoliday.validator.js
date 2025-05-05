"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentHolidayValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const holidayConstants_1 = require("../../../../utils/miscellaneous/holidayConstants");
class AgentHolidayValidator {
    constructor() {
        this.holidayPackageSearchFilterQuerySchema = joi_1.default.object({
            city_id: joi_1.default.number().optional(),
            date: joi_1.default.date().optional(),
            limit: joi_1.default.number().optional().allow(""),
            skip: joi_1.default.number().optional().allow("")
        });
        this.holidayPackageCreateBookingSchema = joi_1.default.object({
            holiday_package_id: joi_1.default.number().required(),
            total_adult: joi_1.default.number().required(),
            total_child: joi_1.default.number().required(),
            travel_date: joi_1.default.date().required(),
            contact_email: joi_1.default.string().email().lowercase().trim().required(),
            contact_number: joi_1.default.string().trim().required(),
            note_from_customer: joi_1.default.string().optional()
        });
        this.holidayPackageBookingListFilterQuery = joi_1.default.object({
            status: joi_1.default.string().optional().valid(...Object.values(holidayConstants_1.HOLIDAY_BOOKING_STATUS)),
            from_date: joi_1.default.date().optional(),
            to_date: joi_1.default.date().optional(),
            filter: joi_1.default.string().trim().optional(),
            limit: joi_1.default.number().optional().allow(""),
            skip: joi_1.default.number().optional().allow("")
        });
    }
}
exports.AgentHolidayValidator = AgentHolidayValidator;
