"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const flightConstant_1 = require("../../../../../utils/miscellaneous/flightConstant");
class AgentB2CSubFlightValidator {
    constructor() {
        //GET FLIGHT LIST SCHEMA
        this.getFlightListSchema = joi_1.default.object({
            status: joi_1.default.string().valid(flightConstant_1.FLIGHT_BOOKING_PENDING, flightConstant_1.FLIGHT_BOOKING_CONFIRMED, flightConstant_1.FLIGHT_BOOKING_VOID, flightConstant_1.FLIGHT_BOOKING_IN_PROCESS, flightConstant_1.FLIGHT_TICKET_IN_PROCESS, flightConstant_1.FLIGHT_BOOKING_ON_HOLD, flightConstant_1.FLIGHT_TICKET_ISSUE, flightConstant_1.FLIGHT_BOOKING_EXPIRED, flightConstant_1.FLIGHT_BOOKING_CANCELLED, flightConstant_1.FLIGHT_BOOKING_REFUNDED, flightConstant_1.FLIGHT_BOOKING_REISSUED),
            from_date: joi_1.default.date(),
            to_date: joi_1.default.date(),
            filter: joi_1.default.string(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
        });
    }
}
exports.default = AgentB2CSubFlightValidator;
