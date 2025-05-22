import { SOURCE_ADMIN, SOURCE_AGENT, SOURCE_AGENT_B2C, SOURCE_B2C, SOURCE_SUB_AGENT } from "../../../miscellaneous/constants";
import { PAYMENT_TYPE_FULL, PAYMENT_TYPE_PARTIAL } from "../../../miscellaneous/flightConstent";
import { IGetSingleFlightBookingData, SourceType } from "../../../modelTypes/flightModelTypes/flightBookingModelTypes";
import { IFormattedFlightItinerary } from "../../flightTypes/commonFlightTypes";

export interface ICheckBookingEligibilityPayload {
    route: string;
    departure_date: string | Date;
    flight_number: string;
    domestic_flight: boolean;
    passenger: IFlightBookingPassengerReqBody[]
}

export interface ICheckDirectBookingPermissionPayload {
    markup_set_id: number;
    api_name: string;
    airline: string;
}

export interface IFlightBookingRequestBody {
    search_id: string;
    flight_id: string;
    passengers: IFlightBookingPassengerReqBody[];
}

export interface IFlightBookingPassengerReqBody {
    key: string;
    type: "ADT" | "C02" | "C03" | "C04" | "C05" | "C06" | "C07" | "C08" | "C09" | "C10" | "C11" | "INF";
    reference: "Mr" | "Mrs" | "Ms" | "Miss" | "MSTR";
    first_name: string;
    last_name: string;
    contact_number?: string;
    contact_email?: string;
    date_of_birth: string | Date;
    gender: "Male" | "Female";
    passport_number?: string;
    passport_expiry_date?: string | Date;
    nationality: number;
    issuing_country: number;
    frequent_flyer_airline?: string;
    frequent_flyer_number?: string;
    visa_file?: string;
    passport_file?: string;
    save_information?: boolean;
}

export interface IInsertFlightBookingDataPayload {
    gds_pnr: string | null;
    airline_pnr: string | null;
    status: "BOOKED" | "BOOKING IN PROCESS";
    api_booking_ref?: string | null;
    user_id: number;
    user_name: string;
    user_email: string;
    files?: any[];
    refundable: boolean;
    last_time: string | null;
    flight_data: IFormattedFlightItinerary;
    traveler_data: IFlightBookingPassengerReqBody[];
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
    invoice_ref_type: string;
    coupon_code?: string;
    booking_block?: boolean;
    api: string;
}


export interface IUpdateDataAfterFlightBookingCancelPayload {
    booking_id: number;
    booking_ref: string;
    cancelled_by_type: typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT | typeof SOURCE_AGENT_B2C | typeof SOURCE_B2C | typeof SOURCE_ADMIN;
    cancelled_by_user_id: number;
    api: string;
}

export interface ISendFlightBookingCancelEmailPayload {
    email: string;
    booking_data: IGetSingleFlightBookingData;
    panel_link: string;
    agency?: {
        photo: string;
    }
}

export interface ISendFlightBookingEmailPayload {
    email: string;
    booking_id: number;
    booked_by: typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT | typeof SOURCE_AGENT_B2C | typeof SOURCE_B2C;
    panel_link: string;
    agency?: {
        email: string;
        name: string;
        phone: string;
        address: string;
        photo: string;
    }
}

export interface ISendFlightTicketIssueEmailPayload {
    email: string;
    booking_id: number;
    booked_by: typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT | typeof SOURCE_AGENT_B2C | typeof SOURCE_B2C;
    panel_link: string;
    agency?: {
        email: string;
        name: string;
        phone: string;
        address: string;
        photo: string;
    },
    due: number;
}

