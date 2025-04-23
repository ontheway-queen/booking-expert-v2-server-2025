interface markupType {
    type: 'Flight' | 'Hotel';
}

export interface ICreateMarkupSetPayload extends markupType {
    name: string;
    created_by: number;
}


export interface IUpdateMarkupSetPayload{
    name?: string;
    status?: boolean;
    is_deleted?: true;
}

export interface IGetMarkupSetData extends markupType {
    id: number;
    name: string;
    status: boolean;
    created_by: number;
    created_at: Date;
    is_deleted: false;
}

export interface IGetMarkupListFilterQuery{
    filter?: string;
    status?: boolean;
    type?: 'Flight' | 'Hotel';
    check_name?: string;
}