import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICreateMoneyReceiptPayload,
  IUpdateMoneyReceiptPayload,
  IGetMoneyReceiptData,
  IGetMoneyReceiptQueryFilter,
  IGetSingleMoneyReceiptParams,
} from '../../utils/modelTypes/paymentModelTypes/moneyReceiptModelTypes';

export default class MoneyReceiptModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createMoneyReceipt(payload: ICreateMoneyReceiptPayload) {
    return await this.db('money_receipt')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async updateMoneyReceipt(
    payload: IUpdateMoneyReceiptPayload,
    id: number
  ) {
    return await this.db('money_receipt')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async getMoneyReceiptList(
    query: IGetMoneyReceiptQueryFilter,
    is_total: boolean = false
  ): Promise<{ data: IGetMoneyReceiptData[]; total?: number }> {
    const data = await this.db('money_receipt')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        if (query.from_date && query.to_date) {
          qb.andWhereBetween('payment_time', [query.from_date, query.to_date]);
        }
        if (query.filter) {
          qb.andWhere((qbc) => {
            qbc
              .whereILike('mr_no', `${query.filter}%`)
              .orWhereILike('payment_type', `%${query.filter}%`)
              .orWhereILike('transaction_id', `%${query.filter}%`);
          });
        }
        if (query.invoice_id) {
          qb.andWhere('invoice_id', query.invoice_id);
        }
        if (query.user_id) {
          qb.andWhere('user_id', query.user_id);
        }
      })
      .orderBy('id', 'desc')
      .limit(query.limit || 100)
      .offset(query.skip || 0);

    let total: any[] = [];

    if (is_total) {
      total = await this.db('money_receipt')
        .withSchema(this.DBO_SCHEMA)
        .count('id as total')
        .where((qb) => {
          if (query.from_date && query.to_date) {
            qb.andWhereBetween('payment_time', [
              query.from_date,
              query.to_date,
            ]);
          }
          if (query.filter) {
            qb.andWhere((qbc) => {
              qbc
                .whereILike('mr_no', `${query.filter}%`)
                .orWhereILike('payment_type', `%${query.filter}%`)
                .orWhereILike('transaction_id', `%${query.filter}%`);
            });
          }
          if (query.invoice_id) {
            qb.andWhere('invoice_id', query.invoice_id);
          }
          if (query.user_id) {
            qb.andWhere('user_id', query.user_id);
          }
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  public async getSingleMoneyReceipt(
    params: IGetSingleMoneyReceiptParams
  ): Promise<IGetMoneyReceiptData> {
    return await this.db('money_receipt')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where({ id: params.id })
      .first();
  }
}
