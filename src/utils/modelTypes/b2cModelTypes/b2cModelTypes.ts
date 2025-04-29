export interface ICreateB2CUserPayload {
  username: string;
  name: string;
  gender: string;
  email: string;
  password_hash: string;
  phone_number?: string;
  photo?: string;
}

export interface IUpdateB2CUserPayload {
  name?: string;
  gender?: string;
  email?: string;
  password_hash?: string;
  phone_number?: string;
  photo?: string;
  socket_id?: string;
  two_fa?: boolean;
  is_online?: boolean;
}

export interface IGetB2CUserListQuery {
  filter?: string;
  status?: boolean;
  limit?: string;
  skip?: string;
}

export interface IGetB2CUserList {
  id: number;
  username: string;
  name: string;
  email: string;
  status: boolean;
  photo?: string;
}

export interface IGetB2CSingleUser {
  id: number;
  username: string;
  name: string;
  gender: string;
  phone_number: string;
  email: string;
  status: boolean;
  photo?: string;
  created_at: string;
  two_fa: boolean;
}

export interface ICheckB2CUserData {
  id: number;
  username: string;
  name: string;
  email: string;
  password_hash: string;
  status: boolean;
  gender: string;
  phone_number: string;
  photo: string;
  two_fa: boolean;
}
