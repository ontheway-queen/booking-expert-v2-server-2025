"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLASS_NAME = exports.PTC_TYPES_CHILD = exports.FLIGHT_FARE_RESPONSE = exports.PRIORITY_AIRPORTS = exports.FLIGHT_REVALIDATE_REDIS_KEY = exports.MIN_DAYS_BEFORE_DEPARTURE_FOR_DIRECT_TICKET = exports.TRAVELER_FILE_TYPE_VISA = exports.TRAVELER_FILE_TYPE_PASSPORT = exports.PARTIAL_PAYMENT_DEPARTURE_DATE = exports.PARTIAL_PAYMENT_PERCENTAGE = exports.PAYMENT_TYPE_PARTIAL = exports.PAYMENT_TYPE_FULL = exports.JOURNEY_TYPE_MULTI_CITY = exports.JOURNEY_TYPE_ROUND_TRIP = exports.JOURNEY_TYPE_ONE_WAY = exports.FLIGHT_BOOKING_REISSUED = exports.FLIGHT_BOOKING_REFUNDED = exports.FLIGHT_BOOKING_CANCELLED = exports.FLIGHT_BOOKING_EXPIRED = exports.FLIGHT_TICKET_ISSUE = exports.FLIGHT_BOOKING_ON_HOLD = exports.FLIGHT_TICKET_IN_PROCESS = exports.FLIGHT_BOOKING_IN_PROCESS = exports.FLIGHT_BOOKING_VOID = exports.FLIGHT_BOOKING_CONFIRMED = exports.FLIGHT_BOOKING_PENDING = exports.CT_API = exports.CUSTOM_API_NAME = exports.CUSTOM_API = exports.VERTEIL_API_NAME = exports.VERTEIL_API = exports.SABRE_API_NAME = exports.SABRE_API = exports.ROUTE_TYPE = exports.SABRE_FLIGHT_ITINS = exports.VERTEIL_TOKEN_ENV = exports.WFTT_TOKEN_ENV = exports.SABRE_TOKEN_ENV = void 0;
exports.SABRE_TOKEN_ENV = 'sabre_token';
exports.WFTT_TOKEN_ENV = 'wftt_token';
exports.VERTEIL_TOKEN_ENV = 'verteil_token';
exports.SABRE_FLIGHT_ITINS = '200ITINS';
// Route type
exports.ROUTE_TYPE = {
    FROM_DAC: 'FROM_DAC',
    TO_DAC: 'TO_DAC',
    DOMESTIC: 'DOMESTIC',
    SOTO: 'SOTO',
};
// API Name Const
exports.SABRE_API = 'SABRE';
exports.SABRE_API_NAME = 'S1';
exports.VERTEIL_API = 'VERTEIL';
exports.VERTEIL_API_NAME = 'N1';
exports.CUSTOM_API = 'CUSTOM';
exports.CUSTOM_API_NAME = 'LCC';
exports.CT_API = 'CHOLO_TRAVEL';
//booking status
exports.FLIGHT_BOOKING_PENDING = 'PENDING';
exports.FLIGHT_BOOKING_CONFIRMED = 'BOOKED';
exports.FLIGHT_BOOKING_VOID = 'VOIDED';
exports.FLIGHT_BOOKING_IN_PROCESS = 'BOOKING IN PROCESS';
exports.FLIGHT_TICKET_IN_PROCESS = 'TICKET IN PROCESS';
exports.FLIGHT_BOOKING_ON_HOLD = 'ON HOLD';
exports.FLIGHT_TICKET_ISSUE = 'ISSUED';
exports.FLIGHT_BOOKING_EXPIRED = 'EXPIRED';
exports.FLIGHT_BOOKING_CANCELLED = 'CANCELLED';
exports.FLIGHT_BOOKING_REFUNDED = 'REFUNDED';
exports.FLIGHT_BOOKING_REISSUED = 'REISSUED';
//journey type
exports.JOURNEY_TYPE_ONE_WAY = 'ONE WAY';
exports.JOURNEY_TYPE_ROUND_TRIP = 'ROUND TRIP';
exports.JOURNEY_TYPE_MULTI_CITY = 'MULTI CITY';
//ticket issue payment type
exports.PAYMENT_TYPE_FULL = 'full';
exports.PAYMENT_TYPE_PARTIAL = 'partial';
exports.PARTIAL_PAYMENT_PERCENTAGE = 30;
exports.PARTIAL_PAYMENT_DEPARTURE_DATE = 10;
//booking traveler files
exports.TRAVELER_FILE_TYPE_PASSPORT = 'passport';
exports.TRAVELER_FILE_TYPE_VISA = 'visa';
//min days before departure for direct ticket issue
exports.MIN_DAYS_BEFORE_DEPARTURE_FOR_DIRECT_TICKET = 2;
//redis key for flight revalidate data
exports.FLIGHT_REVALIDATE_REDIS_KEY = 'FLIGHT ID - ';
// Priority airport on search
exports.PRIORITY_AIRPORTS = [
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
exports.FLIGHT_FARE_RESPONSE = "Cancellation:<br/>Refund Amount = Paid Amount - Airline Cancellation Fee<br/>Re-issue:<br/>Re-issue Fee = Airline Fee + Fare Difference<br/>Validity:<br/>Re-issue or refund is subject to the original fare rules and route restrictions.<br/>Convenience Fee:<br/>The convenience fee is non-refundable.<br/>*The airline's fee is indicative and per person. Fare rules are subject to airline policies and may vary.";
exports.PTC_TYPES_CHILD = [
    'CHD',
    'C02',
    'C03',
    'C04',
    'C05',
    'C06',
    'C07',
    'C08',
    'C09',
    'C10',
    'C11',
];
exports.CLASS_NAME = {
    economy: 'ECONOMY',
    business: 'BUSINESS',
    first: 'FIRST',
    PREMIUM: 'PREMIUM',
};
