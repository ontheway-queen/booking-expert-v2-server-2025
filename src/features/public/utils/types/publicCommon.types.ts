import { Knex } from 'knex';

// Db or Transaction connection types
export type TDB = Knex | Knex.Transaction;

export interface ITokenParseAgency {
  agency_id: number;
  agency_name: string;
  agency_email: string;
  user_id: number;
  user_email: string;
  username: string;
  user_full_name: string;
}

export interface ITokenParseUser {
  user_id: number;
  username: string;
  user_full_name: string;
  user_email: string;
}

export interface ITokenParseAdmin {
  user_id: number;
  username: string;
  user_full_name: string;
  user_email: string;
}

export interface ITokenParseAgencyB2CUser {
  agency_id: number;
  agency_name: string;
  agency_email: string;
  user_id: number;
  user_email: string;
  username: string;
  user_full_name: string;
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
