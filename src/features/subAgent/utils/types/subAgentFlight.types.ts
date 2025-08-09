import {
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_EXPIRED,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_BOOKING_ON_HOLD,
  FLIGHT_BOOKING_REFUNDED,
  FLIGHT_BOOKING_REISSUED,
  FLIGHT_BOOKING_PENDING,
  FLIGHT_BOOKING_VOID,
  FLIGHT_TICKET_IN_PROCESS,
  FLIGHT_TICKET_ISSUE,
  PAYMENT_TYPE_FULL,
  PAYMENT_TYPE_PARTIAL,
} from "../../../../utils/miscellaneous/flightConstant";

export interface ISubAgentFlightTicketIssueReqBody {
  payment_type: typeof PAYMENT_TYPE_FULL | typeof PAYMENT_TYPE_PARTIAL;
}

export interface ISubAgentGetFlightBookingReqQuery {
  status?:
    | typeof FLIGHT_BOOKING_PENDING
    | typeof FLIGHT_BOOKING_CONFIRMED
    | typeof FLIGHT_BOOKING_VOID
    | typeof FLIGHT_BOOKING_IN_PROCESS
    | typeof FLIGHT_TICKET_IN_PROCESS
    | typeof FLIGHT_BOOKING_ON_HOLD
    | typeof FLIGHT_TICKET_ISSUE
    | typeof FLIGHT_BOOKING_EXPIRED
    | typeof FLIGHT_BOOKING_CANCELLED
    | typeof FLIGHT_BOOKING_REFUNDED
    | typeof FLIGHT_BOOKING_REISSUED;
  from_date?: string;
  to_date?: string;
  filter?: string;
  limit?: number;
  skip?: number;
}
