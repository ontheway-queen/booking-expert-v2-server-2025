export interface IInsertFlightBookingSegmentPayload {
    flight_booking_id: number;
    flight_number: string;
    airline: string;
    airline_code: string;
    airline_logo: string;
    origin: string;
    destination: string;
    class: string;
    baggage: string;
    departure_date: Date|string;
    departure_time: string;
    arrival_date: Date|string;
    arrival_time: string;
    aircraft: string | null;
    duration: string;
    departure_terminal?: string | null;
    arrival_terminal?: string | null;
}

export interface IGetFlightBookingSegmentData {
    id: number;
    flight_booking_id: number;
    flight_number: string;
    airline: string;
    airline_code: string;
    airline_logo: string;
    origin: string;
    destination: string;
    class: string;
    baggage: string;
    departure_date: Date;
    departure_time: string;
    arrival_date: Date;
    arrival_time: string;
    aircraft: string | null;
    duration: string;
    departure_terminal: string | null;
    arrival_terminal: string | null;
}