export interface IInsertHotelMarkupPayload {
  set_id: number;
  markup: number;
  type: 'PER' | 'FLAT';
  mode: 'INCREASE' | 'DECREASE';
  set_for: 'Book' | 'Cancel';
}

export interface IGetHotelMarkupQuery {
  set_id: number;
  set_for: 'Book' | 'Cancel' | 'Both';
  status?: boolean;
}

export interface IGetHotelMarkupData {
  id: number;
  set_id: number;
  set_name: string;
  markup: string;
  set_status: boolean;
  type: 'PER' | 'FLAT';
  mode: 'INCREASE' | 'DECREASE';
  status: boolean;
  set_for: 'Book' | 'Cancel';
}

export interface IUpdateHotelMarkupPayload {
  markup: number;
  type?: 'PER' | 'FLAT';
  mode?: 'INCREASE' | 'DECREASE';
}
