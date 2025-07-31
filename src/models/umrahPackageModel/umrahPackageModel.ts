import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetPackageDetailsQuery,
  IGetPackageListQuery,
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
    return await this.db('umrah_package').withSchema(this.SERVICE_SCHEMA).insert(payload, 'id');
  }

  public async insertUmrahPackageImage(
    payload: IInsertUmrahPackageImagePayload | IInsertUmrahPackageImagePayload[]
  ) {
    return await this.db('umrah_package_images')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload);
  }

  public async insertPackageInclude(
    payload: IInsertUmrahPackageIncludeServicePayload | IInsertUmrahPackageIncludeServicePayload[]
  ) {
    return await this.db('umrah_package_include')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload);
  }

  public async getSingleUmrahPackageDetails(
    query: IGetPackageDetailsQuery
  ): Promise<IGetSinglePackageDetails> {
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
        if (query.slug) {
          qb.andWhere('slug', query.slug);
        }
      })
      .andWhere('id', query.umrah_id)
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
