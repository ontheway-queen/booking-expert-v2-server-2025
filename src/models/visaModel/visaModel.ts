import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICheckVisaData,
  ICheckVisaQuery,
  ICreateVisaPayload,
  IUpdateVisaPayload,
} from '../../utils/modelTypes/visa/visaModel.types';

export default class VisaModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createVisa(payload: ICreateVisaPayload) {
    return await this.db('visa')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  public async updateVisa(payload: IUpdateVisaPayload, id: number) {
    return this.db('visa')
      .withSchema(this.SERVICE_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async checkVisa(query: ICheckVisaQuery): Promise<ICheckVisaData[]> {
    return this.db('visa')
      .withSchema(this.SERVICE_SCHEMA)
      .select('*')
      .where((qb) => {
        qb.andWhere('is_deleted', query.is_deleted);
        if (query.slug) {
          qb.andWhere('slug', query.slug);
        }
        if (query.id) {
          qb.andWhere('id', query.id);
        }
        if (query.country_id) {
          qb.andWhere('country_id', query.country_id);
        }
        if (query.agency_id) {
          qb.andWhere('agency_id', query.agency_id);
        }
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
      });
  }
}
