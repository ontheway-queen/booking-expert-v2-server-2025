import { IMultipleAPIFlightBookingPassengerReqBody } from "../../flightTypes/commonFlightTypes";

export interface ICheckBookingEligibilityPayload {
    route: string;
    departure_date: string | Date;
    flight_number: string;
    domestic_flight: boolean;
    passenger: IMultipleAPIFlightBookingPassengerReqBody[]
}

export interface ICheckDirectBookingPermissionPayload {
    markup_set_id: number;
    api_name: string;
    airline: string;
}