import { SOURCE_AGENT, SOURCE_B2C } from "../../miscellaneous/constants";

export interface ICreateADMManagementPayload {
    ref_no: string;
    booking_id: number;
    source_type: typeof SOURCE_AGENT | typeof SOURCE_B2C;
    source_id: number | null;
    amount: number;
    note?: string;
    created_by: number;
}

export interface IUpdateADMManagementPayload {
    amount?: number;
    note?: string;
}

export interface IGetADMManagementData {
    id: number;
    ref_no: string;
    booking_id: number;
    booking_ref: string;
    source_type: typeof SOURCE_AGENT | typeof SOURCE_B2C;
    source_id: number;
    agent_name: string;
    agent_logo: string;
    amount: number;
    note: string;
    created_by: string;
}

export interface IGetADMManagementQueryFilter {
    filter?: string;
    from_date?: Date;
    to_date?: Date;
    limit?: number;
    skip?: number;
    adm_for: typeof SOURCE_AGENT | typeof SOURCE_B2C;
    agency_id?: number;
}

export interface IGetSingleADMManagementParams {
    id: number;
    adm_for: typeof SOURCE_AGENT | typeof SOURCE_B2C;
}