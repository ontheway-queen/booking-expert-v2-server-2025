export interface IUpsertB2CMarkupConfigPayload {
  type: 'Flight' | 'Hotel';
  markup_set_id: number;
}

export interface IGetB2CMarkupConfigData {
  id: number;
  markup_set_id: number;
  name: string;
  type: 'Flight' | 'Hotel';
}
