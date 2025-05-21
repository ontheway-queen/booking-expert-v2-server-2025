export const origin: string[] = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://10.10.220.47:5000',
  'http://10.10.220.31:3000',
  'https://agent.bookingexpert.us',
  'https://www.bookingexpert.us',
  'https://admin.bookingexpert.us',
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
export const PROJECT_NAME = 'Booking Expert';
export const PROJECT_LOGO =
  'https://m360ict-data.s3.ap-south-1.amazonaws.com/booking-expert-v2/main/be_logo.png';
export const PROJECT_ICON =
  'https://m360ict-data.s3.ap-south-1.amazonaws.com/booking-expert-v2/main/be_fab.png';
export const PROJECT_LINK = 'http://10.10.220.31:3000';
export const PROJECT_EMAIL = 'sup.m360ict@gmail.com';
export const PROJECT_NUMBER = '+8801958398339';
export const PROJECT_ADDRESS = 'Block#H, Road#7, House#74, Banani, Dhaka';

// Email subject
export const OTP_EMAIL_SUBJECT = 'Your One Time Password For Verification';

// Default data get limit
export const DATA_LIMIT = 100;
export const OTP_DEFAULT_EXPIRY = 3;

// markup set types
export const MARKUP_SET_TYPE_FLIGHT = 'Flight';
export const MARKUP_SET_TYPE_HOTEL = 'Hotel';

//error logs level
export const ERROR_LEVEL_DEBUG = 'DEBUG';
export const ERROR_LEVEL_INFO = 'INFO';
export const ERROR_LEVEL_WARNING = 'WARNING';
export const ERROR_LEVEL_ERROR = 'ERROR';
export const ERROR_LEVEL_CRITICAL = 'CRITICAL';

//panel source
export const SOURCE_AGENT = 'AGENT' as const;
export const SOURCE_SUB_AGENT = 'SUB AGENT' as const;
export const SOURCE_AGENT_B2C = 'AGENT B2C' as const;
export const SOURCE_B2C = 'B2C' as const;
export const SOURCE_EXTERNAL = 'EXTERNAL' as const;
export const SOURCE_ADMIN = 'ADMIN' as const;

//slug type
export const SLUG_TYPE_HOLIDAY = 'holiday';
export const SLUG_TYPE_UMRAH = 'umrah';
export const SLUG_TYPE_BLOG = 'blog';

//deposit type
export const DEPOSIT_STATUS_PENDING = 'PENDING';
export const DEPOSIT_STATUS_APPROVED = 'APPROVED';
export const DEPOSIT_STATUS_REJECTED = 'REJECTED';
export const DEPOSIT_STATUS_CANCELLED = 'CANCELLED';

// White label permissions modules
export const WHITE_LABEL_PERMISSIONS_MODULES: string[] = [];

//generate auto unique id
export const GENERATE_AUTO_UNIQUE_ID = {
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
} as const;

//payment gateways
export const PAYMENT_GATEWAYS = {
  SSL: 'SSL',
};

// MARKUP const
export const MARKUP_TYPE_PER = 'PER';
export const MARKUP_TYPE_FLAT = 'FLAT';
export const MARKUP_MODE_INCREASE = 'INCREASE';
export const MARKUP_MODE_DECREASE = 'DECREASE';
