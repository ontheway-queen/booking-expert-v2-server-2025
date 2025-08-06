import { TDB } from '../../features/public/utils/types/publicCommon.types';
import {
  DATA_LIMIT,
  SOURCE_ADMIN,
  SOURCE_AGENT,
} from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICreateBankAccountPayload,
  IGetBankAccountData,
  IGetBankAccountQuery,
  IGetHotelSearchHistoryData,
  IGetHotelSearchHistoryQuery,
  IInsertHotelSearchHistoryPayload,
} from '../../utils/modelTypes/othersModelTypes/othersModelTypes';

export default class OthersModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertHotelSearchHistory(
    payload: IInsertHotelSearchHistoryPayload
  ) {
    return await this.db('hotel_search_history')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  public async getHotelSearchHistory({
    agency_id,
    limit,
    skip,
    user_id,
    from_date,
    to_date,
    user_type,
  }: IGetHotelSearchHistoryQuery): Promise<IGetHotelSearchHistoryData[]> {
    let query = this.db('hotel_search_history AS hsh')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'hsh.id',
        'hsh.name',
        'hsh.code',
        'hsh.nationality',
        'hsh.check_in_date',
        'hsh.check_out_date',
        'hsh.guest_n_rooms',
        'hsh.destination_type',
        'hsh.created_at'
      )
      .where((qb) => {
        if (user_type && user_type !== 'All') {
          qb.andWhere('hsh.user_type', user_type);
        }
        if (agency_id) {
          qb.andWhere('hsh.agency_id', agency_id);
        }
        if (user_id) {
          qb.andWhere('hsh.user_id', user_id);
        }
        if (from_date && to_date) {
          qb.andWhereBetween('hsh.created_at', [from_date, to_date]);
        }
      })
      .limit(limit ? Number(limit) : DATA_LIMIT)
      .offset(skip ? Number(skip) : 0)
      .orderBy('hsh.created_at', 'desc');

    return await query;
  }

  public async createAccount(payload: ICreateBankAccountPayload) {
    return await this.db('account_details')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  public async getAccount(
    query: IGetBankAccountQuery
  ): Promise<IGetBankAccountData[]> {
    return await this.db('account_details AS ad')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'ad.id',
        'ad.account_name',
        'ad.account_number',
        'ad.branch',
        'ad.routing_no',
        'ad.status',
        'ad.swift_code',
        'b.name AS bank_name',
        'b.type AS bank_type',
        'b.logo AS bank_logo'
      )
      .joinRaw(`LEFT JOIN public.banks AS b ON ad.bank_id = b.id`)
      .andWhere('ad.source_type', query.source_type)
      .where((qb) => {
        if (query.filter) {
          qb.orWhereILike('ad.account_name', `%${query.filter}%`).orWhereILike(
            'b.name',
            `%${query.filter}%`
          );
        }

        if (query.source_id) {
          qb.andWhere('ad.source_id', query.source_id);
        }
        if (query.status !== undefined) {
          qb.andWhere('ad.status', query.status);
        }
      });
  }

  public async deleteAccount() {}

  public async updateAccount() {}
}
