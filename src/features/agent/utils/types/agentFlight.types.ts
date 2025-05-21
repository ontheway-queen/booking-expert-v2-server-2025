import { PAYMENT_TYPE_FULL, PAYMENT_TYPE_PARTIAL } from "../../../../utils/miscellaneous/flightConstent";

export interface IAgentFlightTicketIssueReqBody {
    payment_type: typeof PAYMENT_TYPE_FULL | typeof PAYMENT_TYPE_PARTIAL;
}