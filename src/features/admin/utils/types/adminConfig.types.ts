import {
  SLUG_TYPE_BLOG,
  SLUG_TYPE_HOLIDAY,
  SLUG_TYPE_UMRAH,
} from '../../../../utils/miscellaneous/constants';

export interface ICheckSlug {
  slug: string;
  type:
    | typeof SLUG_TYPE_HOLIDAY
    | typeof SLUG_TYPE_UMRAH
    | typeof SLUG_TYPE_BLOG;
}

export interface ICreateAirportReqBody {
  country_id: number;
  name: string;
  iata_code: string;
  city: number;
}

export interface IUpdateAirportReqBody {
  country_id?: number;
  name?: string;
  iata_code?: string;
  city?: number;
}

export interface ICreateAirlinesReqBody {
  code: string;
  name: string;
}
export interface IUpdateAirlinesReqBody {
  code?: string;
  name?: string;
}
