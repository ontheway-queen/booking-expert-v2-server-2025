export const origin: string[] = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://10.10.220.47:5000',
];

// OTP types constants
export const OTP_TYPES = {
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
export const PROJECT_NAME = 'Booking Expert V2';
export const PROJECT_LOGO =
  'https://m360-trabill.s3.ap-south-1.amazonaws.com/booking-expert-v2/main/be_logo.png';
export const PROJECT_ICON =
  'https://m360-trabill.s3.ap-south-1.amazonaws.com/booking-expert-v2/main/be_icon.png';
export const PROJECT_LINK = 'http://10.10.220.31:3000';
export const PROJECT_EMAIL = 'sup.m360ict@gmail.com';
export const PROJECT_NUMBER = '+8801958398339';
export const PROJECT_ADDRESS = 'Block#H, Road#7, House#74, Banani, Dhaka';

// Email subject
export const OTP_EMAIL_SUBJECT = 'Your One Time Password For Verification';

// Default data get limit
export const DATA_LIMIT = 100;
export const OTP_DEFAULT_EXPIRY = 3;

//error logs level
export const ERROR_LEVEL_DEBUG = 'DEBUG';
export const ERROR_LEVEL_INFO = 'INFO';
export const ERROR_LEVEL_WARNING = 'WARNING';
export const ERROR_LEVEL_ERROR = 'ERROR';
export const ERROR_LEVEL_CRITICAL = 'CRITICAL';

// White label permissions modules
export const WHITE_LABEL_PERMISSIONS_MODULES: string[] = [];
