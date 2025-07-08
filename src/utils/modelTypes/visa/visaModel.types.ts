interface IVisaType {
  type:
    | 'Student'
    | 'Government Delegates'
    | 'Business'
    | 'Tourist'
    | 'Investor'
    | 'Work';
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
  visa_type: IVisaType;
  visa_mode?: string;
  description?: string;
  documents_details?: string;
  required_fields?: string;
  image?: string;
  meta_tag?: string;
  meta_description?: string;
}

export interface IUpdateVisaPayload {
  country_id?: number;
  title?: string;
  visa_for?: 'AGENT' | 'B2C' | 'AGENT B2C';
  visa_fee?: number;
  processing_fee?: number;
  max_validity?: number;
  stay_validity?: number;
  visa_type?: IVisaType;
  visa_mode?: string;
  description?: string;
  documents_details?: string;
  required_fields?: string;
  status?: boolean;
  is_deleted?: boolean;
  image?: string;
  meta_tag?: string;
  meta_description?: string;
}

export interface ICheckVisaQuery {
  slug?: string;
  id?: number;
  country_id?: number;
  agency_id?: number;
  status?: boolean;
  is_deleted: boolean;
}

export interface ICheckVisaData {
  id: number;
  country_id: number;
  visa_fee: number;
  processing_fee: number;
  max_validity: number;
  stay_validity: number;
  created_by: number;
  visa_type: string | null;
  visa_mode: string | null;
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
}
