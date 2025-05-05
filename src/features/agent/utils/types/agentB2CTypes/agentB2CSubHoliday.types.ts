import { HOLIDAY_PRICE_MARKUP_FLAT, HOLIDAY_PRICE_MARKUP_PER, HOLIDAY_SERVICE_TYPE_EXCLUDE, HOLIDAY_SERVICE_TYPE_INCLUDE, HOLIDAY_TYPE_DOMESTIC, HOLIDAY_TYPE_INTERNATIONAL } from "../../../../../utils/miscellaneous/holidayConstants";

export interface ICreateAgencyB2CHolidayReqBody {
    slug: string;
    city_id: number[];
    title: string;
    details: string;
    holiday_type: typeof HOLIDAY_TYPE_DOMESTIC | typeof HOLIDAY_TYPE_INTERNATIONAL;
    duration: number;
    valid_till_date?: Date | string;
    group_size?: number;
    cancellation_policy?: string;
    tax_details?: string;
    general_condition?: string;
    created_by: number;
    pricing: IAgencyB2CHolidayPricingReqBody;
    itinerary: IAgencyB2CHolidayItineraryReqBody[];
    services: IAgencyB2CHolidayServiceReqBody[];
}

interface IAgencyB2CHolidayPricingReqBody {
    adult_price: number;
    child_price: number;
    markup_price?: number;
    markup_type?: typeof HOLIDAY_PRICE_MARKUP_FLAT | typeof HOLIDAY_PRICE_MARKUP_PER;
}

interface IAgencyB2CHolidayItineraryReqBody {
    day_number: number;
    title: string;
    details?: string;
}

interface IAgencyB2CHolidayServiceReqBody {
    type: typeof HOLIDAY_SERVICE_TYPE_INCLUDE | typeof HOLIDAY_SERVICE_TYPE_EXCLUDE;
    title: string;
}

export interface IAgencyB2CUpdateHolidayPackageReqBody {
    slug?: string;
    city?: IAgencyB2CHolidayCityUpdateReqBody;
    title?: string;
    details?: string;
    holiday_type?: typeof HOLIDAY_TYPE_DOMESTIC | typeof HOLIDAY_TYPE_INTERNATIONAL;
    duration?: number;
    valid_till_date?: Date | string;
    group_size?: number;
    cancellation_policy?: string;
    tax_details?: string;
    general_condition?: string;
    status?: boolean;
    pricing?: IAgencyB2CHolidayPricingUpdateReqBody;
    itinerary?: IAgencyB2CHolidayItineraryUpdateReqBody;
    services?: IAgencyB2CHolidayServiceUpdateReqBody;
    delete_images?: number[];
}

interface IAgencyB2CHolidayPricingUpdateReqBody {
    update: {
        id: number;
        adult_price?: number;
        child_price?: number;
        markup_price?: number;
        markup_type?: typeof HOLIDAY_PRICE_MARKUP_FLAT | typeof HOLIDAY_PRICE_MARKUP_PER;
    };
}

interface IAgencyB2CHolidayItineraryUpdateReqBody {
    add: IAgencyB2CHolidayItineraryReqBody[];
    delete: number[];
    update: {
        id: number;
        day_number?: number;
        title?: string;
        details?: string;
    }[];
}

interface IAgencyB2CHolidayServiceUpdateReqBody {
    add: IAgencyB2CHolidayServiceReqBody[];
    delete: number[];
    update: {
        id: number;
        type?: typeof HOLIDAY_SERVICE_TYPE_INCLUDE | typeof HOLIDAY_SERVICE_TYPE_EXCLUDE;
        title?: string;
    }[];
}

interface IAgencyB2CHolidayCityUpdateReqBody {
    add: number[];
    delete: number[];
}
