export interface IInsertUmrahPackagePayload {
  title: string;
  description?: string | null;
  duration?: number | null;
  valid_till_date?: string | null;
  group_size?: number | null;
  adult_price: number;
  child_price: number;
  package_details: string;
  slug: string;
  meta_tag: string;
  meta_description: string;
  umrah_for: 'AGENT' | 'B2C' | 'BOTH';
  package_price_details: string;
  package_accommodation_details: string;
  short_description: string;
  created_by: number;
  source_type: 'ADMIN' | 'AGENT';
  source_id: number;
}

export interface IInsertUmrahPackageImagePayload {
  umrah_id: number;
  image: string;
}

export interface IInsertUmrahPackageIncludeServicePayload {
  umrah_id: number;
  service_name: string;
}

export interface IGetPackageDetailsQuery {
  umrah_id?: number;
  slug?: string;
}

export interface IGetSinglePackageDetails {
  id: number;
  title: string;
  description: string;
  duration: number;
  valid_till_date: string | Date;
  group_size: number | null;
  status: boolean;
  adult_price: number;
  child_price: number;
  package_details?: string;
  package_price_details?: string;
  package_accommodation_details?: string;
  slug: string;
  meta_tag: string;
  meta_description: string;
  umrah_for: 'AGENT' | 'B2C' | 'BOTH';
  package_include: Array<string>;
  short_description: string;
}

export interface IGetUmrahPackageImages {
  id: number;
  image: string;
}

export interface IGetPackageListQuery {
  limit: number;
  skip: number;
  status?: boolean;
  title?: string;
  source_type: 'ADMIN' | 'AGENT';
  source_id: number;
}

export interface ICreateUmrahPackagePayload {
  title: string;
  description: string;
  duration: number;
  valid_till_date: string;
  group_size: number;
  status: boolean;
  adult_price: number;
  child_price: number;
  package_details: string;
  package_include: Array<string>;
  slug: string;
  meta_tag: string;
  meta_description: string;
  umrah_for: 'AGENT' | 'B2C' | 'BOTH';
  package_price_details: string;
  package_accommodation_details: string;
  short_description: string;
}
