import { Knex } from 'knex';

// Db or Transaction connection types
export type TDB = Knex | Knex.Transaction;

export interface ITokenParseAgencyUser {
  agency_id: number;
  ref_id: number | null;
  agency_name: string;
  agency_email: string;
  user_id: number;
  photo: string | null;
  user_email: string;
  username: string;
  name: string;
  phone_number: string | null;
  is_main_user: boolean;
  address: string;
  agency_logo: string;
}

export interface ITokenParseUser {
  user_id: number;
  username: string;
  name: string;
  photo: string | null;
  user_email: string;
  phone_number: string | null;
}

export interface ITokenParseAdmin {
  user_id: number;
  username: string;
  name: string;
  photo: string | null;
  user_email: string;
  is_main_user: boolean;
  phone_number: string | null;
}

export interface ITokenParseAgencyB2CUser {
  agency_id: number;
  agency_name: string;
  agency_email: string;
  agency_logo: string;
  agency_address: string;
  agency_number: string;
  user_id: number;
  photo: string | null;
  user_email: string;
  username: string;
  name: string;
  phone_number: string | null;
}

export interface ITokenParseAgencyB2CWhiteLabel {
  agency_id: number;
  flight: boolean;
  hotel: boolean;
  visa: boolean;
  holiday: boolean;
  umrah: boolean;
  group_fare: boolean;
  blog: boolean;
}

export interface IValidateAPIAgencyData {
  agency_id: number;
  agency_name: string;
  agency_email: string;
}
export interface IValidateAPIExternalData {
  external_id: number;
  external_name: string;
  external_email: string;
}
