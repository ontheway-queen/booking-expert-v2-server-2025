export interface IGetSingleHolidayPackageBySubAgentParams {
  slug: string;
}

export interface IHolidayPackageBookBySubAgentPayload {
  holiday_package_id: number;
  total_adult: number;
  total_child: number;
  travel_date: string | Date;
  contact_email: string;
  contact_number: string;
  note_from_customer?: string;
}
