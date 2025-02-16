"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COM_MODE_DECREASE = exports.COM_MODE_INCREASE = exports.COM_TYPE_FLAT = exports.COM_TYPE_PER = exports.SABRE_API = exports.SABRE_FLIGHT_ITINS = exports.BD_AIRPORT = exports.DATA_LIMIT = exports.OTP_FOR = exports.OTP_EMAIL_SUBJECT = exports.SABRE_TOKEN_ENV = exports.PROJECT_ADDRESS = exports.PROJECT_IMAGE_URL = exports.PROJECT_NUMBER = exports.PROJECT_EMAIL_2 = exports.PROJECT_EMAIL = exports.PROJECT_LOGO = exports.PROJECT_NAME = exports.OTP_TYPE_FORGET_AGENT = exports.OTP_TYPE_FORGET_ADMIN = exports.origin = void 0;
exports.origin = ['http://localhost:3000'];
// OTP types constants
exports.OTP_TYPE_FORGET_ADMIN = 'reset_admin';
exports.OTP_TYPE_FORGET_AGENT = 'reset_agent';
//Project Info
exports.PROJECT_NAME = 'Trabill OTA';
exports.PROJECT_LOGO = 'https://ticket.trabill.biz/assets/logo.png';
exports.PROJECT_EMAIL = 'sup.m360ict@gmail.com';
exports.PROJECT_EMAIL_2 = 'sup.m360ict@gmail.com';
exports.PROJECT_NUMBER = '+8801958398339';
exports.PROJECT_IMAGE_URL = 'https://m360-trabill.s3.ap-south-1.amazonaws.com/trabill-ota-v2-storage';
exports.PROJECT_ADDRESS = 'Block#H, Road#7, House#74, Banani, Dhaka';
// Sabre token env ID
exports.SABRE_TOKEN_ENV = 'sabre_token';
// Email subject
exports.OTP_EMAIL_SUBJECT = 'Your One Time Password For Verification';
// OTP for
exports.OTP_FOR = 'Verification';
// Default data get limit
exports.DATA_LIMIT = 100;
// BD Airport
exports.BD_AIRPORT = [
    'DAC',
    'CGP',
    'ZYL',
    'CXB',
    'JSR',
    'BZL',
    'RJH',
    'SPD',
    'IRD',
];
exports.SABRE_FLIGHT_ITINS = '200ITINS';
// API Name Const
exports.SABRE_API = 'SABRE';
// airlines commission const
exports.COM_TYPE_PER = 'PER';
exports.COM_TYPE_FLAT = 'FLAT';
exports.COM_MODE_INCREASE = 'INCREASE';
exports.COM_MODE_DECREASE = 'DECREASE';
