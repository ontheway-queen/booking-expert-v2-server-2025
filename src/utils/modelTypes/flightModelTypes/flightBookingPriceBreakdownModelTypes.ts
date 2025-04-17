export interface IInsertFlightBookingPriceBreakdownPayload {
    flight_booking_id: number;
    type: string;
    total_passenger: number;
    base_fare: number;
    tax: number;
    total_fare: number;
}

export interface IGetFlightBookingPriceBreakdownData {
    id: number;
    flight_booking_id: number;
    type: string;
    total_passenger: number;
    base_fare: number;
    tax: number;
    total_fare: number;
}