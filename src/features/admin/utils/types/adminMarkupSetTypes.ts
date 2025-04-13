export interface ICreateMarkupSetReqBody {
    name: string;
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