import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetPackageDetailsQuery,
  IGetPackageListQuery,
  IGetSinglePackageDetails,
  IGetUmrahPackageImages,
  IInsertUmrahPackageImagePayload,
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
    payload: IInsertUmrahPackageImagePayload
  ) {
    return await this.db('umrah_package_images')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  public async getSingleUmrahPackageDetails(
    query: IGetPackageDetailsQuery
  ): Promise<IGetSinglePackageDetails> {
    return await this.db('umrah_package as up')
      .withSchema(this.SERVICE_SCHEMA)
      .select('up.*')
      .where((qb) => {
        if (query.slug) {
          qb.andWhere('up.slug', query.slug);
        }
      })
      .andWhere('up.id', query.umrah_id)
      .first();
  }

  public async getSingleUmrahPackageImages(
    query: IGetPackageDetailsQuery
  ): Promise<IGetUmrahPackageImages[]> {
    return await this.db('umrah_package_images as upi')
      .withSchema(this.SERVICE_SCHEMA)
      .select('upi.*')
      .where('upi.umrah_id', query.umrah_id);
  }

  public async getUmrahPackageList(query: IGetPackageListQuery) {
    return await this.db('umrah_package as up')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        '*',
        this.db.raw(`
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', upi.id,
            'photo', upi.photo
          )) FILTER (WHERE upi.id IS NOT NULL),
          '[]'
        ) as images
      `),
        this.db.raw(`
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', upinei.id,
            'icon', upinei.icon,
            'title', upinei.title
          )) FILTER (WHERE upinei.id IS NOT NULL),
          '[]'
        ) as includes
      `)
      )
      .leftJoin('umrah_package_images as upi', 'upi.umrah_id', 'up.id')
      .leftJoin('umrah_package_include as upin', 'upin.umrah_id', 'up.id')
      .leftJoin(
        'umrah_package_include_exclude_items as upinei',
        'upinei.id',
        'upin.include_exclude_id'
      )
      .where((qb) => {
        if (query.status != undefined) {
          qb.andWhere('up.status', query.status);
        }
        if (query.title) {
          qb.andWhereILike('up.title', `%${query.title}%`);
        }
      })
      .limit(query.limit)
      .offset(query.skip);
  }
}
