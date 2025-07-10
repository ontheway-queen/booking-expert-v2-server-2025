"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRONTEND_AGENT_FLIGHT_BOOKING_ENDPOINT = exports.INVOICE_STATUS_TYPES = exports.INVOICE_TYPES = exports.MARKUP_MODE_DECREASE = exports.MARKUP_MODE_INCREASE = exports.MARKUP_TYPE_FLAT = exports.MARKUP_TYPE_PER = exports.PAYMENT_GATEWAYS = exports.GENERATE_AUTO_UNIQUE_ID = exports.WHITE_LABEL_PERMISSIONS_MODULES = exports.DEPOSIT_STATUS_CANCELLED = exports.DEPOSIT_STATUS_REJECTED = exports.DEPOSIT_STATUS_APPROVED = exports.DEPOSIT_STATUS_PENDING = exports.SLUG_TYPE_BLOG = exports.SLUG_TYPE_UMRAH = exports.SLUG_TYPE_HOLIDAY = exports.SOURCE_ADMIN = exports.SOURCE_EXTERNAL = exports.SOURCE_B2C = exports.SOURCE_AGENT_B2C = exports.SOURCE_SUB_AGENT = exports.SOURCE_AGENT = exports.ERROR_LEVEL_CRITICAL = exports.ERROR_LEVEL_ERROR = exports.ERROR_LEVEL_WARNING = exports.ERROR_LEVEL_INFO = exports.ERROR_LEVEL_DEBUG = exports.TYPE_GROUP_FARE = exports.TYPE_UMRAH = exports.TYPE_HOLIDAY = exports.TYPE_VISA = exports.TYPE_HOTEL = exports.TYPE_FLIGHT = exports.OTP_DEFAULT_EXPIRY = exports.DATA_LIMIT = exports.OTP_EMAIL_SUBJECT = exports.PROJECT_ADDRESS = exports.PROJECT_NUMBER = exports.PROJECT_EMAIL = exports.B2C_PROJECT_LINK = exports.AGENT_PROJECT_LINK = exports.PROJECT_ICON = exports.PROJECT_LOGO = exports.PROJECT_NAME = exports.OTP_TYPES = exports.origin = void 0;
exports.origin = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://10.10.220.47:5000',
    'http://10.10.220.31:3000',
    'https://agent.bookingexpert.us',
    'https://www.bookingexpert.us',
    'https://admin-3f9e4x.bookingexpert.us',
    'http://10.10.220.42:3000',
    'http://10.10.220.42:6565',
    'http://10.10.220.42:5000',
];
// OTP types constants
exports.OTP_TYPES = {
    reset_admin: 'reset_admin',
    verify_admin: 'verify_admin',
    reset_agent: 'reset_agent',
    verify_agent: 'verify_agent',
    register_agent: 'register_agent',
    reset_b2c: 'reset_b2c',
    verify_b2c: 'verify_b2c',
    register_b2c: 'register_b2c',
    reset_agent_b2c: 'reset_agent_b2c',
    verify_agent_b2c: 'verify_agent_b2c',
    register_agent_b2c: 'register_agent_b2c',
};
//Project Info
exports.PROJECT_NAME = 'Booking Expert V2';
exports.PROJECT_LOGO = 'https://m360-trabill.s3.ap-south-1.amazonaws.com/booking-expert-v2/main/be_logo.png';
exports.PROJECT_ICON = 'https://m360-trabill.s3.ap-south-1.amazonaws.com/booking-expert-v2/main/be_icon.png';
exports.AGENT_PROJECT_LINK = 'https://agent.bookingexpert.us';
exports.B2C_PROJECT_LINK = 'https://bookingexpert.us';
exports.PROJECT_EMAIL = 'support@bookingexpert.us';
exports.PROJECT_NUMBER = '+880 1958-398347';
exports.PROJECT_ADDRESS = 'Block#H, Road#7, House#74, Banani, Dhaka';
// Email subject
exports.OTP_EMAIL_SUBJECT = 'Your One Time Password For Verification';
// Default data get limit
exports.DATA_LIMIT = 100;
exports.OTP_DEFAULT_EXPIRY = 3;
// set types
exports.TYPE_FLIGHT = 'Flight';
exports.TYPE_HOTEL = 'Hotel';
exports.TYPE_VISA = 'Visa';
exports.TYPE_HOLIDAY = 'Holiday';
exports.TYPE_UMRAH = 'Umrah';
exports.TYPE_GROUP_FARE = 'Group Fare';
//error logs level
exports.ERROR_LEVEL_DEBUG = 'DEBUG';
exports.ERROR_LEVEL_INFO = 'INFO';
exports.ERROR_LEVEL_WARNING = 'WARNING';
exports.ERROR_LEVEL_ERROR = 'ERROR';
exports.ERROR_LEVEL_CRITICAL = 'CRITICAL';
//panel source
exports.SOURCE_AGENT = 'AGENT';
exports.SOURCE_SUB_AGENT = 'SUB AGENT';
exports.SOURCE_AGENT_B2C = 'AGENT B2C';
exports.SOURCE_B2C = 'B2C';
exports.SOURCE_EXTERNAL = 'EXTERNAL';
exports.SOURCE_ADMIN = 'ADMIN';
//slug type
exports.SLUG_TYPE_HOLIDAY = 'holiday';
exports.SLUG_TYPE_UMRAH = 'umrah';
exports.SLUG_TYPE_BLOG = 'blog';
//deposit type
exports.DEPOSIT_STATUS_PENDING = 'PENDING';
exports.DEPOSIT_STATUS_APPROVED = 'APPROVED';
exports.DEPOSIT_STATUS_REJECTED = 'REJECTED';
exports.DEPOSIT_STATUS_CANCELLED = 'CANCELLED';
// White label permissions modules
exports.WHITE_LABEL_PERMISSIONS_MODULES = [];
//generate auto unique id
exports.GENERATE_AUTO_UNIQUE_ID = {
    agent: 'Agent',
    agent_flight: 'Agent_Flight',
    agent_visa: 'Agent_Visa',
    agent_holiday: 'Agent_Tour',
    agent_umrah: 'Agent_Umrah',
    agent_groupFare: 'Agent_GroupFare',
    agent_supportTicket: 'Agent_SupportTicket',
    agent_hotel: 'Agent_Hotel',
    agent_deposit_request: 'Agent_Deposit_Request',
    user_flight: 'User_Flight',
    user_visa: 'User_Visa',
    user_holiday: 'User_Tour',
    user_umrah: 'User_Umrah',
    user_supportTicket: 'User_SupportTicket',
    adm_management: 'ADM_Management',
    money_receipt: 'Money_Receipt',
    invoice: 'Invoice',
};
//payment gateways
exports.PAYMENT_GATEWAYS = {
    SSL: 'SSL',
};
// MARKUP const
exports.MARKUP_TYPE_PER = 'PER';
exports.MARKUP_TYPE_FLAT = 'FLAT';
exports.MARKUP_MODE_INCREASE = 'INCREASE';
exports.MARKUP_MODE_DECREASE = 'DECREASE';
//invoice type
exports.INVOICE_TYPES = {
    SALE: 'SALE',
    REFUND: 'REFUND',
    REISSUE: 'REISSUE',
};
//invoice type
exports.INVOICE_STATUS_TYPES = {
    PENDING: 'Pending',
    ISSUED: 'Issued',
    PAID: 'Paid',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
};
//frontend endpoints
exports.FRONTEND_AGENT_FLIGHT_BOOKING_ENDPOINT = '/dashboard/flights/';
