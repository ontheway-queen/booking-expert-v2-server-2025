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
    }[];
    remove?: number[];
  }