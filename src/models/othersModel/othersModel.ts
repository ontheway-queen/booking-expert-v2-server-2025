import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { DATA_LIMIT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
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
}
