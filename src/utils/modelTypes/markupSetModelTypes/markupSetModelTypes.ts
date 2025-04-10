interface markupType {
    type: 'Flight' | 'Hotel';
}

export interface ICreateMarkupSetPayload extends markupType {
    name: string;
    created_by: number;
}


export interface IUpdateMarkupSetPayload extends markupType {
    name?: string;
    status?: boolean;
}

export interface IGetMarkupSetData extends markupType {
    id: number;
    name: string;
    status: boolean;
    created_by: number;
    created_at: Date;
}

export interface IGetMarkupListFilterQuery{
    name?: string;
    status?: boolean;
    type?: 'Flight' | 'Hotel';
    check_name?: string;
}