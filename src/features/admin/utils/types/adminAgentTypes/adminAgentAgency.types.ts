export interface IAdminAgentGetAgencyReqQuery {
  filter?: string;
  limit?: string;
  skip?: string;
  status: string;
}

export interface IAdminAgentUpdateAgencyReqBody {
  agency_name?: string;
  email?: string;
  phone?: string;
  flight_markup_set?: number;
  hotel_markup_set?: number;
  address?: string;
  white_label?: boolean;
  allow_api?: boolean;
  status?: 'Pending' | 'Active' | 'Inactive' | 'Rejected' | 'Incomplete';
  white_label_permissions?: {
    flight: boolean;
    hotel: boolean;
    visa: boolean;
    holiday: boolean;
    umrah: boolean;
    group_fare: boolean;
    blog: boolean;
  };
}

export interface IAdminAgentUpdateAgencyApplicationReqBody {
  status: 'Active' | 'Rejected';
  hotel_markup_set: number;
  flight_markup_set: number;
}
