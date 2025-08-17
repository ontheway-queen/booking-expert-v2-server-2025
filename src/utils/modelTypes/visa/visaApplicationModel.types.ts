export interface ICreateVisaApplicationPayload {
  application_ref: string;
  source_type: 'AGENT' | 'SUB AGENT' | 'B2C' | 'EXTERNAL' | 'AGENT B2C';
  source_id: number;
  user_id: number;
  visa_id: number;
  from_date: string;
  to_date: string;
  traveler: number;
  visa_fee: number;
  processing_fee: number;
  discount?: number;
  extra_charge?: number;
  payable: number;
  contact_email: string;
  contact_number: string;
  whatsapp_number: string | null;
  nationality: string | null;
  residence: string | null;
  application_date: Date;
}

export interface ICreateVisaApplicationTracking {
  application_id: number;
  details: string;
}

export interface ICreateVisaApplicationTraveler {
  application_id: number;
  title: string;
  type: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  passport_number: string;
  passport_expiry_date: string;
  passport_type: string;
  city: string | null;
  country_id: number | null;
  address: string | null;
  required_fields: string;
}
