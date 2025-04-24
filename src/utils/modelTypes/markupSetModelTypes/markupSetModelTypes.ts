interface markupType {
  type: 'Flight' | 'Hotel';
}

export interface ICreateMarkupSetPayload extends markupType {
  name: string;
  created_by: number;
}

export interface IUpdateMarkupSetPayload {
  name?: string;
  status?: boolean;
  is_deleted?: true;
  updated_by?: number;
  last_updated?: Date;
}

export interface IGetMarkupSetData extends markupType {
  id: number;
  name: string;
  status: boolean;
  created_by: number;
  updated_by: number | null;
  created_by_name: string;
  updated_by_name: string | null;
  created_at: string;
  last_updated: string | null;
  is_deleted: boolean;
}

export interface IGetMarkupListFilterQuery {
  filter?: string;
  status?: boolean;
  type?: 'Flight' | 'Hotel';
  check_name?: string;
}
