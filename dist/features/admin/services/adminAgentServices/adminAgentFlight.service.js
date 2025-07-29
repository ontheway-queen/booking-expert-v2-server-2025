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
exports.AdminAgentFlightService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
const flightConstant_1 = require("../../../../utils/miscellaneous/flightConstant");
const sabreFlightSupport_service_1 = __importDefault(require("../../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service"));
const commonFlightBookingSupport_service_1 = require("../../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/commonFlightBookingSupport.service");
const agentFlightBookingSupport_service_1 = require("../../../../utils/supportServices/bookingSupportServices/flightBookingSupportServices/agentFlightBookingSupport.service");
class AdminAgentFlightService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getAllFlightBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const query = req.query;
                const data = yield flightBookingModel.getFlightBookingList(Object.assign(Object.assign({}, query), { booked_by: constants_1.SOURCE_AGENT }), true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: data.total,
                    data: data.data,
                };
            }));
        });
    }
    getSingleBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const flightSegmentModel = this.Model.FlightBookingSegmentModel(trx);
                const flightTravelerModel = this.Model.FlightBookingTravelerModel(trx);
                const flightPriceBreakdownModel = this.Model.FlightBookingPriceBreakdownModel(trx);
                const invoiceModel = this.Model.InvoiceModel(trx);
                const booking_id = Number(id);
                const booking_data = yield flightBookingModel.getSingleFlightBooking({
                    id: booking_id,
                    booked_by: constants_1.SOURCE_AGENT,
                });
                if (!booking_data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const price_breakdown_data = yield flightPriceBreakdownModel.getFlightBookingPriceBreakdown(booking_id);
                const segment_data = yield flightSegmentModel.getFlightBookingSegment(booking_id);
                const traveler_data = yield flightTravelerModel.getFlightBookingTraveler(booking_id);
                const modified_fare_amount = yield flightPriceBreakdownModel.getFlightBookingModifiedAmount(booking_id);
                const invoice = yield invoiceModel.getSingleInvoice({
                    source_type: constants_1.SOURCE_AGENT,
                    ref_id: Number(id),
                    ref_type: constants_1.TYPE_FLIGHT,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: Object.assign(Object.assign({}, booking_data), { price_breakdown_data,
                        segment_data,
                        traveler_data, invoice: {
                            id: invoice === null || invoice === void 0 ? void 0 : invoice.id,
                            invoice_no: invoice === null || invoice === void 0 ? void 0 : invoice.invoice_no,
                            total_amount: invoice === null || invoice === void 0 ? void 0 : invoice.total_amount,
                            due: invoice === null || invoice === void 0 ? void 0 : invoice.due,
                            status: invoice === null || invoice === void 0 ? void 0 : invoice.status,
                        }, modified_fare_amount: modified_fare_amount[0] }),
                };
            }));
        });
    }
    getBookingTrackingData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const bookingTrackingModel = this.Model.FlightBookingTrackingModel();
                const { id } = req.params;
                const { limit, skip } = req.query;
                const booking_data = yield flightBookingModel.getSingleFlightBooking({
                    id: Number(id),
                    booked_by: constants_1.SOURCE_AGENT,
                });
                if (!booking_data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const tracking_data = yield bookingTrackingModel.getFlightBookingTracking({ flight_booking_id: Number(id), limit, skip }, true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: tracking_data.total,
                    data: tracking_data.data,
                };
            }));
        });
    }
    //(AUTO CANCELLATION USING API)
    cancelBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const { id } = req.params; //booking id
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const booking_data = yield flightBookingModel.getSingleFlightBooking({
                    id: Number(id),
                    booked_by: constants_1.SOURCE_AGENT,
                });
                if (!booking_data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (![
                    flightConstant_1.FLIGHT_BOOKING_CONFIRMED,
                    flightConstant_1.FLIGHT_BOOKING_PENDING,
                    flightConstant_1.FLIGHT_BOOKING_IN_PROCESS,
                ].includes(booking_data.status)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Cancellation is not allowed for this booking. Check the booking status.',
                    };
                }
                let status = false;
                if (booking_data.api === flightConstant_1.SABRE_API) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    const res = yield sabreSubService.SabreBookingCancelService({
                        pnr: String(booking_data.gds_pnr),
                    });
                    if (res === null || res === void 0 ? void 0 : res.success) {
                        status = true;
                    }
                }
                if (status) {
                    const flightBookingSupportService = new commonFlightBookingSupport_service_1.CommonFlightBookingSupportService(trx);
                    //update booking data
                    yield flightBookingSupportService.updateDataAfterBookingCancel({
                        booking_id: Number(id),
                        booking_ref: booking_data.booking_ref,
                        cancelled_by_type: constants_1.SOURCE_ADMIN,
                        cancelled_by_user_id: user_id,
                        api: booking_data.api,
                    });
                    //send email
                    yield flightBookingSupportService.sendBookingCancelMail({
                        email: booking_data.source_email,
                        booking_data,
                        agency: {
                            photo: String(booking_data.source_logo),
                        },
                        panel_link: `${constants_1.AGENT_PROJECT_LINK}${constants_1.FRONTEND_AGENT_FLIGHT_BOOKING_ENDPOINT}${id}`,
                    });
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: 'Booking has been cancelled successfully!',
                    };
                }
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'Cannot cancel this booking. See error log for more details.',
                };
            }));
        });
    }
    //(AUTO TICKET ISSUE USING API)
    issueTicket(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params; //booking id
                const { user_id } = req.admin;
                //get flight details
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const bookingTravelerModel = this.Model.FlightBookingTravelerModel(trx);
                const booking_data = yield flightBookingModel.getSingleFlightBooking({
                    id: Number(id),
                    booked_by: constants_1.SOURCE_AGENT,
                });
                if (!booking_data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (booking_data.status !== flightConstant_1.FLIGHT_BOOKING_CONFIRMED) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Issue is not allowed for this booking. Only confirmed booking can be issued.',
                    };
                }
                //get other information
                const get_travelers = yield bookingTravelerModel.getFlightBookingTraveler(Number(id));
                //get payment details
                const bookingSubService = new commonFlightBookingSupport_service_1.CommonFlightBookingSupportService(trx);
                const agentBookingSubService = new agentFlightBookingSupport_service_1.AgentFlightBookingSupportService(trx);
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
                //check direct ticket issue permission
                const flightSegmentsModel = this.Model.FlightBookingSegmentModel(trx);
                const flightSegment = yield flightSegmentsModel.getFlightBookingSegment(Number(id));
                const ticketIssuePermission = yield agentBookingSubService.checkAgentDirectTicketIssuePermission({
                    agency_id: Number(booking_data.source_id),
                    api_name: booking_data.api,
                    airline: flightSegment[0].airline_code,
                });
                if (ticketIssuePermission.success === false) {
                    return ticketIssuePermission;
                }
                let status = null;
                if (ticketIssuePermission.issue_block === true) {
                    status = flightConstant_1.FLIGHT_TICKET_IN_PROCESS;
                }
                else {
                    //issue ticket using API
                    if (booking_data.api === flightConstant_1.SABRE_API) {
                        const travelerSet = new Set(get_travelers.map((elem) => elem.type));
                        const unique_traveler = travelerSet.size;
                        const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                        const res = yield sabreSubService.TicketIssueService({
                            pnr: String(booking_data.gds_pnr),
                            unique_traveler,
                        });
                        if (res === null || res === void 0 ? void 0 : res.success) {
                            status = flightConstant_1.FLIGHT_TICKET_ISSUE;
                        }
                    }
                }
                if (status !== null) {
                    const agencyModel = this.Model.AgencyModel(trx);
                    const agency_data = yield agencyModel.getSingleAgency(Number(booking_data.source_id));
                    if (!agency_data) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: this.ResMsg.HTTP_NOT_FOUND,
                        };
                    }
                    yield agentBookingSubService.updateDataAfterTicketIssue({
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
                        issued_by_type: constants_1.SOURCE_ADMIN,
                        issued_by_user_id: user_id,
                        issue_block: ticketIssuePermission.issue_block,
                        api: booking_data.api,
                    });
                    //send email
                    yield bookingSubService.sendTicketIssueMail({
                        booking_id: Number(id),
                        email: agency_data.email,
                        booked_by: constants_1.SOURCE_AGENT,
                        agency: {
                            email: agency_data.email,
                            name: agency_data.agency_name,
                            phone: agency_data.phone,
                            address: agency_data.address,
                            photo: agency_data.agency_logo,
                        },
                        panel_link: `${constants_1.AGENT_PROJECT_LINK}${constants_1.FRONTEND_AGENT_FLIGHT_BOOKING_ENDPOINT}${id}`,
                        due: Number(payment_data.due),
                    });
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: 'Ticket has been issued successfully!',
                        data: {
                            status,
                            due: payment_data.due,
                            paid_amount: payment_data.paid_amount,
                            loan_amount: payment_data.loan_amount,
                        },
                    };
                }
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'Cannot issue ticket for this booking. See error log for more details.',
                };
            }));
        });
    }
    updateBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { name, user_email } = req.admin;
                const { status, airline_pnr, charge_credit, gds_pnr, ticket_issue_last_time, ticket_numbers, } = req.body;
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const booking_data = yield flightBookingModel.getSingleFlightBooking({
                    id: Number(id),
                    booked_by: constants_1.SOURCE_AGENT,
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
                            updatePayload.issued_by_type = constants_1.SOURCE_ADMIN;
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
                    source_type: constants_1.SOURCE_AGENT,
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
exports.AdminAgentFlightService = AdminAgentFlightService;
