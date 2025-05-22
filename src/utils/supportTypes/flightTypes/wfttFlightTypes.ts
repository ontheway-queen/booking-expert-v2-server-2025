export interface IWFTTFlightSearchResBody {
  success: boolean;
  message: string;
  data: IWFTTFLightSearchData;
}

interface IWFTTFLightSearchData {
  search_id: string;
  journey_type: "1" | "2" | "3";
  leg_descriptions: {
    departureDate: string;
    departureLocation: string;
    arrivalLocation: string;
  }[];
  total: number
  results: IWFTTFlightSearchResults[];
}

export interface IWFTTFlightRevalidateRequestBody {
  search_id: string;
  flight_id: string;
}

export interface IWFTTFlightRevalidateResponse {
  success: boolean;
  message: string;
  data: IWFTTFlightSearchResults;
}

export interface IWFTTFlightSearchResults {
  flight_id: string;
  api_search_id: string;
  booking_block: boolean;
  direct_ticket_issue: boolean;
  isDomesticFlight: boolean;
  journey_type: "1" | "2" | "3";
  api: string;
  fare: IWFTTFormattedFare;
  refundable: boolean;
  carrier_code: string;
  carrier_name: string;
  carrier_logo: string;
  ticket_last_date: string;
  ticket_last_time: string;
  flights: IWFTTFormattedFlight[];
  passengers: IWFTTFormattedPassenger[];
  availability: IWFTTMultiFlightAvailability[];
}

interface IWFTTFormattedFare {
  base_fare: number;
  total_tax: number;
  discount: number;
  convenience_fee: number;
  total_price: number;
  payable: number;
  ait: number;
  nz_dis?: number;
}

interface IWFTTFormattedFlight {
  id: number;
  elapsed_time?: number;
  stoppage?: number;
  options: IWFTTFormattedFlightOption[];
  layover_time: number[];
}

interface IWFTTFormattedFlightOption {
  segment_ref?: string;
  id: number;
  elapsedTime: number;
  total_miles_flown?: number | null;
  departure: IWFTTFormattedDeparture;
  arrival: IWFTTFormattedArrival;
  carrier: IWFTTFormattedCarrier;
}

export interface IWFTTFormattedDeparture {
  airport: string;
  city: string;
  airport_code: string;
  city_code: string;
  country: string;
  terminal: string | undefined;
  time: string;
  date: string | Date;
  date_adjustment: number | undefined;
}

export interface IWFTTFormattedArrival {
  airport: string;
  airport_code: string;
  city_code: string;
  city: string;
  country: string;
  time: string;
  terminal: string | undefined;
  date: string | Date;
  date_adjustment: number | undefined;
}

export interface IWFTTFormattedCarrier {
  carrier_marketing_code: string;
  carrier_marketing_airline: string;
  carrier_marketing_logo: string;
  carrier_marketing_flight_number: string;
  carrier_operating_code: string;
  carrier_operating_airline: string;
  carrier_operating_logo: string;
  carrier_operating_flight_number: string;
  carrier_aircraft_code: string;
  carrier_aircraft_name: string;
}

interface IWFTTFormattedPassenger {
  type: string;
  number: number;
  fare: {
    total_fare: number;
    tax: number;
    base_fare: number;
  };
}

interface IWFTTMultiFlightAvailability {
  from_airport: string;
  to_airport: string;
  segments: IWFTTMultiFlightDataAvailabilitySegment[];
}

interface IWFTTMultiFlightDataAvailabilityPassenger {
  type: string;
  count: number;
  meal_type: string | undefined;
  meal_code: string | undefined;
  cabin_code: string | undefined;
  cabin_type: string | undefined;
  booking_code: string | undefined;
  available_seat: number | undefined;
  available_break: boolean | undefined;
  available_fare_break: boolean | undefined;
  baggage_unit: string | null;
  baggage_count: string | null;
}

interface IWFTTMultiFlightDataAvailabilitySegment {
  name: string;
  passenger: IWFTTMultiFlightDataAvailabilityPassenger[];
}
