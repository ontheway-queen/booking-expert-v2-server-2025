import {
  SOURCE_ADMIN,
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
  SOURCE_B2C,
  SOURCE_SUB_AGENT,
  TYPE_FLIGHT,
  TYPE_GROUP_FARE,
  TYPE_HOLIDAY,
  TYPE_HOTEL,
  TYPE_UMRAH,
  TYPE_VISA,
} from '../../../miscellaneous/constants';
import {
  IGetSingleFlightBookingData,
  SourceType,
} from '../../../modelTypes/flightModelTypes/flightBookingModelTypes';
import { IFormattedFlightItinerary } from '../../flightTypes/commonFlightTypes';

export interface ICheckBookingEligibilityPayload {
  route: string;
  departure_date: string | Date;
  flight_number: string;
  domestic_flight: boolean;
  passenger: IFlightBookingPassengerReqBody[];
}

export interface ICheckDirectBookingPermissionPayload {
  markup_set_id: number;
  api_name: string;
  airline: string;
}

export interface IFlightBookingRequestBody {
  search_id: string;
  flight_id: string;
  booking_confirm?: boolean;
  passengers: IFlightBookingPassengerReqBody[];
}

export interface IFlightBookingPassengerReqBody {
  key: string;
  type:
  | 'ADT'
  | 'CHD'
  | 'C02'
  | 'C03'
  | 'C04'
  | 'C05'
  | 'C06'
  | 'C07'
  | 'C08'
  | 'C09'
  | 'C10'
  | 'C11'
  | 'INF';
  reference: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'MSTR';
  first_name: string;
  last_name: string;
  contact_number?: string;
  contact_email?: string;
  date_of_birth: string | Date;
  gender: 'Male' | 'Female';
  passport_number?: string;
  passport_expiry_date?: string | Date;
  passport_issue_date?: string | Date;
  nationality: number;
  issuing_country: number;
  frequent_flyer_airline?: string;
  frequent_flyer_number?: string;
  visa_file?: string;
  passport_file?: string;
  save_information?: boolean;
  _ref?: string;
}

export interface IInsertFlightBookingDataPayload {
  gds_pnr?: string;
  airline_pnr?: string;
  status: 'BOOKED' | 'BOOKING IN PROCESS' | 'PENDING';
  api_booking_ref?: string | null;
  user_id: number;
  user_name: string;
  user_email: string;
  files?: Express.Multer.File[];
  refundable: boolean;
  flight_data: IFormattedFlightItinerary;
  traveler_data: IFlightBookingPassengerReqBody[];
  type: 'Agent_Flight' | 'User_Flight';
  source_type: SourceType;
  source_id?: number;
  payable_amount?: number;
  invoice_ref_type:
  | typeof TYPE_FLIGHT
  | typeof TYPE_HOTEL
  | typeof TYPE_VISA
  | typeof TYPE_UMRAH
  | typeof TYPE_GROUP_FARE
  | typeof TYPE_HOLIDAY;
  coupon_code?: string;
  booking_block?: boolean;
}

export interface IUpdateDataAfterFlightBookingCancelPayload {
  booking_id: number;
  booking_ref: string;
  cancelled_by_type:
  | typeof SOURCE_AGENT
  | typeof SOURCE_SUB_AGENT
  | typeof SOURCE_AGENT_B2C
  | typeof SOURCE_B2C
  | typeof SOURCE_ADMIN;
  cancelled_by_user_id: number;
  api: string;
}

export interface ISendFlightBookingCancelEmailPayload {
  email: string;
  booking_data: IGetSingleFlightBookingData;
  panel_link: string;
  agency?: {
    photo: string;
  };
}

export interface ISendFlightBookingEmailPayload {
  email: string;
  booking_id: number;
  booked_by:
  | typeof SOURCE_AGENT
  | typeof SOURCE_SUB_AGENT
  | typeof SOURCE_AGENT_B2C
  | typeof SOURCE_B2C;
  panel_link: string;
  agency?: {
    email: string;
    name: string;
    phone: string;
    address: string;
    photo: string;
  };
}

export interface ISendFlightTicketIssueEmailPayload {
  email: string;
  booking_id: number;
  booked_by:
  | typeof SOURCE_AGENT
  | typeof SOURCE_SUB_AGENT
  | typeof SOURCE_AGENT_B2C
  | typeof SOURCE_B2C;
  panel_link: string;
  agency?: {
    email: string;
    name: string;
    phone: string;
    address: string;
    photo: string;
  };
  due: number;
}
