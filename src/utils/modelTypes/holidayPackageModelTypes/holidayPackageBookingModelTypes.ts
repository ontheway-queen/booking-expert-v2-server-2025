import { SOURCE_AGENT, SOURCE_AGENT_B2C, SOURCE_B2C, SOURCE_SUB_AGENT } from "../../miscellaneous/constants";
import { HOLIDAY_BOOKING_STATUS } from "../../miscellaneous/holidayConstants";

export type HolidayBookingSourceType = typeof SOURCE_AGENT | typeof SOURCE_SUB_AGENT | typeof SOURCE_B2C | typeof SOURCE_AGENT_B2C;

export type HolidayBookingStatus = typeof HOLIDAY_BOOKING_STATUS[keyof typeof HOLIDAY_BOOKING_STATUS];


export interface IInsertHolidayPackageBookingPayload {
    holiday_package_id: number;
    booking_ref: string;
    source_type: HolidayBookingSourceType;
    source_id: number;
    user_id: number;
    total_adult: number;
    total_child: number;
    total_adult_price: number;
    total_child_price: number;
    total_markup?: number;
    total_price: number;
    travel_date: Date | string;
    contact_email: string;
    contact_number: string;
    note_from_customer?: string;
    status?: HolidayBookingStatus;
}

export interface IGetHolidayPackageBookingListFilterQuery {
    status?: HolidayBookingStatus | HolidayBookingStatus[];
    from_date?: Date;
    to_date?: Date;
    filter?: string;
    limit?: number;
    skip?: number;
    source_id?: number;
    user_id?: number;
    booked_by: HolidayBookingSourceType;
    holiday_package_id?: number;
}

export interface IGetHolidayPackageBookingList {
    id: number;
    holiday_package_title: string;
    booking_ref: string;
    source_type: HolidayBookingSourceType;
    source_id: number;
    source_name: string;
    total_adult: number;
    total_child: number;
    total_price: number;
    travel_date: Date | null;
    created_at: Date;
    status: HolidayBookingStatus;
}

export interface ISingleHolidayPackageBookingFilterParams {
    id: number;
    booked_by: HolidayBookingSourceType;
    source_id?: number;
    user_id?: number;
}

export interface IGetSingleHolidayPackageBookingData {
    id: number;
    holiday_package_id: number;
    booking_ref: string;
    holiday_package_title: string;
    source_type: HolidayBookingSourceType;
    source_id: number | null;
    source_name: string | null;
    user_id: number;
    user_name: string;
    total_adult: number;
    total_child: number;
    total_adult_price: number;
    total_child_price: number;
    total_markup: number;
    total_price: number;
    travel_date: Date | null;
    contact_email: string;
    contact_number: string;
    note_from_customer: string | null;
    status: HolidayBookingStatus;
    created_at: Date;
}

export interface IUpdateHolidayPackageBookingPayload {
    status?: HolidayBookingStatus;
    cancelled_by?: number;
    cancelled_at?: Date;
    updated_by?: number;
    updated_at?: Date;
}
