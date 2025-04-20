import { ERROR_LEVEL_CRITICAL, ERROR_LEVEL_DEBUG, ERROR_LEVEL_ERROR, ERROR_LEVEL_INFO, ERROR_LEVEL_WARNING, SOURCE_ADMIN, SOURCE_AGENT, SOURCE_AGENT_B2C, SOURCE_B2C, SOURCE_EXTERNAL } from "../../miscellaneous/constants";

export interface IInsertErrorLogsPayload {
    level: | typeof ERROR_LEVEL_DEBUG
    | typeof ERROR_LEVEL_INFO
    | typeof ERROR_LEVEL_WARNING
    | typeof ERROR_LEVEL_ERROR
    | typeof ERROR_LEVEL_CRITICAL;
    message: string;
    stack_trace?: string
    source?: | typeof SOURCE_AGENT
    | typeof SOURCE_AGENT_B2C
    | typeof SOURCE_B2C
    | typeof SOURCE_EXTERNAL
    | typeof SOURCE_ADMIN;
    user_id?: number;
    url: string;
    http_method: string;
    metadata?: {};
}

export interface IGetErrorLogsList {
    id: number;
    level: | typeof ERROR_LEVEL_DEBUG
    | typeof ERROR_LEVEL_INFO
    | typeof ERROR_LEVEL_WARNING
    | typeof ERROR_LEVEL_ERROR
    | typeof ERROR_LEVEL_CRITICAL;
    message: string;
    stack_trace: string | null;
    source: | typeof SOURCE_AGENT
    | typeof SOURCE_AGENT_B2C
    | typeof SOURCE_B2C
    | typeof SOURCE_EXTERNAL
    | typeof SOURCE_ADMIN
    | null;
    user_id: number | null;
    url: string;
    http_method: string;
    metadata: {} | null;
    created_at: Date;
}

export interface IGetErrorLogsListFilterQuery {
    limit?: number;
    skip?: number;
    level?: string;
    search?: string;
}