import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICheckVisaData,
  ICheckVisaQuery,
  ICreateVisaPayload,
  IGetSingleVisa,
  IGetSingleVisaData,
  IGetVisaListData,
  IGetVisaListQuery,
  IUpdateVisaPayload,
} from '../../utils/modelTypes/visa/visaModel.types';

export default class VisaModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createVisa(payload: ICreateVisaPayload) {
    return this.db('visa').withSchema(this.SERVICE_SCHEMA).insert(payload, 'id');
  }

  public async updateVisa(payload: IUpdateVisaPayload, id: number) {
    return this.db('visa').withSchema(this.SERVICE_SCHEMA).update(payload).where({ id });
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
        if (query.source_id) {
          qb.andWhere('source_id', query.source_id);
        }
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
      });
  }

  public async getVisaList(
    query: IGetVisaListQuery
  ): Promise<{ data: IGetVisaListData[]; total: number }> {
    const queryResult = await this.db('visa as v')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'v.id',
        'c.nice_name as country_name',
        'v.title',
        'v.visa_type',
        'v.visa_mode',
        'v.max_validity',
        'v.image'
      )
      .joinRaw(`LEFT JOIN public.country AS c ON c.id = v.country_id`)
      .where((qb) => {
        qb.andWhere('v.is_deleted', query.is_deleted);
        qb.andWhere('v.source_id', query.source_id);
        qb.andWhere('v.source_type', query.source_type);
        if (query.status !== undefined) {
          qb.andWhere('v.status', query.status);
        }
        if (query.country_id) {
          qb.andWhere('v.country_id', query.country_id);
        }
        if (query.filter) {
          qb.andWhere('v.title', 'like', `%${query.filter}%`)
            .orWhere('v.slug', 'like', `%${query.filter}%`)
            .orWhere('v.visa_type', 'like', `%${query.filter}%`)
            .orWhere('v.visa_mode', 'like', `%${query.filter}%`);
        }
      })
      .orderBy('v.id', 'desc')
      .limit(query.limit)
      .offset(query.skip);
``
    const total = await this.db('visa')
      .withSchema(this.SERVICE_SCHEMA)
      .count('id as total')
      .where((qb) => {
        qb.andWhere('is_deleted', query.is_deleted);
        qb.andWhere('source_id', query.source_id);
        qb.andWhere('source_type', query.source_type);
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
        if (query.country_id) {
          qb.andWhere('country_id', query.country_id);
        }
        if (query.filter) {
          qb.andWhere('title', 'like', `%${query.filter}%`)
            .orWhere('slug', 'like', `%${query.filter}%`)
            .orWhere('visa_type', 'like', `%${query.filter}%`)
            .orWhere('visa_mode', 'like', `%${query.filter}%`);
        }
      });

    return {
      data: queryResult,
      total: Number(total[0].total),
    };
  }

  public async getSingleVisa(query: IGetSingleVisa): Promise<IGetSingleVisaData> {
    return this.db('visa')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'id',
        'title',
        'slug',
        'description',
        'image',
        'status',
        'country_id',
        'visa_type',
        'visa_mode',
        'visa_fee',
        'processing_fee',
        'max_validity',
        'stay_validity',
        'documents_details',
        'required_fields',
        'meta_title',
        'meta_description',
        'visa_for'
      )
      .where((qb) => {
        qb.andWhere('is_deleted', query.is_deleted);
        qb.andWhere('source_id', query.source_id);
        qb.andWhere('source_type', query.source_type);
        if (query.id) {
          qb.andWhere('id', query.id);
        }
        if (query.slug) {
          qb.andWhere('slug', query.slug);
        }
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
      })
      .first();
  }

}
