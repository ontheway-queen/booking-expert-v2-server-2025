import { TDB } from '../../features/public/utils/types/publicCommon.types';
import {
  HOLIDAY_CREATED_BY_ADMIN,
  HOLIDAY_FOR_AGENT,
  HOLIDAY_FOR_B2C,
  HOLIDAY_FOR_BOTH,
  VIEW_HOLIDAY_PACKAGE_CREATED_BY_ADMIN,
  VIEW_HOLIDAY_PACKAGE_CREATED_BY_AGENT,
} from '../../utils/miscellaneous/holidayConstants';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetHolidayPackageList,
  IGetHolidayPackageListFilterQuery,
  IGetSingleHolidayPackageData,
  IGetSingleHolidayPackageParams,
  IInsertHolidayPackagePayload,
  IUpdateHolidayPackagePayload,
} from '../../utils/modelTypes/holidayPackageModelTypes/holidayPackageModelTypes';

export default class HolidayPackageModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertHolidayPackage(
    payload: IInsertHolidayPackagePayload
  ): Promise<{ id: number }[]> {
    return await this.db('holiday_package')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  // public async getHolidayPackageList(
  //     query: IGetHolidayPackageListFilterQuery,
  //     is_total: boolean = false
  // ): Promise<{ data: IGetHolidayPackageList[]; total?: number }> {
  //     const priceFor =
  //         query.holiday_for === HOLIDAY_FOR_AGENT || query.holiday_for === HOLIDAY_FOR_B2C
  //             ? query.holiday_for
  //             : null;

  //     const data = await this.db("holiday_package as tp")
  //         .withSchema(this.SERVICE_SCHEMA)
  //         .select(
  //             "tp.id",
  //             "tp.slug",
  //             "tp.title",
  //             this.db.raw(`
  //                 (SELECT json_agg(json_build_object(
  //                     'city_id', c.id,
  //                     'city_name', c.name,
  //                     'country', cn.name
  //                 ))
  //                 FROM ${this.SERVICE_SCHEMA}.holiday_package_city hpc
  //                 JOIN ${this.PUBLIC_SCHEMA}.city c ON c.id = hpc.city_id
  //                 JOIN ${this.PUBLIC_SCHEMA}.country cn ON cn.id = c.country_id
  //                 WHERE hpc.holiday_package_id = tp.id
  //                 ) as cities
  //             `),
  //             "tp.holiday_type",
  //             "tp.holiday_for",
  //             "tp.duration",
  //             "tp.status",
  //             "tp.created_at",
  //             this.db.raw(`
  //                 (SELECT image FROM ${this.SERVICE_SCHEMA}.holiday_package_images
  //                 WHERE holiday_package_id = tp.id
  //                 ORDER BY id ASC
  //                 LIMIT 1) as image
  //             `),
  //             this.db.raw(`
  //                 (SELECT adult_price FROM ${this.SERVICE_SCHEMA}.holiday_package_pricing
  //                 WHERE holiday_package_id = tp.id
  //                 ${priceFor ? "AND price_for = ?" : ""}
  //                 ORDER BY id ASC
  //                 LIMIT 1) as price
  //             `, priceFor ? [priceFor] : [])
  //         )
  //         .where((qb) => {
  //             if (query.city_id) {
  //                 qb.whereIn("tp.id", function() {
  //                     this.select("hpc.holiday_package_id")
  //                        .from(`services.holiday_package_city as hpc`)
  //                        .where("hpc.city_id", query.city_id);
  //                 });
  //             }
  //             if (query.status !== undefined) {
  //                 qb.andWhere("tp.status", query.status);
  //             }
  //             if (query.holiday_for) {
  //                 if (query.holiday_for === HOLIDAY_FOR_AGENT || query.holiday_for === HOLIDAY_FOR_B2C) {
  //                     qb.andWhere(function () {
  //                         this.where("tp.holiday_for", query.holiday_for)
  //                             .orWhere("tp.holiday_for", HOLIDAY_FOR_BOTH);
  //                     });
  //                 } else if (query.holiday_for === HOLIDAY_FOR_BOTH) {
  //                     qb.andWhere("tp.holiday_for", HOLIDAY_FOR_BOTH);
  //                 }
  //             }
  //             if (query.slug) {
  //                 qb.andWhere("tp.slug", query.slug);
  //             }
  //             if(query.created_by){
  //                 qb.andWhere("tp.created_by", query.created_by);
  //             }
  //         })
  //         .andWhere("tp.is_deleted", false)
  //         .groupBy("tp.id")
  //         .orderBy("tp.id", "desc")
  //         .limit(query.limit || 100)
  //         .offset(query.skip || 0);

  //     let total: any[] = [];
  //     if (is_total) {
  //         total = await this.db("holiday_package as tp")
  //             .withSchema(this.SERVICE_SCHEMA)
  //             .countDistinct("tp.id as total")
  //             .modify((qb) => {
  //                 if (query.city_id) {
  //                     qb.whereIn("tp.id", function() {
  //                         this.select("hpc.holiday_package_id")
  //                            .from(`services.holiday_package_city as hpc`)
  //                            .where("hpc.city_id", query.city_id);
  //                     });
  //                 }
  //                 if (query.status !== undefined) {
  //                     qb.andWhere("tp.status", query.status);
  //                 }
  //                 if (query.holiday_for) {
  //                     if (query.holiday_for === HOLIDAY_FOR_AGENT || query.holiday_for === HOLIDAY_FOR_B2C) {
  //                         qb.andWhere(function () {
  //                             this.where("tp.holiday_for", query.holiday_for)
  //                                 .orWhere("tp.holiday_for", HOLIDAY_FOR_BOTH);
  //                         });
  //                     } else if (query.holiday_for === HOLIDAY_FOR_BOTH) {
  //                         qb.andWhere("tp.holiday_for", HOLIDAY_FOR_BOTH);
  //                     }
  //                 }
  //                 if (query.slug) {
  //                     qb.andWhere("tp.slug", query.slug);
  //                 }
  //                 if(query.created_by){
  //                     qb.andWhere("tp.created_by", query.created_by);
  //                 }
  //             })
  //             .andWhere("tp.is_deleted", false);
  //     }

  //     return {
  //         data,
  //         total: total[0]?.total
  //     };
  // }

  public async getHolidayPackageList(
    query: IGetHolidayPackageListFilterQuery,
    is_total: boolean = false
  ): Promise<{ data: IGetHolidayPackageList[]; total?: number }> {
    const price_for =
      query.holiday_for === HOLIDAY_FOR_AGENT ||
      query.holiday_for === HOLIDAY_FOR_B2C
        ? query.holiday_for
        : null;

    const view_name =
      query.created_by === HOLIDAY_CREATED_BY_ADMIN
        ? VIEW_HOLIDAY_PACKAGE_CREATED_BY_ADMIN
        : VIEW_HOLIDAY_PACKAGE_CREATED_BY_AGENT;

    const schema = this.SERVICE_SCHEMA;

    const data = await this.db(`${view_name} as tp`)
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'tp.id',
        'tp.slug',
        'tp.title',
        'tp.duration',
        'tp.status',
        'tp.created_at',
        'tp.cities',
        'tp.holiday_type',
        'tp.holiday_for',
        this.db.raw(
          `
            (
                SELECT adult_price
                FROM ${this.SERVICE_SCHEMA}.holiday_package_pricing 
                WHERE holiday_package_id = tp.id
                ${price_for ? 'AND price_for = ?' : ''}
                ORDER BY id ASC
                LIMIT 1
            ) as price
        `,
          price_for ? [price_for] : []
        ),
        this.db.raw(`
            (
                SELECT (tp.images->0->>'image')
            ) as image
        `)
      )
      .where((qb) => {
        if (query.city_id) {
          qb.whereIn('tp.id', function () {
            this.select('hpc.holiday_package_id')
              .from(`${schema}.holiday_package_city as hpc`)
              .where('hpc.city_id', query.city_id);
          });
        }
        if (query.status !== undefined) {
          qb.andWhere('tp.status', query.status);
        }
        if (query.holiday_for) {
          if (
            query.holiday_for === HOLIDAY_FOR_AGENT ||
            query.holiday_for === HOLIDAY_FOR_B2C
          ) {
            qb.andWhere(function () {
              this.where('tp.holiday_for', query.holiday_for).orWhere(
                'tp.holiday_for',
                HOLIDAY_FOR_BOTH
              );
            });
          } else if (query.holiday_for === HOLIDAY_FOR_BOTH) {
            qb.andWhere('tp.holiday_for', HOLIDAY_FOR_BOTH);
          }
        }
        if (query.slug) {
          qb.andWhere('tp.slug', query.slug);
        }
        if (query.agency_id) {
          qb.andWhere('tp.agency_id', query.agency_id);
        }
      })
      .andWhere('tp.is_deleted', false)
      .orderBy('tp.id', 'desc')
      .limit(query.limit || 100)
      .offset(query.skip || 0);

    let total: any[] = [];
    if (is_total) {
      total = await this.db(`${view_name} as tp`)
        .withSchema(this.SERVICE_SCHEMA)
        .countDistinct('tp.id as total')
        .where((qb) => {
          if (query.city_id) {
            qb.whereIn('tp.id', function () {
              this.select('hpc.holiday_package_id')
                .from(`${schema}.holiday_package_city as hpc`)
                .where('hpc.city_id', query.city_id);
            });
          }
          if (query.status !== undefined) {
            qb.andWhere('tp.status', query.status);
          }
          if (query.holiday_for) {
            if (
              query.holiday_for === HOLIDAY_FOR_AGENT ||
              query.holiday_for === HOLIDAY_FOR_B2C
            ) {
              qb.andWhere(function () {
                this.where('tp.holiday_for', query.holiday_for).orWhere(
                  'tp.holiday_for',
                  HOLIDAY_FOR_BOTH
                );
              });
            } else if (query.holiday_for === HOLIDAY_FOR_BOTH) {
              qb.andWhere('tp.holiday_for', HOLIDAY_FOR_BOTH);
            }
          }
          if (query.slug) {
            qb.andWhere('tp.slug', query.slug);
          }
          if (query.agency_id) {
            qb.andWhere('tp.agency_id', query.agency_id);
          }
        })
        .andWhere('tp.is_deleted', false);
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  public async getSingleHolidayPackage(
    where: IGetSingleHolidayPackageParams
  ): Promise<IGetSingleHolidayPackageData | null> {
    const view_name =
      where.created_by === HOLIDAY_CREATED_BY_ADMIN
        ? VIEW_HOLIDAY_PACKAGE_CREATED_BY_ADMIN
        : VIEW_HOLIDAY_PACKAGE_CREATED_BY_AGENT;

    return await this.db(`${view_name} as tp`)
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'tp.id',
        'tp.slug',
        'tp.title',
        'tp.details',
        'tp.holiday_type',
        'tp.duration',
        'tp.valid_till_date',
        'tp.group_size',
        'tp.cancellation_policy',
        'tp.tax_details',
        'tp.general_condition',
        'tp.holiday_for',
        'tp.status',
        'tp.created_at',
        'tp.cities',
        'tp.pricing',
        'tp.itinerary',
        'tp.services',
        'tp.images'
      )
      .where((qb) => {
        if (where.id) {
          qb.andWhere('tp.id', where.id);
        }
        if (where.slug) {
          qb.andWhere('tp.slug', where.slug);
        }
        if (where.status !== undefined) {
          qb.andWhere('tp.status', where.status);
        }
        if (where.holiday_for) {
          if (
            where.holiday_for === HOLIDAY_FOR_AGENT ||
            where.holiday_for === HOLIDAY_FOR_B2C
          ) {
            qb.andWhere(function () {
              this.where('tp.holiday_for', where.holiday_for).orWhere(
                'tp.holiday_for',
                HOLIDAY_FOR_BOTH
              );
            });
          } else if (where.holiday_for === HOLIDAY_FOR_BOTH) {
            qb.andWhere('tp.holiday_for', HOLIDAY_FOR_BOTH);
          }
        }
        if (where.agency_id) {
          qb.andWhere('tp.agency_id', where.agency_id);
        }
      })
      .andWhere('tp.is_deleted', false)
      .first();
  }

  public async updateHolidayPackage(
    payload: IUpdateHolidayPackagePayload,
    id: number
  ) {
    return await this.db('holiday_package')
      .withSchema(this.SERVICE_SCHEMA)
      .update(payload)
      .where({ id });
  }
}
