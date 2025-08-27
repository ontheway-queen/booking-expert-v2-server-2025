import {
  SOURCE_ADMIN,
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
  SOURCE_B2C,
} from '../../../miscellaneous/constants';
import {
  FLIGHT_BOOKING_ON_HOLD,
  FLIGHT_TICKET_IN_PROCESS,
  FLIGHT_TICKET_ISSUE,
  PAYMENT_TYPE_FULL,
  PAYMENT_TYPE_PARTIAL,
} from '../../../miscellaneous/flightConstant';
import { IGetFlightBookingTravelerData } from '../../../modelTypes/flightModelTypes/flightBookingTravelerModelTypes';

export interface ICheckAgentDirectTicketIssuePermissionPayload {
  agency_id: number;
  api_name: string;
  airline: string;
}

export interface IGetPaymentInformationReqBody {
  booking_id: number;
  payment_type: typeof PAYMENT_TYPE_FULL | typeof PAYMENT_TYPE_PARTIAL;
  refundable: boolean;
  departure_date: string;
  agency_id: number;
  ticket_price: number;
}

export interface IAgentUpdateDataAfterTicketIssue {
  booking_id: number;
  status: typeof FLIGHT_TICKET_IN_PROCESS | typeof FLIGHT_TICKET_ISSUE | typeof FLIGHT_BOOKING_ON_HOLD;
  due: number;
  agency_id: number;
  booking_ref: string;
  deduct_amount_from: 'Both' | 'Loan' | 'Balance';
  paid_amount: number;
  loan_amount: number;
  invoice_id: number;
  user_id: number;
  issued_by_type?:
    | typeof SOURCE_ADMIN
    | typeof SOURCE_AGENT
    | typeof SOURCE_AGENT_B2C
    | typeof SOURCE_B2C;
  issued_by_user_id?: number;
  issue_block?: boolean;
  api: string;
  ticket_number?: string[];
  travelers_info?: IGetFlightBookingTravelerData[];
}
