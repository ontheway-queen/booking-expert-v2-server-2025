"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CSubFlightService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
const flightConstant_1 = require("../../../../utils/miscellaneous/flightConstant");
const agentFlightBookingSupport_service_1 = require("../../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/agentFlightBookingSupport.service");
class AgentB2CSubFlightService extends abstract_service_1.default {
    getAllBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const flightBookingModel = this.Model.FlightBookingModel();
            const query = req.query;
            const data = yield flightBookingModel.getFlightBookingList(Object.assign(Object.assign({}, query), { source_id: agency_id, booked_by: constants_1.SOURCE_AGENT_B2C }), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    getSingleBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const { id } = req.params;
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const flightSegmentModel = this.Model.FlightBookingSegmentModel(trx);
                const flightTravelerModel = this.Model.FlightBookingTravelerModel(trx);
                const flightPriceBreakdownModel = this.Model.FlightBookingPriceBreakdownModel(trx);
                const booking_data = yield flightBookingModel.getSingleFlightBooking({
                    id: Number(id),
                    booked_by: constants_1.SOURCE_AGENT_B2C,
                    agency_id,
                });
                if (!booking_data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const price_breakdown_data = yield flightPriceBreakdownModel.getFlightBookingPriceBreakdown(Number(id));
                const segment_data = yield flightSegmentModel.getFlightBookingSegment(Number(id));
                const traveler_data = yield flightTravelerModel.getFlightBookingTraveler(Number(id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: Object.assign(Object.assign({}, booking_data), { price_breakdown_data,
                        segment_data,
                        traveler_data }),
                };
            }));
        });
    }
    updateBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { name, user_email, user_id } = req.agencyUser;
                const { status, airline_pnr, charge_credit, gds_pnr, ticket_issue_last_time, ticket_numbers, } = req.body;
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const flightBookingTrackingModel = this.Model.FlightBookingTrackingModel(trx);
                const booking_data = yield flightBookingModel.getSingleFlightBooking({
                    id: Number(id),
                    booked_by: constants_1.SOURCE_AGENT_B2C,
                });
                if (!booking_data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const payload = { status };
                let booking_tracking = `Booking status has been updated from ${booking_data.status} to ${status} by ${name}(${user_email}).`;
                if (status === flightConstant_1.FLIGHT_BOOKING_CONFIRMED) {
                    if (booking_data.status !== flightConstant_1.FLIGHT_BOOKING_PENDING &&
                        booking_data.status !== flightConstant_1.FLIGHT_BOOKING_IN_PROCESS &&
                        booking_data.status !== flightConstant_1.FLIGHT_BOOKING_CONFIRMED) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Flight book is not allowed for this booking. Only pending/booking in process booking can be booked.',
                        };
                    }
                    payload.gds_pnr = gds_pnr;
                    payload.airline_pnr = airline_pnr;
                    payload.ticket_issue_last_time = ticket_issue_last_time;
                    booking_tracking += ` GDS PNR: ${gds_pnr}, Airline PNR: ${airline_pnr}, Ticket Issue Last Time: ${ticket_issue_last_time}.`;
                }
                else if (status === flightConstant_1.FLIGHT_TICKET_ISSUE) {
                    if (booking_data.status !== flightConstant_1.FLIGHT_BOOKING_CONFIRMED &&
                        booking_data.status !== flightConstant_1.FLIGHT_TICKET_IN_PROCESS &&
                        booking_data.status !== flightConstant_1.FLIGHT_TICKET_ISSUE) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Ticket issue is not allowed for this booking. Only confirmed booking can be issued.',
                        };
                    }
                    booking_tracking += ` Ticket numbers: ${JSON.stringify(ticket_numbers)}.`;
                    const flightBookingTravelerModel = this.Model.FlightBookingTravelerModel(trx);
                    const agentBookingSubService = new agentFlightBookingSupport_service_1.AgentFlightBookingSupportService(trx);
                    payload.issued_by_type = constants_1.SOURCE_AGENT;
                    payload.issued_by_user_id = user_id;
                    if (charge_credit) {
                        const payment_data = yield agentBookingSubService.getPaymentInformation({
                            booking_id: Number(id),
                            payment_type: flightConstant_1.PAYMENT_TYPE_FULL,
                            refundable: booking_data.refundable,
                            departure_date: booking_data.travel_date,
                            agency_id: Number(booking_data.source_id),
                            ticket_price: booking_data.payable_amount,
                        });
                        if (payment_data.success === false) {
                            return payment_data;
                        }
                        const updatePayload = {
                            booking_id: Number(id),
                            status,
                            due: Number(payment_data.due),
                            agency_id: Number(booking_data.source_id),
                            booking_ref: booking_data.booking_ref,
                            deduct_amount_from: payment_data.deduct_amount_from,
                            paid_amount: Number(payment_data.paid_amount),
                            loan_amount: Number(payment_data.loan_amount),
                            invoice_id: Number(payment_data.invoice_id),
                            user_id: booking_data.created_by,
                            api: booking_data.api,
                        };
                        if (booking_data.status !== flightConstant_1.FLIGHT_TICKET_IN_PROCESS) {
                            updatePayload.issued_by_type = constants_1.SOURCE_AGENT;
                            updatePayload.issued_by_user_id = req.admin.user_id;
                        }
                        yield agentBookingSubService.updateDataAfterTicketIssue(updatePayload);
                        booking_tracking += ` With credit charged.`;
                    }
                    else {
                        booking_tracking += ` Without credit charged.`;
                    }
                    ticket_numbers === null || ticket_numbers === void 0 ? void 0 : ticket_numbers.map((ticket_number) => __awaiter(this, void 0, void 0, function* () {
                        yield flightBookingTravelerModel.updateFlightBookingTraveler({ ticket_number: ticket_number.ticket_number }, ticket_number.passenger_id);
                    }));
                }
                yield flightBookingModel.updateFlightBooking(payload, {
                    id: Number(id),
                    source_type: constants_1.SOURCE_AGENT_B2C,
                });
                yield flightBookingTrackingModel.insertFlightBookingTracking({
                    description: booking_tracking,
                    flight_booking_id: Number(id),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.AgentB2CSubFlightService = AgentB2CSubFlightService;
