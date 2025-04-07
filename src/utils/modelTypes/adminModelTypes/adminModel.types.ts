export interface IAdminCreatePayload {
  username: string;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  password_hash: string;
  phone_number: string;
  photo?: string;
  role_id: number;
  created_by: number;
}
