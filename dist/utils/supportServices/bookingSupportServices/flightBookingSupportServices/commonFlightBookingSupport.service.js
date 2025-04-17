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
const flightConstent_1 = require("../../../miscellaneous/flightConstent");
class CommonFlightBookingSupportService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx || {};
    }
    checkEligibilityOfBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            //check if passport has provided for international flight
            if (payload.domestic_flight === false) {
                const passport_number = !payload.passenger.some(p => p.passport_number == null);
                if (!passport_number) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: "Passport number is required for international flight"
                    };
                }
            }
            // Get all passengers' first names, last names, passports, email, phone
            const passengers = payload.passenger.map(p => ({
                first_name: p.first_name,
                last_name: p.last_name,
                passport: p.passport_number,
                email: p.contact_email,
                phone: p.contact_number
            }));
            // Batch check if any passenger already booked this flight(DUPLICATE BOOKING)
            const flightModel = this.Model.FlightBookingModel(this.trx);
            const existingBooking = yield flightModel.checkFlightBooking({
                route: payload.route,
                departure_date: payload.departure_date,
                flight_number: payload.flight_number,
                passengers,
                status: [flightConstent_1.FLIGHT_BOOKING_REQUEST, flightConstent_1.FLIGHT_BOOKING_CONFIRMED, flightConstent_1.FLIGHT_BOOKING_IN_PROCESS, flightConstent_1.FLIGHT_TICKET_IN_PROCESS, flightConstent_1.FLIGHT_BOOKING_ON_HOLD, flightConstent_1.FLIGHT_TICKET_ISSUE]
            });
            if (existingBooking > 0) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.DUPLICATE_BOOKING
                };
            }
            //check if there is already two cancelled bookings with the same passenger info
            const cancelledBooking = yield flightModel.checkFlightBooking({
                route: payload.route,
                departure_date: payload.departure_date,
                flight_number: payload.flight_number,
                passengers,
                status: [flightConstent_1.FLIGHT_BOOKING_CANCELLED]
            });
            if (cancelledBooking >= 2) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.BOOKING_CANCELLED_MORE_THAN_TWO_TIMES
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK
            };
        });
    }
    checkDirectFlightBookingPermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(this.trx);
            const set_flight_api = yield markupSetFlightApiModel.getMarkupSetFlightApi({
                markup_set_id: payload.markup_set_id,
                api_name: payload.api_name
            });
            if (!set_flight_api.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.SET_FLIGHT_API_ID_NOT_FOUND
                };
            }
            const flightMarkupsModel = this.Model.FlightMarkupsModel(this.trx);
            const flightMarkupData = yield flightMarkupsModel.getAllFlightMarkups({
                markup_set_flight_api_id: set_flight_api[0].id,
                airline: payload.airline
            });
            if (!flightMarkupData.data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.AIRLINE_DATA_NOT_PRESENT_FOR_MARKUP
                };
            }
            if (flightMarkupData.data[0].booking_block) {
                return {
                    booking_block: true
                };
            }
            else {
                return {
                    booking_block: false
                };
            }
        });
    }
}
exports.CommonFlightBookingSupportService = CommonFlightBookingSupportService;
