export interface IInsertFlightBookingPriceBreakdownPayload {
  flight_booking_id: number;
  type: string;
  total_passenger: number;
  base_fare: number | string;
  tax: number | string;
  ait: number | string;
  discount: number | string;
  total_fare: number | string;
}

export interface IGetFlightBookingPriceBreakdownData {
  id: number;
  type: string;
  total_passenger: number;
  base_fare: number;
  tax: number;
  ait: number;
  discount: number;
  total_fare: number;
}
export interface IGetFlightBookingModifiedAmountData {
  id: number;
  flight_booking_id: number;
  markup: number;
  commission: number;
  pax_markup: number;
  agent_markup: number;
  total_fare: number;
}
