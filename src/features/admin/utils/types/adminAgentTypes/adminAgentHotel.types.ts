export interface IGetAdminHotelBookingQuery {
  limit?: string;
  skip?: string;
  filter?: string;
  agency_id?: number;
  from_date?: string;
  to_date?: string;
}
