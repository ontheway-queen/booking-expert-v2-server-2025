type travelerType = "ADT" | "C02" | "C03" | "C04" | "C05" | "C06" | "C07" | "C08" | "C09" | "C10" | "C11" | "INF";
type travelerReference = "Mr" | "Ms" | "Mrs" | "MSTR" | "Miss";
type travelerGender = "Male" | "Female";

export interface IInsertFlightBookingTravelerPayload {
    flight_booking_id: number;
    type: travelerType;
    reference: travelerReference;
    first_name: string;
    last_name: string;
    phone?: string;
    date_of_birth: Date | string;
    gender: travelerGender;
    email?: string;
    passport_number?: string;
    passport_expiry_date?: Date | string;
    ticket_number?: string;
    issuing_country?: number;
    nationality?: number;
    frequent_flyer_airline?: string;
    frequent_flyer_number?: string;
    visa_file?: string;
    passport_file?: string;
}

export interface IGetFlightBookingTravelerData {
    id: number;
    flight_booking_id: number;
    type: travelerType;
    reference: travelerReference;
    first_name: string;
    last_name: string;
    phone: number | null;
    date_of_birth: Date;
    gender: travelerGender;
    email: string | null;
    passport_number: string | null;
    passport_expiry_date: Date | null;
    ticket_number: string | null;
    issuing_country: number | null;
    nationality: number | null;
    frequent_flyer_airline: string | null;
    frequent_flyer_number: string | null;
    visa_file: string | null;
    passport_file: string | null;
}

export interface IUpdateFlightBookingTravelerPayload {
    ticket_number: string;
}