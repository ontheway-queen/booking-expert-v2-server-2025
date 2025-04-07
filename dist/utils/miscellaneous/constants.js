"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_LEVEL_CRITICAL = exports.ERROR_LEVEL_ERROR = exports.ERROR_LEVEL_WARNING = exports.ERROR_LEVEL_INFO = exports.ERROR_LEVEL_DEBUG = exports.DATA_LIMIT = exports.OTP_FOR = exports.OTP_EMAIL_SUBJECT = exports.PROJECT_ADDRESS = exports.PROJECT_IMAGE_URL = exports.PROJECT_NUMBER = exports.PROJECT_EMAIL_2 = exports.PROJECT_EMAIL = exports.PROJECT_LOGO = exports.PROJECT_NAME = exports.OTP_TYPES = exports.origin = void 0;
exports.origin = ['http://localhost:3000'];
// OTP types constants
exports.OTP_TYPES = {
    reset_admin: 'reset_admin',
    verify_admin: 'verify_admin',
    reset_agent: 'reset_agent',
    verify_agent: 'verify_agent',
    reset_b2c: 'reset_b2c',
    verify_b2c: 'verify_b2c',
    reset_agent_b2c: 'reset_agent_b2c',
    verify_agent_b2c: 'verify_agent_b2c',
};
//Project Info
exports.PROJECT_NAME = 'Booking Expert=';
exports.PROJECT_LOGO = 'https://ticket.trabill.biz/assets/logo.png';
exports.PROJECT_EMAIL = 'sup.m360ict@gmail.com';
exports.PROJECT_EMAIL_2 = 'sup.m360ict@gmail.com';
exports.PROJECT_NUMBER = '+8801958398339';
exports.PROJECT_IMAGE_URL = 'https://ticket.trabill.biz/assets/logo.png';
exports.PROJECT_ADDRESS = 'Block#H, Road#7, House#74, Banani, Dhaka';
// Email subject
exports.OTP_EMAIL_SUBJECT = 'Your One Time Password For Verification';
// OTP for
exports.OTP_FOR = 'Verification';
// Default data get limit
exports.DATA_LIMIT = 100;
//error logs level
exports.ERROR_LEVEL_DEBUG = 'DEBUG';
exports.ERROR_LEVEL_INFO = 'INFO';
exports.ERROR_LEVEL_WARNING = 'WARNING';
exports.ERROR_LEVEL_ERROR = 'ERROR';
exports.ERROR_LEVEL_CRITICAL = 'CRITICAL';
