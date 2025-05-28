import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetB2CMarkupConfigData,
  IUpsertB2CMarkupConfigPayload,
} from '../../utils/modelTypes/markupSetModelTypes/b2cMarkupConfigTypes';

export default class B2CMarkupConfigModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async getB2CMarkupConfigData(
    type?: 'Flight' | 'Hotel' | 'Both'
  ): Promise<IGetB2CMarkupConfigData[]> {
    return await this.db('b2c_markup_config')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'b2c_markup_config.id',
        'b2c_markup_config.markup_set_id',
        'markup_set.name'
      )
      .leftJoin(
        'markup_set',
        'markup_set.id',
        'b2c_markup_config.markup_set_id'
      )
      .where((qb) => {
        if (type && type !== 'Both') {
          qb.where('markup_set.type', type);
        }
      });
  }

  public async upsertB2CMarkupConfig(payload: IUpsertB2CMarkupConfigPayload) {
    //update
    const res = await this.db('b2c_markup_config')
      .withSchema(this.DBO_SCHEMA)
      .update(payload.markup_set_id)
      .where('name', payload.name);

    //if update is not successful then insert
    if (!res) {
      await this.db('b2c_markup_config')
        .withSchema(this.DBO_SCHEMA)
        .insert(payload);
    }
  }
}
