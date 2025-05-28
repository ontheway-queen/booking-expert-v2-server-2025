type markup_type = 'PER' | 'FLAT';
type markup_mode = 'INCREASE' | 'DECREASE';

export interface ICreateSubAgentMarkupPayload {
  agency_id: number;
  flight_markup_type: markup_type;
  hotel_markup_type: markup_type;
  flight_markup_mode: markup_mode;
  hotel_markup_mode: markup_mode;
  flight_markup: number;
  hotel_markup: number;
}

export interface IUpdateSubAgencyMarkupPayload {
  flight_markup_type?: markup_type;
  hotel_markup_type?: markup_type;
  flight_markup_mode?: markup_mode;
  hotel_markup_mode?: markup_mode;
  flight_markup?: number;
  hotel_markup?: number;
}

export interface IGetSubAgencyMarkupData {
  agency_id: number;
  flight_markup_type: markup_type;
  hotel_markup_type: markup_type;
  flight_markup_mode: markup_mode;
  hotel_markup_mode: markup_mode;
  flight_markup: number;
  hotel_markup: number;
}
