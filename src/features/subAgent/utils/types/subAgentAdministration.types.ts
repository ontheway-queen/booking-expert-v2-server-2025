export interface ICreateSubAgentRoleReqBody {
  role_name: string;
  permissions: {
    permission_id: number;
    read: boolean;
    write: boolean;
    update: boolean;
    delete: boolean;
  }[];
}

export interface IGetSubAgentRoleListReqQuery {
  name?: string;
  status?: boolean;
}

export interface IUpdateSubAgentRolePermissionsReqBody {
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

export interface IGetSubAgentListReqQuery {
  filter?: string;
  role_id?: number;
  limit?: string;
  skip?: string;
  status?: boolean;
}

export interface ICreateSubAgentReqBody {
  name: string;
  email: string;
  phone_number: string;
  role_id: number;
  password: string;
}

export interface IUpdateSubAgentReqBody {
  name?: string;
  email?: string;
  password_hash?: string;
  phone_number?: string;
  role_id?: number;
  status?: boolean;
}
