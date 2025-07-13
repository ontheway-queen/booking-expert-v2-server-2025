export interface ICreateAgencyUserPayload {
  agency_id: number;
  username: string;
  name: string;
  email: string;
  hashed_password: string;
  phone_number: string;
  photo?: string;
  created_by?: number;
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
  is_online?: boolean;
  socket_id?: string;
}

export interface IGetAgencyUserListQuery {
  agency_id: number;
  filter?: string;
  role_id?: number;
  status?: boolean;
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

export interface IGetSingleAgencyUserData {
  id: number;
  email: string;
  name: string;
  photo: string;
  phone_number: string;
  username: string;
  hashed_password: string;
  two_fa: boolean;
  role_id: number;
  role_name: string;
  status: boolean;
  is_main_user: boolean;
}

export interface ICheckAgencyUserData {
  id: number;
  agency_id: number;
  ref_id: number | null;
  email: string;
  name: string;
  photo: string;
  phone_number: string;
  agency_phone_number: string;
  username: string;
  hashed_password: string;
  agency_name: string;
  agency_email: string;
  agency_logo: string;
  two_fa: boolean;
  role_id: number;
  ref_agent_id: number;
  agency_type: 'Agent' | 'Sub Agent';
  status: boolean;
  agency_status: 'Pending' | 'Active' | 'Inactive' | 'Rejected' | 'Incomplete';
  agent_no: string;
  allow_api: boolean;
  is_main_user: boolean;
  white_label: boolean;
  civil_aviation: string | null;
  trade_license: string | null;
  national_id: string | null;
  kam_id: number | null;
  address: string;
}

export interface ICreateAgencyRolePayload {
  name: string;
  is_main_role?: boolean;
  agency_id: number;
  created_by?: number;
}

export interface IGetAllAgencyPermissionsData {
  id: number;
  name: string;
}

export interface IGetAgencyRoleListQuery {
  name?: string;
  status?: boolean;
  agency_id: number;
}

export interface IGetAgencyRoleListData {
  id: number;
  name: string;
  status: boolean;
  is_main_role: boolean;
}

export interface IUpdateAgencyRolePayload {
  name?: string;
  status?: boolean;
}

export interface IGetAllPermissionsData {
  id: number;
  name: string;
  created_by: string;
  created_at: string;
}

export interface IGetSingleAgencyRoleWithPermissionsData {
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

export interface IInsertAgencyRolePermissionPayload {
  role_id: number;
  permission_id: number;
  agency_id: number;
  read?: boolean;
  write?: boolean;
  update?: boolean;
  delete?: boolean;
}

export interface ICheckAgencyRolePayload {
  id?: number;
  agency_id: number;
  name?: string;
  status?: boolean;
}

export interface ICheckAgencyRoleData {
  id: number;
  name: string;
  is_main_role: boolean;
  status: boolean;
}
