export interface ICreateMarkupSetReqBody {
  name: string;
  type: 'Flight' | 'Hotel';
  api: {
    api_id: number;
    airlines: string[];
    markup_domestic: number;
    markup_from_dac: number;
    markup_to_dac: number;
    markup_soto: number;
    markup_type: 'PER' | 'FLAT';
    markup_mode: 'INCREASE' | 'DECREASE';
  }[];
}

export interface IPrePayloadSetMarkup {
  markups: ISetSingleMarkupPayload[];
  set_id: number;
  api_id: number;
}

export interface ISetSingleMarkupPayload {
  airline: string;
  markup_domestic: number;
  markup_from_dac: number;
  markup_to_dac: number;
  markup_soto: number;
  markup_type: 'PER' | 'FLAT';
  markup_mode: 'INCREASE' | 'DECREASE';
}

export interface IUpdateMarkupSetReqBody {
  name?: string;
  add?: number[];
  update?: { id: number; status: boolean }[];
}

export interface IGetMarkupSetFlightApiFilter {
  airline?: string;
  status?: boolean;
}

export interface IUpdateFlightMarkupsReqBody {
  api_status?: boolean;
  add?: {
    airlines: string[];
    markup_domestic: number;
    markup_from_dac: number;
    markup_to_dac: number;
    markup_soto: number;
    markup_type: 'PER' | 'FLAT'; // PER, FLAT
    markup_mode: 'INCREASE' | 'DECREASE'; // INCREASE, DECREASE
    booking_block?: boolean;
    issue_block?: boolean;
  }[];
  update?: {
    id: 2;
    airline?: string;
    markup_domestic?: number;
    markup_from_dac?: number;
    markup_to_dac?: number;
    markup_soto?: number;
    markup_type?: 'PER' | 'FLAT'; // PER, FLAT
    markup_mode?: 'INCREASE' | 'DECREASE'; // INCREASE, DECREASE
    status?: false;
    booking_block?: boolean;
    issue_block?: boolean;
  }[];
  remove?: number[];
}

export interface IUpdateHotelMarkupsReqBody {
  name?: string;
  status?: boolean;
  book?: {
    type: 'FLAT' | 'PER';
    mode: 'INCREASE' | 'DECREASE';
    markup: number;
  };
  cancel?: {
    type: 'FLAT' | 'PER';
    mode: 'INCREASE' | 'DECREASE';
    markup: number;
  };
}

export interface ICreateHotelMarkupSetReqBody {
  name: string;
  book: {
    type: 'PER' | 'FLAT';
    mode: 'INCREASE' | 'DECREASE';
    markup: number;
  };
  cancel: {
    type: 'PER' | 'FLAT';
    mode: 'INCREASE' | 'DECREASE';
    markup: number;
  };
}
