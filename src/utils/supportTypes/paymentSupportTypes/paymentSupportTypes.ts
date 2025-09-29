import { Knex } from "knex";

export interface ISSLPaymentGatewayReqBody {
    total_amount: number;
    currency: string;
    tran_id: string;
    cus_name: string;
    cus_email: string;
    cus_phone: string | null;
    product_name: string;
    product_profile?: number | string;
    success_page: string;
    failed_page: string;
    cancelled_page: string;
    store_id?: string;
    store_passwd?: string;
}

export interface IBkashPaymentGatewayReqBody {
    mobile_number: string;
    success_page: string;
    failed_page: string;
    cancelled_page: string;
    amount: number;
    ref_id: string;
    trx: Knex.Transaction,
    user_id: number,
    source: "AGENT" | "AGENT B2C" | "B2C" | "EXTERNAL" | "SUB AGENT",
    cred?: {
        BKASH_APP_KEY: string;
        BKASH_APP_SECRET: string;
        BKASH_USERNAME: string;
        BKASH_PASSWORD: string;
    }
}