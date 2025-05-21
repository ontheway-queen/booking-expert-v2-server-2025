export interface ICreateMoneyReceiptPayload {
    mr_number: string;
    invoice_id: number;
    user_id: number;
    amount: number;
    payment_type?: string;
    transaction_id?: string;
    payment_time?: Date;
    details?: string;
}

export interface IUpdateMoneyReceiptPayload {
    amount?: number;
    payment_type?: string;
    transaction_id?: string;
    payment_time?: Date;
    details?: string;
}

export interface IGetMoneyReceiptData {
    id: number;
    mr_number: string;
    invoice_id: number;
    user_id: number;
    amount: number;
    payment_type: string | null;
    transaction_id: string | null;
    payment_time: Date;
    details: string | null;
}

export interface IGetMoneyReceiptQueryFilter {
    filter?: string;
    from_date?: Date;
    to_date?: Date;
    invoice_id?: number;
    user_id?: number;
    limit?: number;
    skip?: number;
}

export interface IGetSingleMoneyReceiptParams {
    id: number;
}
