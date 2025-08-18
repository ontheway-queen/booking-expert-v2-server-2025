"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FUNCTION_TYPE_VISA = exports.FUNCTION_TYPE_HOLIDAY = exports.FUNCTION_TYPE_HOTEL = exports.FUNCTION_TYPE_FLIGHT = exports.CONTENT_TYPE_VIDEO = exports.CONTENT_TYPE_PHOTO = exports.WHITE_LABEL_PERMISSIONS_MODULES = exports.DEPOSIT_STATUS_CANCELLED = exports.DEPOSIT_STATUS_REJECTED = exports.DEPOSIT_STATUS_APPROVED = exports.DEPOSIT_STATUS_PENDING = exports.SLUG_TYPE_BLOG = exports.SLUG_TYPE_UMRAH = exports.SLUG_TYPE_HOLIDAY = exports.SOURCE_ADMIN = exports.SOURCE_EXTERNAL = exports.SOURCE_B2C = exports.SOURCE_AGENT_B2C = exports.SOURCE_SUB_AGENT = exports.SOURCE_AGENT = exports.ERROR_LEVEL_CRITICAL = exports.ERROR_LEVEL_ERROR = exports.ERROR_LEVEL_WARNING = exports.ERROR_LEVEL_INFO = exports.ERROR_LEVEL_DEBUG = exports.TYPE_GROUP_FARE = exports.TYPE_UMRAH = exports.TYPE_HOLIDAY = exports.TYPE_VISA = exports.TYPE_HOTEL = exports.TYPE_FLIGHT = exports.OTP_DEFAULT_EXPIRY = exports.DATA_LIMIT = exports.OTP_EMAIL_SUBJECT = exports.ADMIN_NOTIFY_EMAIL = exports.PROJECT_ADDRESS = exports.PROJECT_NUMBER = exports.PROJECT_EMAIL = exports.B2C_PROJECT_LINK = exports.AGENT_PROJECT_LINK = exports.PROJECT_ICON = exports.PROJECT_LOGO = exports.PROJECT_NAME = exports.TYPE_EMAIL_SERVER_OTHER = exports.TYPE_EMAIL_SERVER_CPANEL = exports.TYPE_EMAIL_SERVER_ZOHO = exports.TYPE_EMAIL_SERVER_NAMECHEAP = exports.TYPE_EMAIL_SERVER_HOSTINGER = exports.TYPE_EMAIL_SERVER_GMAIL = exports.OTP_TYPES = void 0;
exports.UMRAH_BOOKING_STATUS_CANCELLED = exports.UMRAH_BOOKING_STATUS_CONFIRMED = exports.UMRAH_BOOKING_STATUS_PROCESSED = exports.UMRAH_BOOKING_STATUS_PROCESSING = exports.UMRAH_BOOKING_STATUS_PENDING = exports.FRONTEND_AGENT_FLIGHT_BOOKING_ENDPOINT = exports.INVOICE_STATUS_TYPES = exports.INVOICE_TYPES = exports.MARKUP_MODE_DECREASE = exports.MARKUP_MODE_INCREASE = exports.MARKUP_TYPE_FLAT = exports.MARKUP_TYPE_PER = exports.PAYMENT_GATEWAYS = exports.GENERATE_AUTO_UNIQUE_ID = exports.FUNCTION_TYPE_BLOG = exports.FUNCTION_TYPE_GROUP = exports.FUNCTION_TYPE_UMRAH = void 0;
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
// Email server type
exports.TYPE_EMAIL_SERVER_GMAIL = 'GMAIL';
exports.TYPE_EMAIL_SERVER_HOSTINGER = 'HOSTINGER';
exports.TYPE_EMAIL_SERVER_NAMECHEAP = 'NAMECHEAP';
exports.TYPE_EMAIL_SERVER_ZOHO = 'ZOHO';
exports.TYPE_EMAIL_SERVER_CPANEL = 'CPANEL';
exports.TYPE_EMAIL_SERVER_OTHER = 'OTHER';
//Project Info
exports.PROJECT_NAME = 'Booking Expert V2';
exports.PROJECT_LOGO = 'https://m360-trabill.s3.ap-south-1.amazonaws.com/booking-expert-v2/main/be_logo.png';
exports.PROJECT_ICON = 'https://m360-trabill.s3.ap-south-1.amazonaws.com/booking-expert-v2/main/be_icon.png';
exports.AGENT_PROJECT_LINK = 'https://agent.bookingexpert.us';
exports.B2C_PROJECT_LINK = 'https://bookingexpert.us';
exports.PROJECT_EMAIL = 'support@bookingexpert.us';
exports.PROJECT_NUMBER = '+880 1958-398347';
exports.PROJECT_ADDRESS = 'Block#H, Road#7, House#74, Banani, Dhaka';
exports.ADMIN_NOTIFY_EMAIL = 'ota.bookingexpert@gmail.com';
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
// content type
exports.CONTENT_TYPE_PHOTO = 'PHOTO';
exports.CONTENT_TYPE_VIDEO = 'VIDEO';
// functions type
exports.FUNCTION_TYPE_FLIGHT = 'FLIGHT';
exports.FUNCTION_TYPE_HOTEL = 'HOTEL';
exports.FUNCTION_TYPE_HOLIDAY = 'HOLIDAY';
exports.FUNCTION_TYPE_VISA = 'VISA';
exports.FUNCTION_TYPE_UMRAH = 'UMRAH';
exports.FUNCTION_TYPE_GROUP = 'GROUP';
exports.FUNCTION_TYPE_BLOG = 'BLOG';
//generate auto unique id
exports.GENERATE_AUTO_UNIQUE_ID = {
    agent: 'Agent',
    sub_agent: 'Sub_Agent',
    agent_flight: 'Agent_Flight',
    agent_visa: 'Agent_Visa',
    agent_holiday: 'Agent_Tour',
    agent_umrah: 'Agent_Umrah',
    agent_groupFare: 'Agent_GroupFare',
    agent_supportTicket: 'Agent_SupportTicket',
    agent_hotel: 'Agent_Hotel',
    agent_deposit_request: 'Agent_Deposit_Request',
    b2c_deposit_request: 'B2C_Deposit_Request',
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
//Umrah package Booking status
exports.UMRAH_BOOKING_STATUS_PENDING = 'PENDING';
exports.UMRAH_BOOKING_STATUS_PROCESSING = 'PROCESSING';
exports.UMRAH_BOOKING_STATUS_PROCESSED = 'PROCESSED';
exports.UMRAH_BOOKING_STATUS_CONFIRMED = 'CONFIRMED';
exports.UMRAH_BOOKING_STATUS_CANCELLED = 'CANCELLED';
