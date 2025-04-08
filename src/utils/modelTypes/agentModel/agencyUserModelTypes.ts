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

export interface IGetAgencyUserData {
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
