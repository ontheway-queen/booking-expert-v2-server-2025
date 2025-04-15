"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLIGHT_FARE_RESPONSE = exports.PRIORITY_AIRPORTS = exports.FLIGHT_BOOKING_REISSUED = exports.FLIGHT_BOOKING_REFUNDED = exports.FLIGHT_BOOKING_CANCELLED = exports.FLIGHT_BOOKING_EXPIRED = exports.FLIGHT_TICKET_ISSUE = exports.FLIGHT_BOOKING_ON_HOLD = exports.FLIGHT_BOOKING_IN_PROCESS = exports.FLIGHT_BOOKING_VOID = exports.FLIGHT_BOOKING_CONFIRMED = exports.FLIGHT_BOOKING_REQUEST = exports.MARKUP_MODE_DECREASE = exports.MARKUP_MODE_INCREASE = exports.MARKUP_TYPE_FLAT = exports.MARKUP_TYPE_PER = exports.SABRE_API = exports.SABRE_FLIGHT_ITINS = exports.SABRE_TOKEN_ENV = void 0;
// Sabre token env ID
exports.SABRE_TOKEN_ENV = 'sabre_token';
exports.SABRE_FLIGHT_ITINS = '200ITINS';
// API Name Const
exports.SABRE_API = 'SABRE';
// airlines MARKUP const
exports.MARKUP_TYPE_PER = 'PER';
exports.MARKUP_TYPE_FLAT = 'FLAT';
exports.MARKUP_MODE_INCREASE = 'INCREASE';
exports.MARKUP_MODE_DECREASE = 'DECREASE';
//booking status
exports.FLIGHT_BOOKING_REQUEST = "PENDING";
exports.FLIGHT_BOOKING_CONFIRMED = "BOOKED";
exports.FLIGHT_BOOKING_VOID = "VOIDED";
exports.FLIGHT_BOOKING_IN_PROCESS = "IN PROCESS";
exports.FLIGHT_BOOKING_ON_HOLD = "ON HOLD";
exports.FLIGHT_TICKET_ISSUE = "ISSUED";
exports.FLIGHT_BOOKING_EXPIRED = "EXPIRED";
exports.FLIGHT_BOOKING_CANCELLED = "CANCELLED";
exports.FLIGHT_BOOKING_REFUNDED = "REFUNDED";
exports.FLIGHT_BOOKING_REISSUED = "REISSUED";
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
