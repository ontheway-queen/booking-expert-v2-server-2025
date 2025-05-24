export interface IInsertHotelSearchHistoryPayload {
  user_type: 'Agent' | 'B2C' | 'Agent B2C' | 'Admin';
  check_in_date: string;
  check_out_date: string;
  guest_n_rooms: string;
  destination_type: 'Hotel' | 'City';
  user_id?: number;
  code: number;
  agency_id?: number;
  nationality?: string;
}
