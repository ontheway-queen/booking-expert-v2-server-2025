import {
  CONTENT_TYPE_PHOTO,
  CONTENT_TYPE_VIDEO,
  FUNCTION_TYPE_BLOG,
  FUNCTION_TYPE_FLIGHT,
  FUNCTION_TYPE_GROUP,
  FUNCTION_TYPE_HOLIDAY,
  FUNCTION_TYPE_HOTEL,
  FUNCTION_TYPE_UMRAH,
  FUNCTION_TYPE_VISA,
} from '../../miscellaneous/constants';

export interface ICreateAgencyB2CHeroBgContentPayload {
  type: typeof CONTENT_TYPE_PHOTO | typeof CONTENT_TYPE_VIDEO;
  agency_id: number;
  order_number: number;
  content: string;
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

export interface IUpdateAgencyB2CHeroBgContentPayload {
  order_number?: number;
  type?: typeof CONTENT_TYPE_PHOTO | typeof CONTENT_TYPE_VIDEO;
  content?: string;
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

export interface IGetAgencyB2CHeroBgContentQuery {
  agency_id: number;
  status?: boolean;
  type?: typeof CONTENT_TYPE_PHOTO | typeof CONTENT_TYPE_VIDEO;
}

export interface IGetAgencyB2CHeroBgContentData {
  id: number;
  type: typeof CONTENT_TYPE_PHOTO | typeof CONTENT_TYPE_VIDEO;
  agency_id: number;
  order_number: number;
  content: string;
  status: boolean;
}

export interface ICreateAgencyB2CPopularDestinationPayload {
  agency_id: number;
  thumbnail: string;
  order_number: number;
  country_id: number;
  from_airport: number;
  to_airport: number;
}
export interface IUpdateAgencyB2CPopularDestinationPayload {
  thumbnail?: string;
  order_number?: number;
  country_id?: number;
  from_airport?: number;
  to_airport?: number;
}
export interface IGetAgencyB2CPopularDestinationQuery {
  agency_id: number;
  status?: boolean;
}

export interface IGetAgencyB2CPopularDestinationData {
  id: number;
  agency_id: number;
  thumbnail: string;
  order_number: number;
  country_id: number;
  country_name: string;
  from_airport: number;
  from_airport_name: string;
  from_airport_code: string;
  to_airport: number;
  to_airport_name: string;
  to_airport_code: string;
  status: boolean;
}

export interface IGetAgencyB2CPopularDestinationLastNoData {
  id: number;
  agency_id: number;
  thumbnail: string;
  order_number: number;
  country_id: number;
  from_airport: number;
  to_airport: number;
  status: boolean;
}

export interface ICreateAgencyB2CPopularPlace {
  agency_id: number;
  thumbnail: string;
  order_number: number;
  short_description?: string;
  location_id?: number;
  location_type?: string;
  location_name?: string;
  country_id?: number;
  status?: boolean;
}

export interface IGetAgencyB2CPopularPlaceQuery {
  agency_id: number;
  status?: boolean;
}

export interface IGetAgencyB2CPopularPlaceData {
  id: number;
  agency_id: number;
  thumbnail: string;
  order_number: number;
  short_description?: string;
  location_id?: number;
  location_type?: string;
  location_name?: string;
  country_name: string;
  country_id?: number;
  status: boolean;
}

export interface IUpdateAgencyB2CPopularPlace {
  thumbnail?: string;
  order_number?: number;
  short_description?: string;
  location_id?: number;
  location_type?: string;
  location_name?: string;
  country_id?: number;
  status?: boolean;
}

export interface ICreateAgencyB2CSiteConfig {
  agency_id: number;
  main_logo?: string;
  fabicon?: string;
  site_thumbnail?: string;
  hero_quote?: string;
  hero_sub_quote?: string;
  site_name?: string;
  emails?: any; // Replace `any` with a defined structure if known
  numbers?: any;
  address?: any;
  contact_us_content?: string;
  contact_us_thumbnail?: string;
  about_us_content?: string;
  about_us_thumbnail?: string;
  privacy_policy_content?: string;
  terms_and_conditions_content?: string;
  meta_title?: string;
  meta_description?: string;
  meta_tags?: string;
  notice?: string;
  last_updated?: Date;
  updated_by?: number;
  android_app_link?: string;
  ios_app_link?: string;
}

export interface IGetAgencyB2CSiteConfigData {
  id: number;
  agency_id: number;
  main_logo?: string;
  fabicon?: string;
  site_thumbnail?: string;
  hero_quote?: string;
  hero_sub_quote?: string;
  site_name?: string;
  emails?: string;
  numbers?: string;
  address?: string;
  contact_us_content?: string;
  contact_us_thumbnail?: string;
  about_us_content?: string;
  about_us_thumbnail?: string;
  privacy_policy_content?: string;
  terms_and_conditions_content?: string;
  meta_title?: string;
  meta_description?: string;
  meta_tags?: string;
  notice?: string;
  last_updated?: Date;
  updated_by?: number;
  updated_by_name?: string;
  android_app_link?: string;
  ios_app_link?: string;
}

export interface IUpdateAgencyB2CSiteConfigPayload {
  main_logo?: string;
  fabicon?: string;
  site_thumbnail?: string;
  hero_quote?: string;
  hero_sub_quote?: string;
  site_name?: string;
  emails?: string;
  numbers?: string;
  address?: string;
  contact_us_content?: string;
  contact_us_thumbnail?: string;
  about_us_content?: string;
  about_us_thumbnail?: string;
  privacy_policy_content?: string;
  terms_and_conditions_content?: string;
  meta_title?: string;
  meta_description?: string;
  meta_tags?: string;
  notice?: string;
  last_updated: Date;
  updated_by: number;
  android_app_link?: string;
  ios_app_link?: string;
}

export interface ICreateAgencyB2CSocialLinkPayload {
  agency_id: number;
  media: string;
  link: string;
  order_number: number;
  icon?: string;
}

export interface IGetAgencyB2CSocialLinkQuery {
  agency_id: number;
  status?: boolean;
}

export interface IGetAgencyB2CSocialLinkData {
  id: number;
  agency_id: number;
  media: string;
  link: string;
  order_number: number;
  icon: string;
  status: boolean;
}

export interface IUpdateAgencyB2CSocialLinkPayload {
  media?: string;
  link?: string;
  order_number?: number;
  icon?: string;
  status?: boolean;
}

export interface ICreateAgencyB2CHotDeals {
  agency_id: number;
  title: string;
  thumbnail: string;
  link: string;
  order_number: number;
}

export interface IGetAgencyB2CHotDealsQuery {
  agency_id: number;
  status?: boolean;
}

export interface IGetAgencyB2CHotDealsData {
  id: number;
  agency_id: number;
  title: string;
  thumbnail: string;
  link: string;
  order_number: number;
  status: boolean;
}

export interface IUpdateAgencyB2CHotDealsPayload {
  title?: string;
  thumbnail?: string;
  link?: string;
  order_number?: number;
  status?: boolean;
}

export interface ICreateAgencyB2CPopUpBanner {
  agency_id: number;
  title?: string;
  thumbnail?: string;
  link?: string;
  description?: string;
  pop_up_for: 'AGENT' | 'B2C';
}

export interface IGetAgencyB2CPopUpBannerQuery {
  agency_id: number;
  status?: boolean;
  pop_up_for?: 'AGENT' | 'B2C';
}

export interface IGetAgencyB2CPopUpBannerData {
  id: number;
  agency_id: number;
  title: string;
  thumbnail: string;
  link: string;
  description: string;
  pop_up_for: 'AGENT' | 'B2C';
  status: boolean;
}

export interface IUpdateAgencyB2CPopUpBannerPayload {
  title?: string;
  thumbnail?: string;
  link?: string;
  description?: string;
  status?: boolean;
}
