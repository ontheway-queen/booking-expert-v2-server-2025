import {
  CONTENT_TYPE_PHOTO,
  CONTENT_TYPE_VIDEO,
  FUNCTION_TYPE_FLIGHT,
  FUNCTION_TYPE_HOTEL,
  FUNCTION_TYPE_BLOG,
  FUNCTION_TYPE_GROUP,
  FUNCTION_TYPE_HOLIDAY,
  FUNCTION_TYPE_UMRAH,
  FUNCTION_TYPE_VISA,
} from '../../../../../utils/miscellaneous/constants';

export interface IUpdateBankAccountReqBody {
  account_name?: string;
  account_number?: string;
  branch?: string;
  routing_no?: string;
  swift_code?: string;
  status?: boolean;
}
export interface ICreateBankAccountReqBody {
  bank_id: number;
  account_name: string;
  account_number: string;
  branch?: string;
  routing_no?: string;
  swift_code?: string;
}
export interface IUpSertPopUpBannerReqBody {
  title?: string;
  pop_up_for: 'AGENT' | 'B2C';
  status?: boolean;
  description?: string;
  link?: string;
}

export interface ICreateHeroBGContentReqBody {
  type: typeof CONTENT_TYPE_PHOTO | typeof CONTENT_TYPE_VIDEO;
  quote?: string;
  sub_quote?: string;
  tab?:
    | typeof FUNCTION_TYPE_FLIGHT
    | typeof FUNCTION_TYPE_HOTEL
    | typeof FUNCTION_TYPE_HOLIDAY
    | typeof FUNCTION_TYPE_VISA
    | typeof FUNCTION_TYPE_GROUP
    | typeof FUNCTION_TYPE_BLOG
    | typeof FUNCTION_TYPE_UMRAH;
}

export interface IUpdateHeroBGContentReqBody {
  type?: typeof CONTENT_TYPE_PHOTO | typeof CONTENT_TYPE_VIDEO;
  quote?: string;
  sub_quote?: string;
  tab?:
    | typeof FUNCTION_TYPE_FLIGHT
    | typeof FUNCTION_TYPE_HOTEL
    | typeof FUNCTION_TYPE_HOLIDAY
    | typeof FUNCTION_TYPE_VISA
    | typeof FUNCTION_TYPE_GROUP
    | typeof FUNCTION_TYPE_BLOG
    | typeof FUNCTION_TYPE_UMRAH;
  status?: boolean;
  order_number?: number;
}

export interface ICreatePopularDestinationReqBody {
  from_airport: number;
  to_airport: number;
}
export interface IUpdatePopularDestinationReqBody {
  from_airport?: number;
  to_airport?: number;
  status?: boolean;
  order_number?: number;
}
export interface ICreatePopularPlaceReqBody {
  country_id: number;
  location_id: number;
  location_type: string;
  location_name: string;
  short_description: string;
}

export interface IUpdatePopularPlaceReqBody {
  country_id?: number;
  location_id?: number;
  location_type?: string;
  location_name?: string;
  short_description?: string;
  order_number?: number;
  status?: boolean;
}

export interface ICreateHotDealsReqBody {
  title: string;
  link: string;
}

export interface IUpdateHotDealsReqBody {
  title?: string;
  link?: string;
  order_number?: number;
  status?: boolean;
}
