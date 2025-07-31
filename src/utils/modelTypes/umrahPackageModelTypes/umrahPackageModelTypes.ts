export interface IInsertUmrahPackagePayload {
  title: string;
  description?: string | null;
  duration?: number | null;
  valid_till_date?: string | null;
  group_size?: number | null;
  b2c_price_per_person: number;
  b2c_discount: number;
  b2c_discount_type: 'PERCENTAGE' | 'FLAT';
  package_details: string;
  package_price_details: string;
  package_accommodation_details: string;
  slug: string;
  meta_tag: string;
  meta_description: string;
}

export interface IInsertUmrahPackageImagePayload {
  umrah_id: number;
  image: string;
}


export interface IGetPackageDetailsQuery{
    umrah_id?:number;
    slug?:string;
}


export interface IGetSinglePackageDetails{
    id:number;
    title:string;
    description:string;
    duration:number;
    valid_till_date:string | Date;
    group_size:number | null;
    status:boolean;
    b2c_price_per_person:number;
    b2c_discount:number;
    b2c_discount_type:'PERCENTAGE' | 'FLAT';
    package_details?:string;
    package_price_details?:string;
    package_accommodation_details?:string;
    slug:string;
    meta_tag:string;
    meta_description:string;
}


export interface IGetUmrahPackageImages{
    id:number;
    umrah_id:number;
    image:string;
    created_at:Date;
}



export interface IGetPackageListQuery{
    limit:number;
    skip:number;
    status?:boolean;
    title:string;
}