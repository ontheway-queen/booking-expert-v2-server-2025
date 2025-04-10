export interface ICreateMarkupSetFlightApiPayload {
    markup_set_id: number;
    flight_api_id: number;
}

export interface IUpdateMarkupSetFlightApiPayload {
    status?: boolean;
}

export interface IGetMarkupSetFlightApiListFilterQuery {
    id:number;
    status?: boolean;
    markup_set_id?: number;
    flight_api_id?: number;
    api_name?: string;
}

export interface IGetMarkupSetFlightApiData {
    id: number;
    status: boolean;
    api_id: number;
    api_name: string;
    api_logo: string;
}