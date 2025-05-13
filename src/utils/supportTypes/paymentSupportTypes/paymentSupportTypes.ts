export interface ISSLPaymentGatewayReqBody {
    total_amount: number;
    currency: string;
    tran_id: string;
    cus_name: string;
    cus_email: string;
    cus_phone: string|null;
    product_name: string;
    product_profile?: number | string;
    success_page: string;
    failed_page: string;
    cancelled_page: string;
}