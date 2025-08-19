import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { SOURCE_AGENT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import { VISA_FOR_B2C, VISA_FOR_BOTH } from '../../utils/miscellaneous/visaConstants';
import {
  ICheckVisaData,
  ICheckVisaQuery,
  ICreateVisaPayload,
  IGetAgentB2CSingleVisaData,
  IGetAgentB2CSingleVisaQuery,
  IGetAgentB2CVisaListQuery,
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
        'vt.name as visa_type',
        'vm.name as visa_mode',
        'v.max_validity',
        'v.image'
      )
      .joinRaw(`LEFT JOIN public.country AS c ON c.id = v.country_id`)
      .leftJoin('visa_type as vt', 'vt.id', 'v.visa_type_id')
      .leftJoin('visa_mode as vm', 'vm.id', 'v.visa_mode_id')
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
          qb.andWhere((subQb) => {
            subQb
              .where('v.title', 'Ilike', `%${query.filter}%`)
              .orWhere('v.slug', 'Ilike', `%${query.filter}%`);
          });
        }
      })
      .orderBy('v.id', 'desc')
      .limit(query.limit)
      .offset(query.skip);

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
          qb.andWhere((subQb) => {
            subQb
              .where('title', 'Ilike', `%${query.filter}%`)
              .orWhere('slug', 'Ilike', `%${query.filter}%`);
          });
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
        'visa_type_id',
        'visa_mode_id',
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

  public async getAgentB2CVisaList(query: IGetAgentB2CVisaListQuery) {
    return this.db('visa as v')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'v.id',
        'v.title',
        'v.image',
        'v.processing_fee',
        'v.visa_fee',
        'v.max_validity',
        'v.slug'
      )
      .where((qb) => {
        qb.andWhere('v.is_deleted', query.is_deleted);
        qb.andWhere('v.source_id', query.source_id);
        qb.andWhere('v.source_type', SOURCE_AGENT);

        if (query.country_id) {
          qb.andWhere('v.country_id', query.country_id);
        }

        if (query.visa_type_id) {
          qb.andWhere('v.visa_type_id', query.visa_type_id);
        }

        qb.andWhere('v.status', query.status);
        qb.andWhere((subQb) => {
          subQb.andWhere('v.visa_for', VISA_FOR_B2C).orWhere('v.visa_for', VISA_FOR_BOTH);
        });
      });
  }

  public async getAgentB2CSingleVisa(
    query: IGetAgentB2CSingleVisaQuery
  ): Promise<IGetAgentB2CSingleVisaData> {
    return this.db('visa as v')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'v.id',
        'c.nice_name as country_name',
        'v.title',
        'v.visa_fee',
        'v.processing_fee',
        'v.max_validity',
        'v.stay_validity',
        'vt.name as visa_type',
        'vm.name as visa_mode',
        'v.description',
        'v.documents_details',
        'v.required_fields',
        'v.image',
        'v.meta_title',
        'v.meta_description'
      )
      .leftJoin('visa_type as vt', 'vt.id', 'v.visa_type_id')
      .leftJoin('visa_mode as vm', 'vm.id', 'v.visa_mode_id')
      .joinRaw(`LEFT JOIN public.country AS c ON v.country_id = c.id`)
      .where((qb) => {
        qb.andWhere('v.is_deleted', query.is_deleted);
        qb.andWhere('v.source_id', query.source_id);
        qb.andWhere('v.source_type', SOURCE_AGENT);
        qb.andWhere('v.slug', query.slug);
        qb.andWhere('v.status', query.status);
      })
      .first();
  }

  public async getAgentB2CVisaTypeList(query: { source_id: number }) {
    return this.db('visa_type')
      .withSchema(this.SERVICE_SCHEMA)
      .select('id', 'name')
      .where('source_id', query.source_id)
      .andWhere('source_type', SOURCE_AGENT);
  }

  public async checkVisaExistsByVisaType(query: { visa_type_id: number }) {
    return this.db('visa')
      .withSchema(this.SERVICE_SCHEMA)
      .select('id')
      .where('visa_type_id', query.visa_type_id);
  }

  public async checkVisaExistsByVisaMode(query: { visa_mode_id: number }) {
    return this.db('visa')
      .withSchema(this.SERVICE_SCHEMA)
      .select('id')
      .where('visa_mode_id', query.visa_mode_id);
  }
}
