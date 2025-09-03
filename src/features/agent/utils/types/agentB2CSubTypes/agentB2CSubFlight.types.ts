import {
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_EXPIRED,
  FLIGHT_BOOKING_VOID,
  FLIGHT_TICKET_ISSUE,
} from '../../../../../utils/miscellaneous/flightConstant';

export interface IAgentUpdateAgentB2CFlightBookingReqBody {
  status:
    | typeof FLIGHT_BOOKING_CONFIRMED
    | typeof FLIGHT_TICKET_ISSUE
    | typeof FLIGHT_BOOKING_EXPIRED
    | typeof FLIGHT_BOOKING_CANCELLED
    | typeof FLIGHT_BOOKING_VOID;
  gds_pnr?: string;
  airline_pnr?: string;
  ticket_issue_last_time?: string;
  charge_credit?: boolean;
  ticket_numbers?: {
    passenger_id: number;
    ticket_number: string;
  }[];
}
