export interface IGetVisaListQuery {
  filter: string;
  slug: string;
  country_id: number;
  status: boolean;
  limit: number;
  skip: number;
}
