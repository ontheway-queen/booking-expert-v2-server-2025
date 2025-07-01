export interface ICreateAgentRoleReqBody {
  role_name: string;
  permissions: {
    permission_id: number;
    read: boolean;
    write: boolean;
    update: boolean;
    delete: boolean;
  }[];
}

export interface IGetAgentRoleListReqQuery {
  name?: string;
  status?: boolean;
}

export interface IUpdateAgentRolePermissionsReqBody {
  role_name?: string;
  status?: boolean;
  permissions?: {
    permission_id: number;
    read: boolean;
    write: boolean;
    update: boolean;
    delete: boolean;
  }[];
}

export interface IGetAgentListReqQuery {
  filter?: string;
  role_id?: number;
  limit?: string;
  skip?: string;
  status?: boolean;
}

export interface ICreateAgentReqBody {
  name: string;
  email: string;
  phone_number: string;
  role_id: number;
  password: string;
}

export interface IUpdateAgentReqBody {
  name?: string;
  email?: string;
  password_hash?: string;
  phone_number?: string;
  role_id?: number;
  status?: boolean;
}
