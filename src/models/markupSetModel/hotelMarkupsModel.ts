import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetHotelMarkupData,
  IGetHotelMarkupQuery,
  IInsertHotelMarkupPayload,
  IUpdateHotelMarkupPayload,
} from '../../utils/modelTypes/markupSetModelTypes/hotelMarkupsTypes';

export default class HotelMarkupsModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // Insert set hotel commission
  public async insertHotelMarkup(
    payload: IInsertHotelMarkupPayload | IInsertHotelMarkupPayload[]
  ) {
    return await this.db('hotel_markups')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  // Get set Hotel Commission
  public async getHotelMarkup({
    markup_for,
    set_id,
    status,
  }: IGetHotelMarkupQuery): Promise<IGetHotelMarkupData[]> {
    return await this.db('hotel_markup_set_view')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        qb.andWhere('set_id', set_id);

        if (markup_for !== 'Both') {
          qb.andWhere('markup_for', markup_for);
        }

        if (status !== undefined) {
          qb.andWhere('status', status);
        }
      });
  }

  public async updateHotelMarkup(
    payload: IUpdateHotelMarkupPayload,
    conditions: { set_id: number; markup_for: 'Book' | 'Cancel' }
  ) {
    return await this.db('hotel_markups')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .andWhere('set_id', conditions.set_id)
      .andWhere('markup_for', conditions.markup_for);
  }

  public async deleteHotelMarkup(id: number) {
    return await this.db('hotel_markups')
      .withSchema(this.DBO_SCHEMA)
      .where('id', id);
  }
}
