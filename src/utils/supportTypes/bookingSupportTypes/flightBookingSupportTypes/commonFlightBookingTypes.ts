import { SourceType } from "../../../modelTypes/flightModelTypes/flightBookingModelTypes";
import { IFormattedFlightItinerary, IMultipleAPIFlightBookingPassengerReqBody } from "../../flightTypes/commonFlightTypes";

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

export interface IInsertFlightBookingDataPayload {
    gds_pnr: string | null;
    airline_pnr: string | null;
    status: "BOOKED" | "BOOKING IN PROCESS";
    api_booking_ref?: string| null;
    user_id: number;
    user_name: string;
    user_email: string;
    files?: any[];
    refundable: boolean;
    last_time: string | null;
    flight_data: IFormattedFlightItinerary;
    traveler_data: IMultipleAPIFlightBookingPassengerReqBody[];
    type: | 'Agent'
    | 'Agent_Flight'
    | 'Agent_Visa'
    | 'Agent_Tour'
    | 'Agent_Umrah'
    | 'Agent_GroupFare'
    | 'Agent_SupportTicket'
    | 'Agent_Hotel'
    | 'User_Flight'
    | 'User_Visa'
    | 'User_Tour'
    | 'User_Umrah'
    | 'User_SupportTicket';
    source_type: SourceType;
    source_id?: number;
    payable_amount?: number;
}