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
exports.CommonFlightBookingSupportService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const uploaderConstants_1 = require("../../../../middleware/uploader/uploaderConstants");
const emailSendLib_1 = __importDefault(require("../../../lib/emailSendLib"));
const flightUtils_1 = __importDefault(require("../../../lib/flight/flightUtils"));
const lib_1 = __importDefault(require("../../../lib/lib"));
const constants_1 = require("../../../miscellaneous/constants");
const flightConstent_1 = require("../../../miscellaneous/flightConstent");
const flightBookingCancelTemplate_1 = require("../../../templates/flightBookingCancelTemplate");
const flightBookingTemplate_1 = require("../../../templates/flightBookingTemplate");
const flightTicketIssueTemplate_1 = require("../../../templates/flightTicketIssueTemplate");
const travelerModel_1 = __importDefault(require("../../../../models/travelerModel/travelerModel"));
class CommonFlightBookingSupportService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx || {};
    }
    checkEligibilityOfBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            //check if passport has provided for international flight
            if (payload.domestic_flight === false) {
                const passport_number = !payload.passenger.some((p) => p.passport_number == null);
                if (!passport_number) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: 'Passport number is required for international flight',
                    };
                }
            }
            // Get all passengers' first names, last names, passports, email, phone
            const passengers = payload.passenger.map((p) => ({
                first_name: p.first_name,
                last_name: p.last_name,
                passport: p.passport_number,
                email: p.contact_email,
                phone: p.contact_number,
            }));
            // Batch check if any passenger already booked this flight(DUPLICATE BOOKING)
            const flightModel = this.Model.FlightBookingModel(this.trx);
            const existingBooking = yield flightModel.checkFlightBooking({
                route: payload.route,
                departure_date: payload.departure_date,
                flight_number: payload.flight_number,
                passengers,
                status: [
                    flightConstent_1.FLIGHT_BOOKING_CONFIRMED,
                    flightConstent_1.FLIGHT_BOOKING_IN_PROCESS,
                    flightConstent_1.FLIGHT_TICKET_IN_PROCESS,
                    flightConstent_1.FLIGHT_BOOKING_ON_HOLD,
                    flightConstent_1.FLIGHT_TICKET_ISSUE,
                ],
            });
            if (existingBooking > 0) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.DUPLICATE_BOOKING,
                };
            }
            //check if there is already two cancelled bookings with the same passenger info
            const cancelledBooking = yield flightModel.checkFlightBooking({
                route: payload.route,
                departure_date: payload.departure_date,
                flight_number: payload.flight_number,
                passengers,
                status: [flightConstent_1.FLIGHT_BOOKING_CANCELLED],
            });
            if (cancelledBooking >= 2) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.BOOKING_CANCELLED_MORE_THAN_TWO_TIMES,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
            };
        });
    }
    checkDirectFlightBookingPermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const markupSetFlightApiModel = this.Model.DynamicFareModel(this.trx);
            const set_flight_api = yield markupSetFlightApiModel.getDynamicFareSuppliers({
                set_id: payload.markup_set_id,
                api_name: payload.api_name,
            });
            if (!set_flight_api.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.SET_FLIGHT_API_ID_NOT_FOUND,
                };
            }
            return {
                booking_block: false,
            };
        });
    }
    insertFlightBookingData(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const flightBookingModel = this.Model.FlightBookingModel(this.trx);
            const flightBookingPriceBreakdownModel = this.Model.FlightBookingPriceBreakdownModel(this.trx);
            const flightBookingSegmentModel = this.Model.FlightBookingSegmentModel(this.trx);
            const flightBookingTravelerModel = this.Model.FlightBookingTravelerModel(this.trx);
            const flightBookingTrackingModel = this.Model.FlightBookingTrackingModel(this.trx);
            const flightUtils = new flightUtils_1.default();
            //insert flight booking data
            const booking_ref = yield lib_1.default.generateNo({
                trx: this.trx,
                type: payload.type,
            });
            const booking_res = yield flightBookingModel.insertFlightBooking({
                booking_ref,
                api: payload.status === flightConstent_1.FLIGHT_BOOKING_IN_PROCESS
                    ? flightConstent_1.CUSTOM_API
                    : payload.flight_data.api,
                api_booking_ref: payload.api_booking_ref,
                refundable: payload.refundable,
                route: flightUtils.getRouteOfFlight(payload.flight_data.leg_description),
                journey_type: flightUtils.getJourneyType(payload.flight_data.journey_type),
                source_type: payload.source_type,
                source_id: payload.source_id,
                gds_pnr: payload.gds_pnr,
                total_passenger: payload.traveler_data.length,
                status: payload.status,
                base_fare: payload.flight_data.fare.base_fare,
                tax: payload.flight_data.fare.total_tax,
                ait: payload.flight_data.fare.ait,
                payable_amount: payload.flight_data.fare.payable,
                travel_date: payload.flight_data.flights[0].options[0].departure.date,
                ticket_issue_last_time: payload.flight_data.ticket_last_date +
                    payload.flight_data.ticket_last_time,
                airline_pnr: payload.airline_pnr,
                created_by: payload.user_id,
                vendor_fare: JSON.stringify(payload.flight_data.fare.vendor_price),
            });
            //insert flight booking price breakdown data
            const passenger_fare = payload.flight_data.passengers.map((passenger) => {
                return {
                    flight_booking_id: booking_res[0].id,
                    type: passenger.type,
                    total_passenger: passenger.number,
                    base_fare: passenger.per_pax_fare.base_fare,
                    tax: passenger.per_pax_fare.tax,
                    ait: passenger.per_pax_fare.ait,
                    discount: passenger.per_pax_fare.discount,
                    total_fare: passenger.per_pax_fare.total_fare,
                };
            });
            yield flightBookingPriceBreakdownModel.insertFlightBookingPriceBreakdown(passenger_fare);
            if (payload.flight_data.modifiedFare) {
                yield flightBookingPriceBreakdownModel.insertFlightBookingModifiedAmount(Object.assign({ flight_booking_id: booking_res[0].id }, payload.flight_data.modifiedFare));
            }
            //insert flight booking segment data
            const { baggage_info, cabin_info } = flightUtils.mapFlightAvailability(payload.flight_data.availability);
            payload.flight_data.flights.forEach((flight) => __awaiter(this, void 0, void 0, function* () {
                flight.options.forEach((option, ind) => __awaiter(this, void 0, void 0, function* () {
                    yield flightBookingSegmentModel.insertFlightBookingSegment({
                        flight_booking_id: booking_res[0].id,
                        flight_number: option.carrier.carrier_marketing_flight_number,
                        airline: option.carrier.carrier_marketing_airline,
                        airline_code: option.carrier.carrier_marketing_code,
                        airline_logo: option.carrier.carrier_marketing_logo,
                        origin: flightUtils.segmentPlaceInfo(option.departure.airport, option.departure.city, option.departure.city_code),
                        destination: flightUtils.segmentPlaceInfo(option.arrival.airport, option.arrival.city, option.arrival.city_code),
                        class: cabin_info[ind],
                        baggage: baggage_info[ind],
                        departure_date: option.departure.date,
                        departure_time: option.departure.time.split('+')[0],
                        arrival_date: option.arrival.date,
                        arrival_time: option.arrival.time.split('+')[0],
                        aircraft: option.carrier.carrier_aircraft_name,
                        duration: flightUtils.getDuration(Number(option.elapsedTime)),
                        departure_terminal: option.departure.terminal,
                        arrival_terminal: option.arrival.terminal,
                    });
                }));
            }));
            //insert flight booking traveler data
            const save_travelers = [];
            const flightBookingTravelerData = payload.traveler_data.map((traveler) => {
                var _a, _b, _c, _d, _e;
                //get visa and passport file
                let visa_file = traveler.visa_file;
                let passport_file = traveler.passport_file;
                if ((_a = payload.files) === null || _a === void 0 ? void 0 : _a.length) {
                    for (const file of payload.files) {
                        if (((_b = file.fieldname) === null || _b === void 0 ? void 0 : _b.split('-')[0]) === flightConstent_1.TRAVELER_FILE_TYPE_VISA &&
                            ((_c = file.fieldname) === null || _c === void 0 ? void 0 : _c.split('-')[1]) == traveler.key) {
                            visa_file = file.filename;
                        }
                        else if (((_d = file.fieldname) === null || _d === void 0 ? void 0 : _d.split('-')[0]) === flightConstent_1.TRAVELER_FILE_TYPE_PASSPORT &&
                            ((_e = file.fieldname) === null || _e === void 0 ? void 0 : _e.split('-')[1]) == traveler.key) {
                            passport_file = file.filename;
                        }
                    }
                }
                if (traveler.save_information) {
                    save_travelers.push(Object.assign(Object.assign({}, traveler), { visa_file,
                        passport_file, created_by: payload.user_id, source_id: payload.source_id, source_type: payload.source_type }));
                }
                return {
                    flight_booking_id: booking_res[0].id,
                    type: traveler.type,
                    reference: traveler.reference,
                    first_name: traveler.first_name,
                    last_name: traveler.last_name,
                    phone: traveler.contact_number,
                    email: traveler.contact_email,
                    date_of_birth: traveler.date_of_birth,
                    gender: traveler.gender,
                    passport_number: traveler.passport_number,
                    passport_expiry_date: traveler.passport_expiry_date,
                    issuing_country: traveler.issuing_country,
                    nationality: traveler.nationality,
                    frequent_flyer_number: traveler.frequent_flyer_number,
                    frequent_flyer_airline: traveler.frequent_flyer_airline,
                    visa_file,
                    passport_file,
                };
            });
            yield flightBookingTravelerModel.insertFlightBookingTraveler(flightBookingTravelerData);
            if (save_travelers.length) {
                yield new travelerModel_1.default(this.trx).insertTraveler(save_travelers);
            }
            //insert flight booking tracking data
            const tracking_data = [];
            tracking_data.push({
                flight_booking_id: booking_res[0].id,
                description: `Booking - ${booking_ref} has been made by Agent(${payload.user_name}). Booking status - ${payload.status}`,
            });
            if (payload.booking_block) {
                tracking_data.push({
                    flight_booking_id: booking_res[0].id,
                    description: `Booking block was enabled for this booking`,
                });
            }
            if (payload.payable_amount) {
                tracking_data.push({
                    flight_booking_id: booking_res[0].id,
                    description: `${payload.payable_amount} BDT has been paid for the booking`,
                });
            }
            if (payload.flight_data.api === flightConstent_1.CUSTOM_API) {
                tracking_data.push({
                    flight_booking_id: booking_res[0].id,
                    description: `This was a custom API`,
                });
            }
            yield flightBookingTrackingModel.insertFlightBookingTracking(tracking_data);
            //create invoice
            const invoiceModel = this.Model.InvoiceModel(this.trx);
            const invoice_res = yield invoiceModel.createInvoice({
                invoice_no: yield lib_1.default.generateNo({
                    trx: this.trx,
                    type: constants_1.GENERATE_AUTO_UNIQUE_ID.invoice,
                }),
                source_type: payload.source_type,
                source_id: payload.source_id,
                user_id: payload.user_id,
                ref_id: booking_res[0].id,
                ref_type: payload.invoice_ref_type,
                total_amount: payload.flight_data.fare.payable,
                due: payload.flight_data.fare.payable,
                details: `Invoice has been created for flight booking ref no. - ${booking_ref}`,
                type: constants_1.INVOICE_TYPES.SALE,
                status: constants_1.INVOICE_STATUS_TYPES.ISSUED,
            });
            return {
                booking_id: booking_res[0].id,
                booking_ref: booking_ref,
                invoice_id: invoice_res[0].id,
            };
        });
    }
    deleteFlightBookingData(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, source_type, }) {
            const flightBookingModel = this.Model.FlightBookingModel(this.trx);
            const flightBookingPriceBreakdownModel = this.Model.FlightBookingPriceBreakdownModel(this.trx);
            const flightBookingSegmentModel = this.Model.FlightBookingSegmentModel(this.trx);
            const invoiceModel = this.Model.InvoiceModel(this.trx);
            const flightBookingTravelerModel = this.Model.FlightBookingTravelerModel(this.trx);
            const flightBookingTrackingModel = this.Model.FlightBookingTrackingModel(this.trx);
            yield flightBookingPriceBreakdownModel.deleteFlightBookingPriceBreakdown(id);
            yield flightBookingTravelerModel.deleteFlightBookingTraveler({
                flight_booking_id: id,
            });
            yield flightBookingTrackingModel.deleteFlightBookingTracking({
                flight_booking_id: id,
            });
            yield invoiceModel.deleteInvoiceInvoice({
                ref: { id, type: constants_1.TYPE_FLIGHT },
                source_type: source_type,
            });
            yield flightBookingSegmentModel.deleteFlightBookingSegment({
                flight_booking_id: id,
            });
            yield flightBookingModel.deleteFlightBooking({ id, source_type });
        });
    }
    updateDataAfterBookingCancel(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            //update booking
            const flightBookingModel = this.Model.FlightBookingModel(this.trx);
            yield flightBookingModel.updateFlightBooking({
                status: flightConstent_1.FLIGHT_BOOKING_CANCELLED,
                cancelled_at: new Date(),
                cancelled_by_type: payload.cancelled_by_type,
                cancelled_by_user_id: payload.cancelled_by_user_id,
            }, { id: payload.booking_id, source_type: constants_1.SOURCE_AGENT });
            const flightBookingTrackingModel = this.Model.FlightBookingTrackingModel(this.trx);
            const tracking_data = [];
            tracking_data.push({
                flight_booking_id: payload.booking_id,
                description: `Booking - ${payload.booking_ref} has been cancelled by ${payload.cancelled_by_type}. API - ${payload.api}`,
            });
            yield flightBookingTrackingModel.insertFlightBookingTracking(tracking_data);
            //delete invoice
            const invoiceModel = this.Model.InvoiceModel(this.trx);
            yield invoiceModel.updateInvoice({
                status: constants_1.INVOICE_STATUS_TYPES.CANCELLED,
            }, payload.booking_id);
        });
    }
    sendFlightBookingMail(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const flightBookingModel = this.Model.FlightBookingModel(this.trx);
            const bookingTravelerModel = this.Model.FlightBookingTravelerModel(this.trx);
            const flightPriceBreakdownModel = this.Model.FlightBookingPriceBreakdownModel(this.trx);
            const flightSegmentModel = this.Model.FlightBookingSegmentModel(this.trx);
            const booking_data = yield flightBookingModel.getSingleFlightBooking({
                id: payload.booking_id,
                booked_by: payload.booked_by,
            });
            const get_travelers = yield bookingTravelerModel.getFlightBookingTraveler(payload.booking_id);
            const price_breakdown = yield flightPriceBreakdownModel.getFlightBookingPriceBreakdown(payload.booking_id);
            const segments = yield flightSegmentModel.getFlightBookingSegment(payload.booking_id);
            if (booking_data) {
                let source_logo = ((_a = payload.agency) === null || _a === void 0 ? void 0 : _a.photo)
                    ? `${uploaderConstants_1.FILE_STORAGE_HOST}${payload.agency.photo}`
                    : undefined;
                if (((_b = payload.agency) === null || _b === void 0 ? void 0 : _b.photo) && source_logo !== undefined) {
                    payload.agency.photo = source_logo;
                }
                const pdfBuffer = yield emailSendLib_1.default.generateEmailPdfBuffer((0, flightBookingTemplate_1.flightBookingPdfTemplate)({
                    booking: booking_data,
                    travelers: get_travelers,
                    priceBreakdown: price_breakdown,
                    segments: segments,
                    agency: payload.agency,
                }));
                //send email
                yield emailSendLib_1.default.sendEmail({
                    email: payload.email,
                    emailSub: `Flight Booking Confirmation - ${booking_data.booking_ref}`,
                    emailBody: (0, flightBookingTemplate_1.flightBookingBodyTemplate)({
                        booking: booking_data,
                        travelers: get_travelers,
                        panel_link: payload.panel_link,
                        logo: source_logo,
                    }),
                    attachments: [
                        {
                            filename: 'flight-booking.pdf',
                            content: pdfBuffer,
                            contentType: 'application/pdf',
                        },
                    ],
                });
            }
        });
    }
    sendTicketIssueMail(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const flightBookingModel = this.Model.FlightBookingModel(this.trx);
            const bookingTravelerModel = this.Model.FlightBookingTravelerModel(this.trx);
            const flightPriceBreakdownModel = this.Model.FlightBookingPriceBreakdownModel(this.trx);
            const flightSegmentModel = this.Model.FlightBookingSegmentModel(this.trx);
            const booking_data = yield flightBookingModel.getSingleFlightBooking({
                id: payload.booking_id,
                booked_by: payload.booked_by,
            });
            const get_travelers = yield bookingTravelerModel.getFlightBookingTraveler(payload.booking_id);
            const price_breakdown = yield flightPriceBreakdownModel.getFlightBookingPriceBreakdown(payload.booking_id);
            const segments = yield flightSegmentModel.getFlightBookingSegment(payload.booking_id);
            if (booking_data) {
                let source_logo = ((_a = payload.agency) === null || _a === void 0 ? void 0 : _a.photo)
                    ? `${uploaderConstants_1.FILE_STORAGE_HOST}${payload.agency.photo}`
                    : undefined;
                if (((_b = payload.agency) === null || _b === void 0 ? void 0 : _b.photo) && source_logo !== undefined) {
                    payload.agency.photo = source_logo;
                }
                const pdfBuffer = yield emailSendLib_1.default.generateEmailPdfBuffer((0, flightTicketIssueTemplate_1.flightTicketIssuePdfTemplate)({
                    booking: booking_data,
                    travelers: get_travelers,
                    priceBreakdown: price_breakdown,
                    segments: segments,
                    agency: payload.agency,
                }));
                //send email
                yield emailSendLib_1.default.sendEmail({
                    email: payload.email,
                    emailSub: `Flight Ticket Issue - ${booking_data.booking_ref}`,
                    emailBody: (0, flightTicketIssueTemplate_1.flightTicketIssueBodyTemplate)({
                        booking: booking_data,
                        travelers: get_travelers,
                        panel_link: payload.panel_link,
                        logo: source_logo,
                        due: payload.due,
                    }),
                    attachments: [
                        {
                            filename: 'flight-ticket.pdf',
                            content: pdfBuffer,
                            contentType: 'application/pdf',
                        },
                    ],
                });
            }
        });
    }
    sendBookingCancelMail(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let source_logo = ((_a = payload.agency) === null || _a === void 0 ? void 0 : _a.photo)
                ? `${uploaderConstants_1.FILE_STORAGE_HOST}${payload.agency.photo}`
                : undefined;
            yield emailSendLib_1.default.sendEmail({
                email: payload.email,
                emailSub: `Flight Booking Cancelled - ${payload.booking_data.booking_ref}`,
                emailBody: (0, flightBookingCancelTemplate_1.flightBookingCancelBodyTemplate)({
                    booking: payload.booking_data,
                    panel_link: payload.panel_link,
                    logo: source_logo,
                }),
            });
        });
    }
}
exports.CommonFlightBookingSupportService = CommonFlightBookingSupportService;
