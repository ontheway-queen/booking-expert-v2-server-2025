interface IMarkupTypes {
    markup_type: 'PER' | 'FLAT';
    markup_value: 'INCREASE' | 'DECREASE';
}


export interface ICreateFlightMarkupsPayload extends IMarkupTypes {
    markup_set_flight_api_id: number;
    airline: string;
    markup_domestic?: number;
    markup_from_dac?: number;
    markup_to_dac?: number;
    markup_soto?: number;
    created_by: number;
}

export interface IUpdateFlightMarkupsPayload extends IMarkupTypes {
    airline?: string;
    markup_domestic?: number;
    markup_from_dac?: number;
    markup_to_dac?: number;
    markup_soto?: number;
    status?: boolean;
    updated_by: number;
    updated_at: Date;
}

export interface IGetFlightMarkupsData extends IMarkupTypes {
    key: number;
    airline: string;
    airline_name: string;
    airline_logo: string;
    markup_domestic: number;
    markup_from_dac: number;
    markup_to_dac: number;
    markup_soto: number;
    status: boolean;
    created_by: number;
    updated_by: number | null;
    last_updated_at: Date | null;
    markup_set_flight_api_id: number;
    api_name: string;
    api_logo: string | null;
}

export interface IGetFlightMarkupsListFilterQuery {
    airline?: string;
    markup_set_flight_api_id?: number;
    status?: boolean;
    api_status?: boolean;
    limit?: number;
    skip?: number;
}

export interface IGetApiActiveAirlinesData{
    Code: string;
}