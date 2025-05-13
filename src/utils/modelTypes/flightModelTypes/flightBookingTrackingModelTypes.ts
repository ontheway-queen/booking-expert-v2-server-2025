export interface IInsertFlightBookingTrackingPayload {
    flight_booking_id: number;
    description: string;
}

export interface IGetFlightBookingTrackingData {
    id: number;
    description: string;
    created_at: Date;
}

export interface IGetFlightBookingTrackingListFilterQuery {
    flight_booking_id: number;
    limit?: number;
    skip?: number;
}