import { HOLIDAY_FOR_AGENT, HOLIDAY_FOR_B2C, HOLIDAY_FOR_BOTH, HOLIDAY_PRICE_DISCOUNT_FLAT, HOLIDAY_PRICE_DISCOUNT_PER, HOLIDAY_SERVICE_TYPE_EXCLUDE, HOLIDAY_SERVICE_TYPE_INCLUDE, HOLIDAY_TYPE_DOMESTIC, HOLIDAY_TYPE_INTERNATIONAL } from "../../../../utils/miscellaneous/holidayConstants";

export interface ICreateHolidayReqBody {
    slug: string;
    city_id: number;
    title: string;
    details: string;
    holiday_type: typeof HOLIDAY_TYPE_DOMESTIC | typeof HOLIDAY_TYPE_INTERNATIONAL;
    duration: number;
    valid_till_date?: Date | string;
    group_size?: number;
    cancellation_policy?: string;
    tax_details?: string;
    general_condition?: string;
    holiday_for: typeof HOLIDAY_FOR_AGENT | typeof HOLIDAY_FOR_B2C | typeof HOLIDAY_FOR_BOTH;
    created_by: number;
    pricing: IHolidayPricingReqBody[];
    itinerary: IHolidayItineraryReqBody[];
    services: IHolidayServiceReqBody[];
}

interface IHolidayPricingReqBody {
    price_for: typeof HOLIDAY_FOR_AGENT | typeof HOLIDAY_FOR_B2C;
    adult_price: number;
    child_price: number;
    discount_price?: number;
    discount_type?: typeof HOLIDAY_PRICE_DISCOUNT_FLAT | typeof HOLIDAY_PRICE_DISCOUNT_PER;
}

interface IHolidayItineraryReqBody {
    day_number: number;
    title: string;
    details?: string;
}

interface IHolidayServiceReqBody {
    type: typeof HOLIDAY_SERVICE_TYPE_INCLUDE | typeof HOLIDAY_SERVICE_TYPE_EXCLUDE;
    title: string;
}

export interface IUpdateHolidayPackageReqBody {
    slug?: string;
    city_id?: number;
    title?: string;
    details?: string;
    holiday_type?: typeof HOLIDAY_TYPE_DOMESTIC | typeof HOLIDAY_TYPE_INTERNATIONAL;
    duration?: number;
    valid_till_date?: Date | string;
    group_size?: number;
    cancellation_policy?: string;
    tax_details?: string;
    general_condition?: string;
    holiday_for?: typeof HOLIDAY_FOR_AGENT | typeof HOLIDAY_FOR_B2C | typeof HOLIDAY_FOR_BOTH;
    status?: boolean;
    pricing?: IHolidayPricingUpdateReqBody;
    itinerary?: IHolidayItineraryUpdateReqBody;
    services?: IHolidayServiceUpdateReqBody;
    delete_images?: number[];
}

interface IHolidayPricingUpdateReqBody {
    add: IHolidayPricingReqBody[];
    delete: number[];
    update: {
        id: number;
        price_for?: typeof HOLIDAY_FOR_AGENT | typeof HOLIDAY_FOR_B2C;
        adult_price?: number;
        child_price?: number;
        discount_price?: number;
        discount_type?: typeof HOLIDAY_PRICE_DISCOUNT_FLAT | typeof HOLIDAY_PRICE_DISCOUNT_PER;
    }[];
}

interface IHolidayItineraryUpdateReqBody {
    add: IHolidayItineraryReqBody[];
    delete: number[];
    update: {
        id: number;
        day_number?: number;
        title?: string;
        details?: string;
    }[];
}

interface IHolidayServiceUpdateReqBody {
    add: IHolidayServiceReqBody[];
    delete: number[];
    update: {
        id: number;
        type?: typeof HOLIDAY_SERVICE_TYPE_INCLUDE | typeof HOLIDAY_SERVICE_TYPE_EXCLUDE;
        title?: string;
    }[];
}
