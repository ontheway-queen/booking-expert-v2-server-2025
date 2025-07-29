import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICreateInvoicePayload,
  IDeleteSingleInvoiceParams,
  IGetInvoiceData,
  IGetInvoiceQueryFilter,
  IGetSingleInvoiceParams,
  IUpdateInvoicePayload,
} from '../../utils/modelTypes/paymentModelTypes/invoiceModelTypes';

export default class InvoiceModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createInvoice(payload: ICreateInvoicePayload) {
    return await this.db('invoice')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async updateInvoice(payload: IUpdateInvoicePayload, id: number) {
    return await this.db('invoice')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async getInvoiceList(
    query: IGetInvoiceQueryFilter,
    is_total: boolean = false
  ): Promise<{ data: IGetInvoiceData[]; total?: number }> {
    const data = await this.db('invoice')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        if (query.from_date && query.to_date) {
          qb.andWhereBetween('created_at', [query.from_date, query.to_date]);
        }
        if (query.filter) {
          qb.andWhere((qbc) => {
            qbc
              .whereILike('invoice_no', `${query.filter}%`)
              .orWhereILike('ref_type', `%${query.filter}%`)
              .orWhereILike('coupon_code', `%${query.filter}%`);
          });
        }
        if (query.invoice_type) {
          qb.andWhere('type', query.invoice_type);
        }
        if (query.source_type) {
          qb.andWhere('source_type', query.source_type);
        }
        if (query.source_id) {
          qb.andWhere('source_id', query.source_id);
        }
        if (query.user_id) {
          qb.andWhere('user_id', query.user_id);
        }
        if (query.partial_payment) {
          qb.andWhere('due', '>', 0).andWhere(
            'due',
            '!=',
            this.db.ref('net_amount')
          );
        }
      })
      .orderBy('id', 'desc')
      .limit(query.limit || 100)
      .offset(query.skip || 0);

    let total: any[] = [];

    if (is_total) {
      total = await this.db('invoice')
        .withSchema(this.DBO_SCHEMA)
        .count('id as total')
        .where((qb) => {
          if (query.from_date && query.to_date) {
            qb.andWhereBetween('created_at', [query.from_date, query.to_date]);
          }
          if (query.filter) {
            qb.andWhere((qbc) => {
              qbc
                .whereILike('invoice_no', `${query.filter}%`)
                .orWhereILike('ref_type', `%${query.filter}%`)
                .orWhereILike('coupon_code', `%${query.filter}%`);
            });
          }
          if (query.invoice_type) {
            qb.andWhere('type', query.invoice_type);
          }
          if (query.source_type) {
            qb.andWhere('source_type', query.source_type);
          }
          if (query.source_id) {
            qb.andWhere('source_id', query.source_id);
          }
          if (query.user_id) {
            qb.andWhere('user_id', query.user_id);
          }
          if (query.partial_payment) {
            qb.andWhere('due', '>', 0).andWhere(
              'due',
              '!=',
              this.db.ref('net_amount')
            );
          }
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  public async getSingleInvoice(
    params: IGetSingleInvoiceParams
  ): Promise<IGetInvoiceData | null> {
    return await this.db('invoice')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .andWhere((qb) => {
        qb.andWhere('source_type', params.source_type);
        if (params.source_id) {
          qb.andWhere('source_id', params.source_id);
        }
        if (params.id) {
          qb.andWhere('id', params.id);
        }
        if (params.ref_id) {
          qb.andWhere('ref_id', params.ref_id);
        }
        if (params.ref_type) {
          qb.andWhere('ref_type', params.ref_type);
        }
      })
      .first();
  }

  public async deleteInvoiceInvoice(params: IDeleteSingleInvoiceParams) {
    return await this.db('invoice')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        if (params.source_id) {
          qb.andWhere('source_id', params.source_id);
        }
        if (params.source_type) {
          qb.andWhere('source_type', params.source_type);
        }

        if (params.id) {
          qb.andWhere('id', params.id);
        }

        if (params.ref) {
          qb.andWhere('ref_id', params.ref.id);
          qb.andWhere('ref_type', params.ref.type);
        }
      })
      .first();
  }
}
