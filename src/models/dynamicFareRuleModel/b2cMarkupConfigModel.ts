import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetB2CMarkupConfigData,
  IUpsertB2CMarkupConfigPayload,
} from '../../utils/modelTypes/dynamicFareRulesModelTypes/b2cMarkupConfigTypes';

export default class B2CMarkupConfigModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async getB2CMarkupConfigData(
    type: 'Flight' | 'Hotel' | 'Both'
  ): Promise<IGetB2CMarkupConfigData[]> {
    return await this.db('b2c_markup_config')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'b2c_markup_config.id',
        'b2c_markup_config.markup_set_id',
        'b2c_markup_config.type',
        'dynamic_fare_set.name'
      )
      .leftJoin(
        'dynamic_fare_set',
        'b2c_markup_config.markup_set_id',
        'dynamic_fare_set.id'
      )
      .where((qb) => {
        if (type !== 'Both') {
          qb.where('dynamic_fare_set.type', type);
        }
      });
  }

  public async upsertB2CMarkupConfig(payload: IUpsertB2CMarkupConfigPayload) {
    //update
    const res = await this.db('b2c_markup_config')
      .withSchema(this.DBO_SCHEMA)
      .update('markup_set_id', payload.markup_set_id)
      .where('type', payload.type);

    //if update is not successful then insert
    if (!res) {
      await this.db('b2c_markup_config')
        .withSchema(this.DBO_SCHEMA)
        .insert(payload);
    }
  }
}
