import {
  TYPE_PAYMENT_GATEWAY_BKASH,
  TYPE_PAYMENT_GATEWAY_SSL,
} from '../../../../../utils/miscellaneous/constants';

export interface IAdminAgentGetAgencyReqQuery {
  filter?: string;
  limit?: string;
  skip?: string;
  status: 'Pending' | 'Active' | 'Inactive' | 'Rejected' | 'Incomplete';
}

export interface IAdminAgentUpdateAgencyReqBody {
  agency_name?: string;
  email?: string;
  phone?: string;
  flight_markup_set?: number;
  hotel_markup_set?: number;
  kam_id?: number;
  ref_id?: number;
  address?: string;
  b2c_link?: string;
  b2b_link?: string;
  white_label?: boolean;
  allow_api?: boolean;
  book_permission?: boolean;
  status?: 'Pending' | 'Active' | 'Inactive' | 'Rejected' | 'Incomplete';
  white_label_permissions?: {
    flight: boolean;
    hotel: boolean;
    visa: boolean;
    holiday: boolean;
    umrah: boolean;
    group_fare: boolean;
    blog: boolean;
    b2c_link?: string;
    b2b_link?: string;
  };
}

export interface IAdminAgentUpdateAgencyUserReqBody {
  name?: string;
  email?: string;
  phone_number?: string;
  is_main_user?: boolean;
  status?: boolean;
}

export interface IAdminAgentUpdateAgencyApplicationReqBody {
  status: 'Active' | 'Rejected';
  hotel_markup_set?: number;
  flight_markup_set?: number;
  kam_id: number;
  book_permission: boolean;
}

export interface IAdminCreateAgentReqBody {
  email: string;
  agency_name: string;
  user_name: string;
  address: string;
  phone: string;
  flight_markup_set: number;
  hotel_markup_set: number;
  kam_id: number;
  ref_id?: number;
  white_label: boolean;
  allow_api: boolean;
  white_label_permissions?: {
    flight: boolean;
    hotel: boolean;
    visa: boolean;
    holiday: boolean;
    umrah: boolean;
    group_fare: boolean;
    blog: boolean;
    b2c_link?: string;
  };
}

export interface IAdminUpsertAgentEmailCredentialReqBody {
  type: 'GMAIL' | 'HOSTINGER' | 'NAMECHEAP' | 'ZOHO' | 'CPANEL' | 'OTHER';
  email: string;
  port: number;
  host: string;
  password: string;
}

export interface IAdminGetAgentEmailCredentialReqQuery {
  gateway_name:
    | typeof TYPE_PAYMENT_GATEWAY_SSL
    | typeof TYPE_PAYMENT_GATEWAY_BKASH;
  cred: {
    key: string;
    value: string;
  }[];
}
