export interface ICreateAgencyUserPayload {
  agency_id: number;
  username: string;
  name: string;
  email: string;
  hashed_password: string;
  phone_number: string;
  photo?: string;
  role_id: number;
  is_main_user: boolean;
}

export interface IUpdateAgencyUserPayload {
  name?: string;
  email?: string;
  phone_number?: string;
  hashed_password?: string;
  photo?: string;
  role_id?: number;
  is_main_user?: boolean;
  status?: boolean;
  two_fa?: boolean;
  socket_id?: string;
}

export interface IGetAgencyUserListQuery {
  agency_id: number;
  filter?: string;
  status?: string;
  limit?: string;
  skip?: string;
}

export interface IGetAgencyUserListData {
  id: number;
  username: string;
  name: string;
  email: string;
  photo?: string;
  role_id: number;
  role_name: string;
  is_main_user: boolean;
  status: boolean;
  socket_id?: string;
}

export interface ICheckAgencyUserData {
  id: number;
  agency_id: number;
  email: string;
  name: string;
  photo: string;
  mobile_number: string;
  username: string;
  hashed_password: string;
  two_fa: boolean;
  role_id: number;
  status: boolean;
  agency_status: 'Pending' | 'Active' | 'Inactive' | 'Rejected';
  agency_no: string;
  allow_api: boolean;
  is_main_user: boolean;
  white_label: boolean;
}
