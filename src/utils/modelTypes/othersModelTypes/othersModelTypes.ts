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
  name?: string;
}

export interface IGetHotelSearchHistoryQuery {
  limit?: string;
  skip?: string;
  user_type?: 'Agent' | 'B2C' | 'Agent B2C' | 'Admin' | 'All';
  agency_id?: number;
  user_id?: number;
  from_date?: string;
  to_date?: string;
}

export interface IGetHotelSearchHistoryData {
  id: number;
  name: string;
  code: number;
  nationality: string;
  check_in_date: string;
  check_out_date: string;
  guest_n_rooms: {
    adults: number;
    children_ages?: number[];
  }[];
  destination_type: string;
  created_at: string;
}
