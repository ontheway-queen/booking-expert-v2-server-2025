export interface IVisaApplicationPayload {
  from_date: string;
  to_date: string;
  traveler: number;
  contact_email: string;
  contact_number: string;
  whatsapp_number: string;
  nationality: string;
  residence: string;
  passengers:IVisaApplicationPassengerPayload[];
}

interface IVisaApplicationPassengerPayload {
  key:number;
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
}
