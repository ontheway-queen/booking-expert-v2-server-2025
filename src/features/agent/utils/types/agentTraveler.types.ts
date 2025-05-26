export interface ICreateAgentTravelerReqBody {
    type: string;
    reference: string;
    first_name: string;
    last_name: string;
    contact_number?: string;
    date_of_birth: Date;
    gender: "Male" | "Female" | "Other";
    contact_email?: string;
    passport_number?: string;
    passport_expiry_date: Date;
    issuing_country: number;
    nationality: number;
    frequent_flyer_airline?: string;
    frequent_flyer_number?: string;
    visa_file?: string;
    passport_file?: string;
}