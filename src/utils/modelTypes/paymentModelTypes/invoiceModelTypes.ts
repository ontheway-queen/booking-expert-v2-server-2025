import {
  INVOICE_TYPES,
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
  SOURCE_B2C,
  SOURCE_EXTERNAL,
  SOURCE_SUB_AGENT,
} from '../../miscellaneous/constants';

export interface ICreateInvoicePayload {
  invoice_no: string;
  source_type:
    | typeof SOURCE_AGENT
    | typeof SOURCE_B2C
    | typeof SOURCE_AGENT_B2C
    | typeof SOURCE_SUB_AGENT
    | typeof SOURCE_EXTERNAL;
  source_id?: number;
  user_id: number;
  ref_id: number;
  ref_type: string;
  total_amount: number;
  due: number;
  details: string;
  type:
    | typeof INVOICE_TYPES.SALE
    | typeof INVOICE_TYPES.REFUND
    | typeof INVOICE_TYPES.REISSUE;
}

export interface IUpdateInvoicePayload {
  gross_amount?: number;
  markup_price?: number;
  net_amount?: number;
  due?: number;
  details?: string;
  status?: false;
}

export interface IGetInvoiceData {
  id: number;
  invoice_no: string;
  source_type:
    | typeof SOURCE_AGENT
    | typeof SOURCE_B2C
    | typeof SOURCE_AGENT_B2C;
  source_id: number | null;
  user_id: number;
  ref_id: number | null;
  ref_type: string | null;
  gross_amount: number;
  markup_price: number;
  coupon_code: string | null;
  net_amount: number;
  due: number;
  details: string | null;
  status: boolean;
  type: 'SALE' | 'REFUND' | string;
  created_at: Date;
}

export interface IGetInvoiceQueryFilter {
  filter?: string;
  from_date?: Date;
  to_date?: Date;
  limit?: number;
  skip?: number;
  invoice_type?:
    | typeof INVOICE_TYPES.SALE
    | typeof INVOICE_TYPES.REFUND
    | typeof INVOICE_TYPES.REISSUE;
  source_type?:
    | typeof SOURCE_AGENT
    | typeof SOURCE_B2C
    | typeof SOURCE_AGENT_B2C;
  source_id?: number;
  user_id?: number;
  ref_id?: number;
  ref_type?: string;
  partial_payment?: boolean;
}

export interface IGetSingleInvoiceParams {
  id: number;
  source_type:
    | typeof SOURCE_AGENT
    | typeof SOURCE_B2C
    | typeof SOURCE_AGENT_B2C;
  source_id: number;
}
