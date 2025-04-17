import { Knex } from "knex";
import AbstractServices from "../../../../abstract/abstract.service";
import { FLIGHT_BOOKING_CANCELLED, FLIGHT_BOOKING_CONFIRMED, FLIGHT_BOOKING_IN_PROCESS, FLIGHT_BOOKING_ON_HOLD, FLIGHT_BOOKING_REQUEST, FLIGHT_TICKET_IN_PROCESS, FLIGHT_TICKET_ISSUE } from "../../../miscellaneous/flightConstent";
import { ICheckBookingEligibilityPayload, ICheckDirectBookingPermissionPayload } from "../../../supportTypes/bookingSupportTypes/flightBookingSupportTypes/commonFlightBookingTypes";

export class CommonFlightBookingSupportService extends AbstractServices {
    private trx: Knex.Transaction;
    constructor(trx?: Knex.Transaction) {
        super();
        this.trx = trx || {} as Knex.Transaction;
    }

    public async checkEligibilityOfBooking(payload: ICheckBookingEligibilityPayload) {
        //check if passport has provided for international flight
        if (payload.domestic_flight === false) {
            const passport_number = !payload.passenger.some(p => p.passport_number == null);
            if (!passport_number) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                    message: "Passport number is required for international flight"
                }
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
        const existingBooking = await flightModel.checkFlightBooking({
            route: payload.route,
            departure_date: payload.departure_date,
            flight_number: payload.flight_number,
            passengers,
            status: [FLIGHT_BOOKING_REQUEST, FLIGHT_BOOKING_CONFIRMED, FLIGHT_BOOKING_IN_PROCESS, FLIGHT_TICKET_IN_PROCESS, FLIGHT_BOOKING_ON_HOLD, FLIGHT_TICKET_ISSUE]
        });

        if (existingBooking > 0) {
            return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: this.ResMsg.DUPLICATE_BOOKING
            };
        }

        //check if there is already two cancelled bookings with the same passenger info
        const cancelledBooking = await flightModel.checkFlightBooking({
            route: payload.route,
            departure_date: payload.departure_date,
            flight_number: payload.flight_number,
            passengers,
            status: [FLIGHT_BOOKING_CANCELLED]
        });
        if (cancelledBooking >= 2) {
            return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: this.ResMsg.BOOKING_CANCELLED_MORE_THAN_TWO_TIMES
            }
        }

        return {
            success: true,
            code: this.StatusCode.HTTP_OK
        };
    }

    public async checkDirectFlightBookingPermission(payload: ICheckDirectBookingPermissionPayload) {
        const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(this.trx);
        const set_flight_api = await markupSetFlightApiModel.getMarkupSetFlightApi({
            markup_set_id: payload.markup_set_id,
            api_name: payload.api_name
        });

        if (!set_flight_api.length) {
            return {
                success: false,
                code: this.StatusCode.HTTP_NOT_FOUND,
                message: this.ResMsg.SET_FLIGHT_API_ID_NOT_FOUND
            }
        }

        const flightMarkupsModel = this.Model.FlightMarkupsModel(this.trx);
        const flightMarkupData = await flightMarkupsModel.getAllFlightMarkups({
            markup_set_flight_api_id: set_flight_api[0].id,
            airline: payload.airline
        });

        if (!flightMarkupData.data.length) {
            return {
                success: false,
                code: this.StatusCode.HTTP_NOT_FOUND,
                message: this.ResMsg.AIRLINE_DATA_NOT_PRESENT_FOR_MARKUP
            }
        }

        if (flightMarkupData.data[0].booking_block) {
            return {
                booking_block: true
            }
        } else {
            return {
                booking_block: false
            }
        }
    }
}