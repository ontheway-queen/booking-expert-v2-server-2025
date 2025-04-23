import { IGetHolidayPackageImage, IUpdateHolidayPackageImagePayload } from "./holidayPackageImagesModelTypes";
import { IGetHolidayPackageItinerary, IUpdateHolidayPackageItineraryPayload } from "./holidayPackageItineraryModelTypes";
import { IGetHolidayPackagePricingList, IUpdateHolidayPackagePricingPayload } from "./holidayPackagePricingModelTypes";
import { IGetHolidayPackageService, IUpdateHolidayPackageServicePayload } from "./holidayPackageServiceModelTypes";

export type HolidayType = "Domestic" | "International";
export type HolidayForType = "AGENT" | "B2C" | "BOTH";

export interface IInsertHolidayPackagePayload {
    slug: string;
    city_id: number;
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
    created_by: number;
}

export interface IGetHolidayPackageListFilterQuery {
    city_id?: number;
    holiday_for?: HolidayForType;
    date?: Date;
    slug?: string;
    status?: boolean;
    limit?: number;
    skip?: number;
}

export interface IGetHolidayPackageList {
    id: number;
    slug: string;
    title: string;
    city: string;
    country: string;
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
    city_id: number;
    city: string;
    country: string;
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
}

export interface IDeleteHolidayPackagePayload {
    is_deleted: true;
}
