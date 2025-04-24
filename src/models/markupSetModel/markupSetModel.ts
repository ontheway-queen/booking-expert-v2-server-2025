import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICreateMarkupSetPayload,
  IGetMarkupListFilterQuery,
  IGetMarkupSetData,
  IUpdateMarkupSetPayload,
} from '../../utils/modelTypes/markupSetModelTypes/markupSetModelTypes';

export default class MarkupSetModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createMarkupSet(
    payload: ICreateMarkupSetPayload
  ): Promise<{ id: number }[]> {
    return await this.db('markup_set')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async getAllMarkupSet(
    query: IGetMarkupListFilterQuery
  ): Promise<IGetMarkupSetData[]> {
    const data = await this.db('markup_set')
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

  public async getSingleMarkupSet({
    id,
    status,
    type,
  }: {
    id: number;
    status?: boolean;
    type?: 'Flight' | 'Hotel';
  }): Promise<IGetMarkupSetData | null> {
    return await this.db('markup_set AS ms')
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

  public async updateMarkupSet(payload: IUpdateMarkupSetPayload, id: number) {
    return await this.db('markup_set')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }
}
