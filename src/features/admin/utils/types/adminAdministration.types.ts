export interface ICreateAdminRoleReqBody {
  role_name: string;
  permissions: {
    id: number;
    read: boolean;
    write: boolean;
    update: boolean;
    delete: boolean;
  }[];
}

export interface IGetAdminRoleListReqQuery {
  name?: string;
  status?: boolean;
}

export interface IUpdateAdminRolePermissionsReqBody {
  role_name?: string;
  status?: boolean;
  permissions?: {
    id: number;
    read: boolean;
    write: boolean;
    update: boolean;
    delete: boolean;
  }[];
}

export interface IGetAdminListReqQuery {
  filter?: string;
  role_id?: number;
  limit?: number;
  skip?: number;
  status?: string;
}

export interface ICreateAdminReqBody {
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone_number: string;
  role_id: number;
  password: string;
}

export interface IUpdateAdminReqBody {
  name?: string;
  gender?: string;
  email?: string;
  password_hash?: string;
  phone_number?: string;
  role_id?: number;
  status?: boolean;
}
