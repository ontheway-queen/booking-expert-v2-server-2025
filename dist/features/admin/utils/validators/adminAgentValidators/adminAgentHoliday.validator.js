"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAgentHolidayValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const holidayConstants_1 = require("../../../../../utils/miscellaneous/holidayConstants");
class AdminAgentHolidayValidator {
    constructor() {
        this.holidayPackageBookingListFilterQuery = joi_1.default.object({
            status: joi_1.default.string().optional().valid(holidayConstants_1.HOLIDAY_BOOKING_STATUS),
            from_date: joi_1.default.date().optional(),
            to_date: joi_1.default.date().optional(),
            filter: joi_1.default.string().trim().optional(),
            limit: joi_1.default.number().optional().allow(""),
            skip: joi_1.default.number().optional().allow("")
        });
        this.holidayPackageUpdateSchema = joi_1.default.object({
            status: joi_1.default.string().required().valid(holidayConstants_1.HOLIDAY_BOOKING_STATUS.CONFIRMED, holidayConstants_1.HOLIDAY_BOOKING_STATUS.COMPLETED, holidayConstants_1.HOLIDAY_BOOKING_STATUS.IN_PROGRESS, holidayConstants_1.HOLIDAY_BOOKING_STATUS.REFUNDED, holidayConstants_1.HOLIDAY_BOOKING_STATUS.REJECTED)
        });
    }
}
exports.AdminAgentHolidayValidator = AdminAgentHolidayValidator;
