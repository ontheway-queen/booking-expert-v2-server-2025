import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { SOURCE_AGENT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetAgentB2CUmrahListData,
  IGetAgentB2CUmrahListQuery,
  IGetPackageDetailsQuery,
  IGetSinglePackageDetails,
  IGetSinglePackageIncludeService,
  IGetUmrahPackageImages,
  IGetUmrahPackageListQuery,
  IInsertUmrahPackageImagePayload,
  IInsertUmrahPackageIncludeServicePayload,
  IInsertUmrahPackagePayload,
  IUmrahPackageListItem,
  IUpdateUmrahPackage,
} from '../../utils/modelTypes/umrahPackageModelTypes/umrahPackageModelTypes';

export default class UmrahPackageModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertUmrahPackage(payload: IInsertUmrahPackagePayload) {
    return await this.db('umrah_package').withSchema(this.SERVICE_SCHEMA).insert(payload, 'id');
  }

  public async insertUmrahPackageImage(
    payload: IInsertUmrahPackageImagePayload | IInsertUmrahPackageImagePayload[]
  ) {
    return await this.db('umrah_package_photos').withSchema(this.SERVICE_SCHEMA).insert(payload);
  }

  public async insertPackageInclude(
    payload: IInsertUmrahPackageIncludeServicePayload | IInsertUmrahPackageIncludeServicePayload[]
  ) {
    return await this.db('umrah_package_include').withSchema(this.SERVICE_SCHEMA).insert(payload);
  }

  public async getAgentB2CUmrahPackageList(
    query: IGetAgentB2CUmrahListQuery
  ): Promise<IGetAgentB2CUmrahListData[]> {
    return await this.db('umrah_package')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'id',
        'slug',
        'thumbnail',
        'title',
        'duration',
        'group_size',
        'short_description',
        'adult_price'
      )
      .andWhere('source_type', SOURCE_AGENT)
      .andWhere('source_id', query.source_id)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
      });
  }

  public async getUmrahPackageList(
    query: IGetUmrahPackageListQuery
  ): Promise<{ data: IUmrahPackageListItem[]; total: number }> {
    const result = await this.db('umrah_package')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'id',
        'title',
        'duration',
        'group_size',
        'short_description',
        'adult_price',
        'child_price',
        'status',
        'valid_till_date'
      )
      .andWhere('source_type', SOURCE_AGENT)
      .andWhere('source_id', query.source_id)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
        if (query.filter) {
          qb.andWhere('title', 'like', `%${query.filter}%`).orWhere(
            'short_description',
            'like',
            `%${query.filter}%`
          );
        }
      })
      .orderBy('id', 'desc')
      .limit(query.limit || 100)
      .offset(query.skip || 0);

    const total = await this.db('umrah_package')
      .withSchema(this.SERVICE_SCHEMA)
      .count('id AS total')
      .andWhere('source_type', SOURCE_AGENT)
      .andWhere('source_id', query.source_id)
      .where((qb) => {
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }
        if (query.filter) {
          qb.andWhere('title', 'like', `%${query.filter}%`).orWhere(
            'short_description',
            'like',
            `%${query.filter}%`
          );
        }
      });

    return { data: result, total: Number(total[0].total) };
  }

  public async getSingleAgentB2CUmrahPackageDetails(
    query: IGetPackageDetailsQuery
  ): Promise<IGetSinglePackageDetails | null> {
    return await this.db('umrah_package')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'id',
        'title',
        'description',
        'duration',
        'valid_till_date',
        'status',
        'adult_price',
        'child_price',
        'package_details',
        'slug',
        'meta_title',
        'meta_description',
        'package_price_details',
        'package_accommodation_details',
        'short_description'
      )
      .where((qb) => {
        qb.andWhere('source_id', query.source_id);
        qb.andWhere('source_type', SOURCE_AGENT);
        if (query.slug) {
          qb.andWhere('slug', query.slug);
        }
        if (query.umrah_id) {
          qb.andWhere('id', query.umrah_id);
        }
      })
      .first();
  }

  public async getSingleUmrahPackage(query: {
    umrah_id: number;
  }): Promise<IGetSinglePackageDetails | null> {
    return await this.db('umrah_package')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'title',
        'description',
        'duration',
        'valid_till_date',
        'group_size',
        'status',
        'adult_price',
        'child_price',
        'package_details',
        'slug',
        'meta_title',
        'meta_description',
        'umrah_for',
        'package_price_details',
        'package_accommodation_details',
        'short_description',
        'thumbnail'
      )
      .where('id', query.umrah_id)
      .first();
  }

  public async getSingleUmrahPackageImages(query: {
    umrah_id: number;
  }): Promise<IGetUmrahPackageImages[]> {
    return await this.db('umrah_package_photos')
      .withSchema(this.SERVICE_SCHEMA)
      .select('id', 'image')
      .where('umrah_id', query.umrah_id);
  }

  public async getSingleUmrahPackageIncludedService(query: {
    umrah_id: number;
  }): Promise<IGetSinglePackageIncludeService[]> {
    return await this.db('umrah_package_include')
      .withSchema(this.SERVICE_SCHEMA)
      .select('id', 'service_name')
      .where('umrah_id', query.umrah_id);
  }

  public async updateUmrahPackage(payload: { umrah_id: number; data: IUpdateUmrahPackage }) {
    return await this.db('umrah_package')
      .withSchema(this.SERVICE_SCHEMA)
      .where('id', payload.umrah_id)
      .update(payload.data);
  }

  public async deleteUmrahPackageImage(payload: { image_id: number }) {
    return await this.db('umrah_package_photos')
      .withSchema(this.SERVICE_SCHEMA)
      .andWhere('id', payload.image_id)
      .delete();
  }

  public async getSingleUmrahPackageImage(query: {
    image_id: number;
  }): Promise<{ id: number; image: string; umrah_id: number }> {
    return await this.db('umrah_package_photos')
      .withSchema(this.SERVICE_SCHEMA)
      .andWhere('id', query.image_id)
      .first();
  }

  public async deleteUmrahPackageIncludedService(payload: { id: number }) {
    return await this.db('umrah_package_include')
      .withSchema(this.SERVICE_SCHEMA)
      .andWhere('id', payload.id)
      .delete();
  }
}
