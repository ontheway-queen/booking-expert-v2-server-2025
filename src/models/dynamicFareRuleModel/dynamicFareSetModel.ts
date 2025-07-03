import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICreateDynamicFareSetPayload,
  IGetDynamicFareData,
  IGetDynamicFareListFilterQuery,
  IUpdateDynamicFarePayload,
} from '../../utils/modelTypes/dynamicFareRulesModelTypes/dynamicFareSetModelTypes';

export default class DynamicFareSetModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createDynamicFareSet(
    payload: ICreateDynamicFareSetPayload
  ): Promise<{ id: number }[]> {
    return await this.db('dynamic_fare_set')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async getAllDynamicFareSet(
    query: IGetDynamicFareListFilterQuery
  ): Promise<IGetDynamicFareData[]> {
    const data = await this.db('dynamic_fare_set')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        if (query.filter) {
          qb.andWhereILike('name', `%${query.filter}%`);
        }
        if (query.check_name) {
          qb.andWhere('name', query.check_name);
        }
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
        if (query.type) {
          qb.andWhere('type', query.type);
        }
      })
      .andWhere('is_deleted', false);

    return data;
  }

  public async getSingleDynamicFareSet({
    id,
    status,
    type,
  }: {
    id: number;
    status?: boolean;
    type?: 'Flight' | 'Hotel';
  }): Promise<IGetDynamicFareData | null> {
    return await this.db('dynamic_fare_set AS ms')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'ms.*',
        'cua.name AS created_by_name',
        'uua.name AS updated_by_name'
      )
      .joinRaw(`left join admin.user_admin AS cua on ms.created_by = cua.id`)
      .joinRaw(`left join admin.user_admin AS uua on ms.updated_by = uua.id`)
      .where((qb) => {
        if (type) {
          qb.andWhere('ms.type', type);
        }
        qb.andWhere('ms.id', id);

        if (status !== undefined) {
          qb.andWhere('ms.status', status);
        }
      })
      .andWhere('ms.is_deleted', false)
      .first();
  }

  public async checkDynamicFareSet({
    name,
    type,
    status,
    id,
  }: {
    id?: number;
    name?: string;
    status?: boolean;
    type: 'Flight' | 'Hotel';
  }): Promise<IGetDynamicFareData | null> {
    return await this.db('dynamic_fare_set')
      .withSchema(this.DBO_SCHEMA)
      .select('*')

      .where((qb) => {
        if (name) {
          qb.andWhere('name', name);
        }

        if (id) {
          qb.andWhere('id', id);
        }
        qb.andWhere('type', type);

        if (status !== undefined) {
          qb.andWhere('status', status);
        }
      })
      .andWhere('is_deleted', false)
      .first();
  }

  public async updateDynamicFareSet(
    payload: IUpdateDynamicFarePayload,
    { id, type }: { id: number; type: 'Flight' | 'Hotel' }
  ) {
    return await this.db('dynamic_fare_set')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .andWhere({ id })
      .andWhere({ type });
  }

  public async checkUsages({
    id,
    type,
  }: {
    id: number;
    type: 'Flight' | 'Hotel';
  }) {
    const checkFromAgency = await this.db('agency')
      .withSchema(this.AGENT_SCHEMA)
      .select('*')
      .where((qb) => {
        if (type === 'Flight') {
          qb.andWhere('flight_markup_set', id);
        }
        if (type === 'Hotel') {
          qb.andWhere('hotel_markup_set', id);
        }
      });

    if (checkFromAgency.length) {
      return true;
    } else {
      const checkB2C = await this.db('b2c_markup_config')
        .withSchema(this.DBO_SCHEMA)
        .select('*')
        .andWhere('type', type)
        .andWhere('markup_set_id', id);

      if (checkB2C.length) {
        return true;
      } else {
        false;
      }
    }
  }
}
