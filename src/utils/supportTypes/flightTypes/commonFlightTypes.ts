export interface IOriginDestinationInformationPayload {
  RPH: string;
  DepartureDateTime: string;
  OriginLocation: {
    LocationCode: string;
  };
  DestinationLocation: {
    LocationCode: string;
  };
  TPA_Extensions: {
    CabinPref: {
      Cabin: '1' | '2' | '3' | '4'; //1 = Economy, 2=Premium economy, 3=business, 4=first
      PreferLevel: string;
    };
  };
}

export interface IPassengerTypeQuantityPayload {
  Code: string;
  Quantity: number;
}

export interface IAirlineCodePayload {
  Code: string;
}

export interface IFlightSearchReqBody {
  JourneyType: '1' | '2' | '3';
  airline_code?: IAirlineCodePayload[];
  OriginDestinationInformation: IOriginDestinationInformationPayload[];
  PassengerTypeQuantity: IPassengerTypeQuantityPayload[];
}

export interface IFlightAvailability {
  from_airport: string;
  to_airport: string;
  segments: IFlightDataAvailabilitySegment[];
}

export interface IFlightDataAvailabilityPassenger {
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

export interface IFlightDataAvailabilitySegment {
  name: string;
  passenger: IFlightDataAvailabilityPassenger[];
}

// Common types for response after format==============

export interface ILegDescription {
  departureDate: string;
  departureLocation: string;
  arrivalLocation: string;
}
export interface IFormattedFlightItinerary {
  journey_type: '1' | '2' | '3';
  leg_description: ILegDescription[];
  domestic_flight: boolean;
  price_changed: boolean;
  direct_ticket_issue: boolean;
  flight_id: string;
  api_search_id: string;
  booking_block: boolean;
  api: string;
  api_name: string;
  fare: IFormattedFare;
  carrier_code: string;
  carrier_name: string;
  carrier_logo: string;
  ticket_last_date: string;
  ticket_last_time: string;
  refundable: boolean;
  flights: IFormattedFlight[];
  passengers: IFormattedPassenger[];
  availability: IFlightAvailability[];
  partial_payment?: {
    partial_payment: boolean;
    payment_percentage: number | string;
    travel_date_from_now: string;
  };
  modifiedFare?: {
    markup: number;
    commission: number;
    pax_markup: number;
    agent_markup: number;
    agent_discount: number;
  };
}

export interface IFormattedFlight {
  id: number | string;
  elapsed_time?: number;
  stoppage?: number;
  options: IFormattedFlightOption[];
  layover_time: number[];
}

export interface IFormattedFlightOption {
  segment_ref?: string;
  id: number | string;
  elapsedTime: number;
  total_miles_flown?: number | null;
  departure: IFormattedDeparture;
  arrival: IFormattedArrival;
  carrier: IFormattedCarrier;
}

export interface IFormattedDeparture {
  airport: string;
  city: string;
  airport_code: string;
  city_code: string;
  country: string;
  terminal: string | undefined;
  time: string;
  date: string | Date;
  date_adjustment?: number | undefined;
}

export interface IFormattedArrival {
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

export interface IFormattedCarrier {
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

export interface IFormattedFare {
  base_fare: number | string;
  total_tax: number | string;
  ait: number | string;
  discount: number | string;
  payable: number | string;
  vendor_price?: {
    base_fare: number;
    tax: number;
    ait: number;
    charge: number;
    discount: number;
    gross_fare: number;
    net_fare: number;
  };
}

export interface IFormattedPassenger {
  type: string;
  number: number;
  per_pax_fare: {
    total_fare: string;
    tax: string;
    ait: string;
    discount: string;
    base_fare: string;
  };
}
