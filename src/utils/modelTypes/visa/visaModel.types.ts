interface IVisaType {
  type: 'Student' | 'Government Delegates' | 'Business' | 'Tourist' | 'Investor' | 'Work';
}

export interface ICreateVisaPayload {
  country_id?: number;
  agency_id?: number;
  title: string;
  visa_for: 'AGENT' | 'B2C' | 'AGENT B2C';
  visa_fee: number;
  processing_fee: number;
  max_validity: number;
  created_by: number;
  stay_validity: number;
  visa_type_id: IVisaType;
  visa_mode_id: string;
  description?: string;
  documents_details?: string;
  required_fields?: string;
  image: string;
  meta_tag: string;
  meta_description: string;
  source_id: number;
  source_type: string;
  slug: string;
}

export interface IUpdateVisaPayload {
  country_id?: number;
  title?: string;
  visa_for?: 'AGENT' | 'B2C' | 'BOTH';
  visa_fee?: number;
  processing_fee?: number;
  max_validity?: number;
  stay_validity?: number;
  visa_type_id?: IVisaType;
  visa_mode_id?: string;
  description?: string;
  documents_details?: string;
  required_fields?: string;
  status?: boolean;
  is_deleted?: boolean;
  image?: string;
  meta_tag?: string;
  meta_description?: string;
  slug?: string;
}

export interface ICheckVisaQuery {
  slug?: string;
  id?: number;
  country_id?: number;
  source_id?: number;
  status?: boolean;
  is_deleted: boolean;
}

export interface IGetVisaListQuery {
  filter?: string;
  country_id?: number;
  source_id: number;
  source_type: string;
  status?: boolean;
  is_deleted: boolean;
  limit: number;
  skip: number;
}

export interface ICheckVisaData {
  id: number;
  country_id: number;
  visa_fee: number;
  processing_fee: number;
  max_validity: number;
  stay_validity: number;
  created_by: number;
  visa_type_id: string | null;
  visa_mode_id: string | null;
  description: string | null;
  documents_details: string | null;
  status: boolean;
  created_at: string; // or `Date` if you parse it
  image: string | null;
  required_fields: string | null;
  title: string | null;
  slug: string | null;
  meta_tag: string | null;
  meta_description: string | null;
  visa_for: string | null;
  agency_id: number | null;
  is_deleted: boolean;
  source_id: number;
  source_type: string;
}

export interface IGetVisaListData {
  id: number;
  country_name: string;
  title: string;
  visa_type: string;
  visa_mode: string;
  max_validity: number;
  image: string;
}

export interface IGetSingleVisa {
  id?: number;
  slug?: string;
  is_deleted: boolean;
  status?: boolean;
  source_id: number;
  source_type: string;
}

export interface IGetSingleVisaData {
  id: number;
  title: string;
  slug: string;
  description?: string;
  image: string;
  status: boolean;
  country_id: number;
  visa_type_id: number;
  visa_mode_id: number;
  visa_fee: number;
  processing_fee: number;
  max_validity: number;
  stay_validity: number;
  documents_details?: string;
  required_fields?: IVisaRequiredField;
  meta_title: string;
  meta_description: string;
  visa_for: string;
}

interface IVisaRequiredField {
  passport?: boolean;
  nid?: boolean;
  birth_certificate?: boolean;
  marriage_certificate?: boolean;
  bank_statement?: boolean;
}

export interface IGetAgentB2CVisaListQuery {
  country_id: number;
  visa_type_id:number;
  source_id:number;
  is_deleted: boolean;
  status: boolean;
}


export interface IGetAgentB2CSingleVisaQuery{
  is_deleted: boolean;
  source_id: number;
  slug: string;
  status:Boolean
}


export interface IGetAgentB2CSingleVisaData{
  id:number;
  country_name:string,
  title:string,
  visa_fee:number,
  processing_fee:number,
  max_validity:number,
  stay_validity:number,
  visa_type:string,
  visa_mode:string,
  description:string,
  documents_details:string,
  required_fields:string,
  image:string,
  meta_title:string,
  meta_description:string
}


export interface IGetAllVisaCreatedCountryQuery{
  is_deleted: boolean;
  source_id: number;
  source_type: string;
  status: boolean;
  visa_for: string;
}