export interface IAgentGetSubAgencyReqQuery {
  filter?: string;
  limit?: string;
  skip?: string;
  status: 'Pending' | 'Active' | 'Inactive' | 'Rejected' | 'Incomplete';
  order?: 'asc' | 'desc';
}

export interface IAgentCreateSubAgentReqBody {
  email: string;
  agency_name: string;
  user_name: string;
  address: string;
  phone: string;
  flight_markup_type: "PER" | "FLAT";
  hotel_markup_type: "PER" | "FLAT";
  flight_markup_mode: "INCREASE" | "DECREASE";
  hotel_markup_mode: "INCREASE" | "DECREASE";
  flight_markup: number;
  hotel_markup: number;
}

export interface IAgentUpdateSubAgencyPayload {
  agency_logo?: string;
  civil_aviation?: string;
  trade_license?: string;
  national_id?: string;
  agency_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: 'Active' | 'Inactive';
  flight_markup_type: "PER" | "FLAT";
  hotel_markup_type: "PER" | "FLAT";
  flight_markup_mode: "INCREASE" | "DECREASE";
  hotel_markup_mode: "INCREASE" | "DECREASE";
  flight_markup: number;
  hotel_markup: number;
}

export interface IAgentSubAgencyUsersQueryFilter {
  limit?: string;
  skip?: string;
  status?: string;
}