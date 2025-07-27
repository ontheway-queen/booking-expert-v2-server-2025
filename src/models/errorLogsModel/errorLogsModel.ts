import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { DATA_LIMIT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetErrorLogsList,
  IGetErrorLogsListFilterQuery,
  IInsertErrorLogsPayload,
} from '../../utils/modelTypes/errorLogsModelTypes/errorLogsModelTypes';

export default class ErrorLogsModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertErrorLogs(
    payload: IInsertErrorLogsPayload
  ): Promise<{ id: number }[]> {
    return await this.db('error_logs')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async getErrorLogs(
    query: IGetErrorLogsListFilterQuery
  ): Promise<IGetErrorLogsList[]> {
    const data = await this.db('error_logs')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        if (query.level) {
          qb.andWhere('level', 'ilike', query.level);
        }
        if (query.search) {
          qb.andWhere('message', 'ilike', `%${query.search}%`);
        }

        if (query.from_date && query.to_date) {
          qb.andWhereBetween('created_at', [query.from_date, query.to_date]);
        }

        if (query.source) {
          qb.andWhere('source', query.source);
        }
      })
      .orderBy('id', 'desc')
      .limit(query.limit || DATA_LIMIT)
      .offset(query.skip || 0);

    return data;
  }

  public async deleteErrorLogs(id: number) {
    return await this.db('error_logs')
      .withSchema(this.DBO_SCHEMA)
      .delete()
      .where({ id });
  }
}
