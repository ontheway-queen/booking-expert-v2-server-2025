export interface ICreateAgentB2CUserPayload {
  username: string;
  name: string;
  agency_id: number;
  gender: string;
  email: string;
  password_hash: string;
  phone_number?: string;
  photo?: string;
}

export interface IUpdateAgencyB2CUserPayload {
  name?: string;
  gender?: string;
  email?: string;
  password_hash?: string;
  phone_number?: string;
  photo?: string;
  socket_id?: string;
  status?: boolean;
  is_online?: boolean;
}

export interface IGetAgencyB2CUserListQuery {
  filter?: string;
  agency_id: number;
  status?: boolean;
  limit?: string;
  skip?: string;
}

export interface IGetAgencyB2CUserList {
  id: number;
  username: string;
  name: string;
  email: string;
  status: boolean;
  photo?: string;
}

export interface IGetAgentB2CSingleUser {
  id: number;
  username: string;
  name: string;
  gender: string;
  phone_number: string;
  email: string;
  status: boolean;
  photo?: string;
  created_at: string;
}

export interface ICheckAgentB2CUserData {
  id: number;
  username: string;
  name: string;
  email: string;
  password_hash: string;
  status: boolean;
  gender: string;
  phone_number: string;
  photo: string;
}
