export interface IAdminCreatePayload {
  username: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  password_hash: string;
  phone_number: string;
  photo?: string;
  role_id: number;
  created_by: number;
}

export interface IGetAdminListFilterQuery {
  filter?: string;
  role?: number;
  limit?: number;
  skip?: number;
  status?: string;
}

export interface IGetAdminData {
  id: number;
  username: string;
  name: string;
  email: string;
  phone_number: string;
  photo?: string;
  role_id: number;
  is_main_user: boolean;
  status: boolean;
  socket_id?: string;
  role_name: string;
}
export interface IGetSingleAdminQuery {
  id: number;
  status?: string;
}

export interface IGetSingleAdminData {
  id: number;
  username: string;
  name: string;
  email: string;
  gender: string;
  phone_number: string;
  photo?: string;
  role_id: number;
  is_main_user: boolean;
  status: boolean;
  socket_id?: string;
  role_name: string;
  created_at: string;
  created_by: number;
  created_by_name: string;
}

export interface IUpdateProfilePayload {
  name?: string;
  gender?: string;
  email?: string;
  password_hash?: string;
  phone_number?: string;
  photo?: string;
  role_id?: number;
  status?: boolean;
}
