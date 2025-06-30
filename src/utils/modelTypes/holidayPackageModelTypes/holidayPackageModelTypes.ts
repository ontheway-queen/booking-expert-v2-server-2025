import {
  HOLIDAY_CREATED_BY_ADMIN,
  HOLIDAY_CREATED_BY_AGENT,
  HOLIDAY_FOR_AGENT,
  HOLIDAY_FOR_AGENT_B2C,
  HOLIDAY_FOR_B2C,
  HOLIDAY_FOR_BOTH,
  HOLIDAY_TYPE_DOMESTIC,
  HOLIDAY_TYPE_INTERNATIONAL,
} from '../../miscellaneous/holidayConstants';
import {
  IGetHolidayPackageImage,
  IUpdateHolidayPackageImagePayload,
} from './holidayPackageImagesModelTypes';
import {
  IGetHolidayPackageItinerary,
  IUpdateHolidayPackageItineraryPayload,
} from './holidayPackageItineraryModelTypes';
import {
  IGetHolidayPackagePricingList,
  IUpdateHolidayPackagePricingPayload,
} from './holidayPackagePricingModelTypes';
import {
  IGetHolidayPackageService,
  IUpdateHolidayPackageServicePayload,
} from './holidayPackageServiceModelTypes';

export type HolidayType =
  | typeof HOLIDAY_TYPE_DOMESTIC
  | typeof HOLIDAY_TYPE_INTERNATIONAL;
export type HolidayForType =
  | typeof HOLIDAY_FOR_AGENT
  | typeof HOLIDAY_FOR_B2C
  | typeof HOLIDAY_FOR_BOTH
  | typeof HOLIDAY_FOR_AGENT_B2C;

export interface IInsertHolidayPackagePayload {
  slug: string;
  title: string;
  details?: string;
  holiday_type: HolidayType;
  duration: number;
  valid_till_date?: Date | string;
  group_size?: number;
  cancellation_policy?: string;
  tax_details?: string;
  general_condition?: string;
  holiday_for: HolidayForType;
  created_by: typeof HOLIDAY_CREATED_BY_ADMIN | typeof HOLIDAY_CREATED_BY_AGENT;
  created_by_id: number;
  agency_id?: number;
}

export interface IGetHolidayPackageListFilterQuery {
  city_id?: number;
  holiday_for?: HolidayForType;
  date?: string;
  slug?: string;
  status?: boolean;
  limit?: number;
  skip?: number;
  created_by: typeof HOLIDAY_CREATED_BY_ADMIN | typeof HOLIDAY_CREATED_BY_AGENT;
  agency_id?: number;
}

export interface IGetHolidayPackageList {
  id: number;
  slug: string;
  title: string;
  cities: {
    city_id: number;
    city_name: string;
    country: string;
  }[];
  holiday_type: HolidayType;
  holiday_for: HolidayForType;
  duration: number;
  image: string;
  price: number;
  status: boolean;
  created_at: Date;
}

export interface IGetSingleHolidayPackageData {
  id: number;
  slug: string;
  cities: {
    city_id: number;
    city_name: string;
    country: string;
  }[];
  title: string;
  details: string;
  holiday_type: HolidayType;
  duration: number;
  valid_till_date: Date | string | null;
  group_size: number | null;
  cancellation_policy: string | null;
  tax_details: string | null;
  general_condition: string | null;
  holiday_for: HolidayForType;
  status: boolean;
  created_at: Date;
  pricing: IGetHolidayPackagePricingList[];
  itinerary: IGetHolidayPackageItinerary[];
  services: IGetHolidayPackageService[];
  images: IGetHolidayPackageImage[];
}

export interface IGetSingleHolidayPackageParams {
  id?: number;
  slug?: string;
  status?: boolean;
  created_by: typeof HOLIDAY_CREATED_BY_ADMIN | typeof HOLIDAY_CREATED_BY_AGENT;
  holiday_for?: HolidayForType;
  agency_id?: number;
}

export interface IUpdateHolidayPackagePayload {
  slug?: string;
  title?: string;
  city_id?: number;
  details?: string;
  holiday_type?: HolidayType;
  duration?: number;
  valid_till_date?: Date | string;
  group_size?: number;
  cancellation_policy?: string;
  tax_details?: string;
  general_condition?: string;
  holiday_for?: HolidayForType;
  status?: boolean;
  pricing?: IUpdateHolidayPackagePricingPayload[];
  itinerary?: IUpdateHolidayPackageItineraryPayload[];
  services?: IUpdateHolidayPackageServicePayload[];
  images?: IUpdateHolidayPackageImagePayload[];
  is_deleted?: true;
}
