import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { SOURCE_AGENT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetAgentB2CUmrahListData,
  IGetAgentB2CUmrahListQuery,
  IGetPackageDetailsQuery,
  IGetSinglePackageDetails,
  IGetUmrahPackageImages,
  IInsertUmrahPackageImagePayload,
  IInsertUmrahPackageIncludeServicePayload,
  IInsertUmrahPackagePayload,
} from '../../utils/modelTypes/umrahPackageModelTypes/umrahPackageModelTypes';

export default class UmrahPackageModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertUmrahPackage(payload: IInsertUmrahPackagePayload) {
    return await this.db('umrah_package')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  public async insertUmrahPackageImage(
    payload: IInsertUmrahPackageImagePayload | IInsertUmrahPackageImagePayload[]
  ) {
    return await this.db('umrah_package_images')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  public async insertPackageInclude(
    payload:
      | IInsertUmrahPackageIncludeServicePayload
      | IInsertUmrahPackageIncludeServicePayload[]
  ) {
    return await this.db('umrah_package_include')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
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
        'group_fare',
        'status',
        'adult_price',
        'child_price',
        'package_details',
        'slug',
        'meta_tag',
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

  public async getSingleUmrahPackageImages(
    query: IGetPackageDetailsQuery
  ): Promise<IGetUmrahPackageImages[]> {
    return await this.db('umrah_package_images')
      .withSchema(this.SERVICE_SCHEMA)
      .select('id', 'image')
      .where('umrah_id', query.umrah_id);
  }
}
