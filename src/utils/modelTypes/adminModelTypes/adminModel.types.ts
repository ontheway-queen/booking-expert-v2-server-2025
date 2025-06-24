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
  role_id?: number;
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
  photo: string | null;
  role_id: number;
  password_hash: string;
  is_main_user: boolean;
  two_fa: boolean;
  status: boolean;
  socket_id?: string;
  role_name: string;
  created_at: string;
  created_by: number;
  created_by_name: string;
}

export interface IUpdateAdminPayload {
  name?: string;
  gender?: string;
  email?: string;
  password_hash?: string;
  phone_number?: string;
  photo?: string;
  role_id?: number;
  status?: boolean;
  two_fa?: boolean;
  is_online?: boolean;
}

export interface ICheckUserAdmin {
  id: number;
  username: string;
  name: string;
  phone_number: string;
  role_id: number;
  password_hash: string;
  gender: string;
  photo: string | null;
  email: string;
  status: boolean;
  is_main_user: boolean;
  two_fa: boolean;
}

export interface ICreateAdminRolePayload {
  name: string;
  created_by: number;
  id_main_role?: boolean;
}

export interface IGetAdminRoleListQuery {
  name?: string;
  status?: boolean;
}

export interface ICheckAdminRolePayload {
  name?: string;
  id?: number;
  status?: boolean;
}

export interface IGetAdminRoleListData {
  id: number;
  name: string;
  status: boolean;
  is_main_role: boolean;
  create_date: string;
  created_by: number;
  created_by_name: string;
}

export interface IUpdateAdminRolePayload {
  name?: string;
  status?: boolean;
}

export interface IGetAdminAllPermissionsData {
  id: number;
  name: string;
}

export interface IGetSingleAdminRoleWithPermissionsData {
  role_id: number;
  role_name: string;
  status: boolean;
  is_main_role: boolean;
  permissions: {
    permission_id: number;
    permission_name: string;
    read: boolean;
    write: boolean;
    update: boolean;
    delete: boolean;
  }[];
}

export interface IInsertAdminRolePermissionPayload {
  role_id: number;
  permission_id: number;
  read?: boolean;
  write?: boolean;
  update?: boolean;
  delete?: boolean;
}

export interface ICreateAdminAuditTrailPayload {
  created_by: number;
  type: 'CREATE' | 'GET' | 'UPDATE' | 'DELETE';
  details: string;
  payload?: object | string;
}

export interface IGetAdminAuditTrailQuery {
  type?: 'CREATE' | 'GET' | 'UPDATE' | 'DELETE';
  created_by?: number;
  limit?: number;
  skip?: number;
  from_date?: string;
  to_date?: string;
}
