// Sabre token env ID
export const SABRE_TOKEN_ENV = 'sabre_token';

export const SABRE_FLIGHT_ITINS = '200ITINS';

// API Name Const
export const SABRE_API = 'SABRE';

// airlines MARKUP const
export const MARKUP_TYPE_PER = 'PER';
export const MARKUP_TYPE_FLAT = 'FLAT';
export const MARKUP_MODE_INCREASE = 'INCREASE';
export const MARKUP_MODE_DECREASE = 'DECREASE';

//booking status
export const FLIGHT_BOOKING_REQUEST = "PENDING";
export const FLIGHT_BOOKING_CONFIRMED = "BOOKED";
export const FLIGHT_BOOKING_VOID = "VOIDED";
export const FLIGHT_BOOKING_IN_PROCESS = "IN PROCESS";
export const FLIGHT_BOOKING_ON_HOLD = "ON HOLD";
export const FLIGHT_TICKET_ISSUE = "ISSUED";
export const FLIGHT_BOOKING_EXPIRED = "EXPIRED";
export const FLIGHT_BOOKING_CANCELLED = "CANCELLED";
export const FLIGHT_BOOKING_REFUNDED = "REFUNDED";
export const FLIGHT_BOOKING_REISSUED = "REISSUED";

// Priority airport on search
export const PRIORITY_AIRPORTS = [
  'DAC',
  'CGP',
  'ZYL',
  'CXB',
  'SPD',
  'RJH',
  'JSR',
  'BZL',
  'JED',
  'MCT',
  'DOH',
  'RUH',
  'DXB',
  'KUL',
  'DMM',
  'SIN',
  'SHJ',
  'MED',
  'BKK',
  'KTM',
  'AUH',
  'KWI',
  'LHR',
  'MAA',
  'CAN',
  'JFK',
  'AHB',
  'CMB',
  'DEL',
  'CCU',
  'MLE',
  'IXA',
  'BOM',
];

//flight fare response
export const FLIGHT_FARE_RESPONSE =
  "Cancellation:<br/>Refund Amount = Paid Amount - Airline Cancellation Fee<br/>Re-issue:<br/>Re-issue Fee = Airline Fee + Fare Difference<br/>Validity:<br/>Re-issue or refund is subject to the original fare rules and route restrictions.<br/>Convenience Fee:<br/>The convenience fee is non-refundable.<br/>*The airline's fee is indicative and per person. Fare rules are subject to airline policies and may vary.";

