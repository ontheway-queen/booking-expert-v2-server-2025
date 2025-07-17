"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAgentFlightValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const flightConstant_1 = require("../../../../../utils/miscellaneous/flightConstant");
class AdminAgentFlightValidator {
    constructor() {
        this.getFlightListSchema = joi_1.default.object({
            status: joi_1.default.string().valid(flightConstant_1.FLIGHT_BOOKING_PENDING, flightConstant_1.FLIGHT_BOOKING_CONFIRMED, flightConstant_1.FLIGHT_BOOKING_VOID, flightConstant_1.FLIGHT_BOOKING_IN_PROCESS, flightConstant_1.FLIGHT_TICKET_IN_PROCESS, flightConstant_1.FLIGHT_BOOKING_ON_HOLD, flightConstant_1.FLIGHT_TICKET_ISSUE, flightConstant_1.FLIGHT_BOOKING_EXPIRED, flightConstant_1.FLIGHT_BOOKING_CANCELLED, flightConstant_1.FLIGHT_BOOKING_REFUNDED, flightConstant_1.FLIGHT_BOOKING_REISSUED),
            from_date: joi_1.default.date(),
            to_date: joi_1.default.date(),
            filter: joi_1.default.string(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
        });
        this.getBookingTrackingDataSchema = joi_1.default.object({
            limit: joi_1.default.number().allow(''),
            skip: joi_1.default.number().allow(''),
        });
        this.updateFlightBookingSchema = joi_1.default.object({
            status: joi_1.default.string().valid(flightConstant_1.FLIGHT_BOOKING_EXPIRED).required(),
        });
        this.updatePendingBookingManuallySchema = joi_1.default.object({
            status: joi_1.default.string()
                .valid(flightConstant_1.FLIGHT_BOOKING_CONFIRMED, flightConstant_1.FLIGHT_TICKET_ISSUE)
                .required(),
            gds_pnr: joi_1.default.string().trim(),
            ticket_issue_last_time: joi_1.default.date(),
            airline_pnr: joi_1.default.string().trim(),
            ticket_numbers: joi_1.default.when('status', {
                is: flightConstant_1.FLIGHT_TICKET_ISSUE,
                then: joi_1.default.array()
                    .items(joi_1.default.object({
                    passenger_id: joi_1.default.number().required(),
                    ticket_number: joi_1.default.string().required(),
                }))
                    .required(),
                otherwise: joi_1.default.forbidden(),
            }),
            charge_credit: joi_1.default.when('status', {
                is: flightConstant_1.FLIGHT_TICKET_ISSUE,
                then: joi_1.default.boolean().required(),
                otherwise: joi_1.default.forbidden(),
            }),
        });
        this.updateProcessingTicketSchema = joi_1.default.object({
            ticket_numbers: joi_1.default.array()
                .items(joi_1.default.object({
                passenger_id: joi_1.default.number().required(),
                ticket_number: joi_1.default.string().required(),
            }))
                .required(),
            charge_credit: joi_1.default.boolean().required(),
        });
    }
}
exports.AdminAgentFlightValidator = AdminAgentFlightValidator;
