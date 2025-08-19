export interface IGetVisaListQuery {
  filter: string;
  slug: string;
  country_id: number;
  status: boolean;
  limit: number;
  skip: number;
}
export interface IGetAllAgentB2CVisaApplicationQuery {
  from_date?: Date;
  to_date?:Date;
  status?: string;
  filter?: string;
  limit?: number;
  skip?: number;
}