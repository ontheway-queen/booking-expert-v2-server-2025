import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { IInsertHotelSearchHistoryPayload } from '../../utils/modelTypes/othersModelTypes/othersModelTypes';

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
}
