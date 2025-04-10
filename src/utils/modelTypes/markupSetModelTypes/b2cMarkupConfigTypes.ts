export interface IUpsertB2CMarkupConfigPayload {
    name: string;
    markup_set_id: number;
}

export interface IGetB2CMarkupConfigData {
    id: number;
    markup_set_id: number;
    name: string;
}