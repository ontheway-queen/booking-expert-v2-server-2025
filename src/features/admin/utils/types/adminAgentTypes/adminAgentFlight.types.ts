import { FLIGHT_BOOKING_CONFIRMED, FLIGHT_TICKET_ISSUE } from "../../../../../utils/miscellaneous/flightConstent";

export interface IAdminUpdateAgentPendingBookingManuallyPayload {
    status: typeof FLIGHT_BOOKING_CONFIRMED | typeof FLIGHT_TICKET_ISSUE;
    gds_pnr?: string;
    ticket_issue_last_time?: Date;
    airline_pnr?: string;
    ticket_numbers?: {
        passenger_id: number;
        ticket_number: string;
    }[];
    charge_credit: boolean;

}

export interface IAdminUpdateAgentProcessingTicketPayload {
    ticket_numbers: {
        passenger_id: number;
        ticket_number: string;
    }[];
    charge_credit: boolean;
}