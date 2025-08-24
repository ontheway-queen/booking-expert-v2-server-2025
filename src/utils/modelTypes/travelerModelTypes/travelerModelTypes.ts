export type SourceType =
  | 'AGENT'
  | 'SUB AGENT'
  | 'AGENT B2C'
  | 'B2C'
  | 'EXTERNAL';

export interface ITraveler {
  id: number;
  source_id: number | null;
  source_type: SourceType;
  created_by: number;
  type?: string | null;
  reference?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  contact_number?: string | null;
  date_of_birth?: Date | null;
  gender?: string | null;
  contact_email?: string | null;
  passport_number?: string | null;
  passport_expiry_date?: Date | null;
  issuing_country?: number | null;
  nationality?: number | null;
  frequent_flyer_airline?: string | null;
  frequent_flyer_number?: string | null;
  visa_file?: string | null;
  passport_file?: string | null;
  created_at: Date;
}

export interface IInsertTravelerPayload {
  source_id?: number;
  source_type: SourceType;
  created_by: number;
  type?: string;
  reference?: string;
  first_name?: string;
  last_name?: string;
  contact_number?: string;
  date_of_birth?: Date | string;
  gender?: string;
  contact_email?: string;
  passport_number?: string;
  passport_expiry_date?: Date | string;
  issuing_country?: number;
  nationality?: number;
  frequent_flyer_airline?: string;
  frequent_flyer_number?: string;
  visa_file?: string;
  passport_file?: string;
}

export interface IUpdateTravelerPayload {
  type?: string;
  reference?: string;
  first_name?: string;
  last_name?: string;
  contact_number?: string;
  date_of_birth?: Date | string;
  gender?: string;
  contact_email?: string;
  passport_number?: string;
  passport_expiry_date?: Date | string;
  issuing_country?: number;
  nationality?: number;
  frequent_flyer_airline?: string;
  frequent_flyer_number?: string;
  visa_file?: string;
  passport_file?: string;
}

export interface IGetTravelerDataFilterQuery {
  source_type: SourceType;
  source_id?: number;
  created_by?: number;
  type?: string;
  limit?: number;
  skip?: number;
}

export interface IGetSingleTravelerParams {
  source_type: SourceType;
  source_id?: number;
  created_by?: number;
  id: number;
}
