export interface IGetSingleHolidayPackageByB2CParams {
    slug: string;
}

export interface IHolidayPackageBookByB2CPayload{
    holiday_package_id: number;
    total_adult: number;
    total_child: number;
    travel_date: string | Date;
    contact_email: string;
    contact_number: string;
    note_from_customer?: string;
}