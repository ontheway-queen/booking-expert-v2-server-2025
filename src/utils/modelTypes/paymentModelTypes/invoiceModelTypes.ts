import {
  INVOICE_STATUS_TYPES,
  INVOICE_TYPES,
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
  SOURCE_B2C,
  SOURCE_EXTERNAL,
  SOURCE_SUB_AGENT,
  TYPE_FLIGHT,
  TYPE_GROUP_FARE,
  TYPE_HOLIDAY,
  TYPE_HOTEL,
  TYPE_UMRAH,
  TYPE_VISA,
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
  ref_type:
    | typeof TYPE_FLIGHT
    | typeof TYPE_HOTEL
    | typeof TYPE_VISA
    | typeof TYPE_UMRAH
    | typeof TYPE_GROUP_FARE
    | typeof TYPE_HOLIDAY;
  total_amount: number | string;
  due: number | string;
  details: string;
  status:
    | typeof INVOICE_STATUS_TYPES.PENDING
    | typeof INVOICE_STATUS_TYPES.PAID
    | typeof INVOICE_STATUS_TYPES.CANCELLED
    | typeof INVOICE_STATUS_TYPES.REFUNDED
    | typeof INVOICE_STATUS_TYPES.ISSUED;
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
  status?:
    | typeof INVOICE_STATUS_TYPES.PENDING
    | typeof INVOICE_STATUS_TYPES.PAID
    | typeof INVOICE_STATUS_TYPES.CANCELLED
    | typeof INVOICE_STATUS_TYPES.REFUNDED
    | typeof INVOICE_STATUS_TYPES.ISSUED;
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
  ref_type:
    | typeof TYPE_FLIGHT
    | typeof TYPE_HOTEL
    | typeof TYPE_VISA
    | typeof TYPE_UMRAH
    | typeof TYPE_GROUP_FARE
    | typeof TYPE_HOLIDAY;
  total_amount: number;
  due: number;
  details: string | null;
  status:
    | typeof INVOICE_STATUS_TYPES.PENDING
    | typeof INVOICE_STATUS_TYPES.PAID
    | typeof INVOICE_STATUS_TYPES.CANCELLED
    | typeof INVOICE_STATUS_TYPES.REFUNDED
    | typeof INVOICE_STATUS_TYPES.ISSUED;
  type: 'SALE' | 'REFUND' | string;
  created_at: Date;
}

export interface IGetInvoiceQueryFilter {
  filter?: string;
  from_date?: Date;
  to_date?: Date;
  limit?: number;
  skip?: number;
  status?:
    | typeof INVOICE_STATUS_TYPES.PENDING
    | typeof INVOICE_STATUS_TYPES.PAID
    | typeof INVOICE_STATUS_TYPES.CANCELLED
    | typeof INVOICE_STATUS_TYPES.REFUNDED
    | typeof INVOICE_STATUS_TYPES.ISSUED;
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
  id?: number;
  ref_id?: number;
  ref_type?:
    | typeof TYPE_FLIGHT
    | typeof TYPE_HOTEL
    | typeof TYPE_VISA
    | typeof TYPE_UMRAH
    | typeof TYPE_GROUP_FARE
    | typeof TYPE_HOLIDAY;
  source_type:
    | typeof SOURCE_AGENT
    | typeof SOURCE_B2C
    | typeof SOURCE_AGENT_B2C;
  source_id?: number;
}
export interface IDeleteSingleInvoiceParams {
  id?: number;
  source_type?:
    | typeof SOURCE_AGENT
    | typeof SOURCE_SUB_AGENT
    | typeof SOURCE_AGENT_B2C
    | typeof SOURCE_B2C;
  source_id?: number;
  ref?: {
    id: number;
    type:
      | typeof TYPE_FLIGHT
      | typeof TYPE_HOTEL
      | typeof TYPE_VISA
      | typeof TYPE_UMRAH
      | typeof TYPE_GROUP_FARE
      | typeof TYPE_HOLIDAY;
  };
}
