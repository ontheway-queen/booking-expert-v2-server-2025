import {
  CONTENT_TYPE_PHOTO,
  CONTENT_TYPE_VIDEO,
} from '../../miscellaneous/constants';

export interface ICreateAgencyB2CHeroBgContentPayload {
  type: typeof CONTENT_TYPE_PHOTO | typeof CONTENT_TYPE_VIDEO;
  agency_id: number;
  order_no: number;
  content: string;
}

export interface IUpdateAgencyB2CHeroBgContentPayload {
  order_no: number;
  content: string;
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
  order_no: number;
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
  order_number: number;
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

export interface ICreateAgencyB2CSiteConfig {
  agency_id: number;
  main_logo?: string;
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
  last_updated?: string;
  updated_by?: number;
}

export interface ICreateAgencyB2CSocialLink {
  agency_id: number;
  media: string;
  link: string;
  order_number: number;
  icon: string;
}

export interface ICreateAgencyB2CHotDeals {
  agency_id: number;
  title: string;
  thumbnail: string;
  link: string;
  order_number: number;
}
export interface ICreateAgencyB2CPopUpBanner {
  agency_id: number;
  title: string;
  thumbnail: string;
  link: string;
  description: string;
  pop_up_for: 'AGENT' | 'B2C' | 'BOTH';
}
