export interface IInsertFlightBookingTrackingPayload {
    flight_booking_id: number;
    description: string;
}

export interface IGetFlightBookingTrackingData {
    id: number;
    flight_booking_id: number;
    description: string;
    created_at: Date;
}