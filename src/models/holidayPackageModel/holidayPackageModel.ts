import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { IGetSingleFlightBookingData } from '../../utils/modelTypes/flightModelTypes/flightBookingModelTypes';
import { IDeleteHolidayPackagePayload, IGetSingleHolidayPackageParams, IGetHolidayPackageList, IGetHolidayPackageListFilterQuery, IInsertHolidayPackagePayload, IUpdateHolidayPackagePayload } from '../../utils/modelTypes/holidayPackageModelTypes/holidayPackageModelTypes';


export default class HolidayPackageModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async insertHolidayPackage(payload: IInsertHolidayPackagePayload): Promise<{ id: number }[]> {
        return await this.db("holiday_package")
            .withSchema(this.SERVICE_SCHEMA)
            .insert(payload, 'id');
    }

    public async getHolidayPackageList(
        query: IGetHolidayPackageListFilterQuery,
        is_total: boolean = false
    ): Promise<{ data: IGetHolidayPackageList[]; total?: number }> {
        const data = await this.db("holiday_package as tp")
            .withSchema(this.SERVICE_SCHEMA)
            .select(
                "tp.id",
                "tp.slug",
                "tp.title",
                "c.name as city",
                "cn.name as country",
                "tp.holiday_type",
                "tp.holiday_for",
                "tp.duration",
                "tp.status",
                "tp.created_at",
                this.db.raw(`(
                  SELECT image FROM ?? 
                  WHERE holiday_package_id = tp.id 
                  ORDER BY id ASC 
                  LIMIT 1
                ) as image`, [`${this.SERVICE_SCHEMA}.holiday_package_images`]),
                this.db.raw(`(
                  SELECT adult_price FROM ?? 
                  WHERE holiday_package_id = tp.id
                  ${query.holiday_for ? "AND price_for = ?" : ""}
                  ORDER BY id ASC 
                  LIMIT 1
                ) as price`, [
                    `${this.SERVICE_SCHEMA}.holiday_package_pricing`,
                    ...(query.holiday_for ? [query.holiday_for] : [])
                ])
            )
            .joinRaw(
                `left join ${this.PUBLIC_SCHEMA}.city as c on c.id = tp.city_id`
            )
            .joinRaw(
                `left join ${this.PUBLIC_SCHEMA}.country as cn on cn.id = c.country_id`
            )
            .where((qb) => {
                if (query.city_id) {
                    qb.andWhere("tp.city_id", query.city_id);
                }
                if (query.status !== undefined) {
                    qb.andWhere("tp.status", query.status);
                }
                if (query.holiday_for) {
                    qb.andWhere("tp.Holiday_for", query.holiday_for);
                }
                if (query.slug) {
                    qb.andWhere("tp.slug", query.slug);
                }
            })
            .andWhere("tp.is_deleted", false)
            .orderBy("tp.id", "desc")
            .limit(query.limit || 100)
            .offset(query.skip || 0);

        let total: any[] = [];
        if (is_total) {
            total = await this.db("holiday_package as tp")
                .withSchema(this.SERVICE_SCHEMA)
                .count(
                    "tp.id as total"
                )
                .where((qb) => {
                    if (query.city_id) {
                        qb.andWhere("tp.city_id", query.city_id);
                    }
                    if (query.status !== undefined) {
                        qb.andWhere("tp.status", query.status);
                    }
                    if (query.holiday_for) {
                        qb.andWhere("tp.Holiday_for", query.holiday_for);
                    }
                    if (query.slug) {
                        qb.andWhere("tp.slug", query.slug);
                    }
                })
                .andWhere("tp.is_deleted", false)
        }

        return {
            data,
            total: total[0]?.total
        }
    }

    public async getSingleHolidayPackage(where: IGetSingleHolidayPackageParams): Promise<IGetSingleFlightBookingData> {
        return await this.db("holiday_package as tp")
            .withSchema(this.SERVICE_SCHEMA)
            .select(
                "tp.id",
                "tp.slug",
                "tp.city_id",
                "c.name as city",
                "cn.name as country",
                "tp.title",
                "tp.details",
                "tp.holiday_type",
                "tp.duration",
                "tp.valid_till_date",
                "tp.group_size",
                "tp.cancellation_policy",
                "tp.tax_details",
                "tp.general_condition",
                "tp.holiday_for",
                "tp.status",
                "tp.created_at",
                this.db.raw(`COALESCE(json_agg(DISTINCT tpp.*) FILTER (WHERE tpp.id IS NOT NULL), '[]') as pricing`),
                this.db.raw(`COALESCE(json_agg(DISTINCT tpi.*) FILTER (WHERE tpi.id IS NOT NULL), '[]') as itinerary`),
                this.db.raw(`COALESCE(json_agg(DISTINCT tps.*) FILTER (WHERE tps.id IS NOT NULL), '[]') as services`),
                this.db.raw(`COALESCE(json_agg(DISTINCT tpim.*) FILTER (WHERE tpim.id IS NOT NULL), '[]') as images`)
            )
            .joinRaw(
                `left join ${this.PUBLIC_SCHEMA}.city as c on c.id = tp.city_id`
            )
            .joinRaw(
                `left join ${this.PUBLIC_SCHEMA}.country as cn on cn.id = c.country_id`
            )
            .leftJoin("holiday_package_pricing as tpp", "tp.id", "tpp.holiday_package_id")
            .leftJoin("holiday_package_itinerary as tpi", "tp.id", "tpi.holiday_package_id")
            .leftJoin("holiday_package_service as tps", "tp.id", "tps.holiday_package_id")
            .leftJoin("holiday_package_images as tpim", "tp.id", "tpim.holiday_package_id")
            .where((qb) => {
                if (where.id) {
                    qb.andWhere("tp.id", where.id);
                }
                if (where.slug) {
                    qb.andWhere("tp.slug", where.slug);
                }
                if (where.status !== undefined) {
                    qb.andWhere("tp.status", where.status);
                }
            })
            .andWhere("tp.is_deleted", false)
            .groupBy(
                "tp.id",
                "tp.slug",
                "tp.city_id",
                "c.name",
                "cn.name",
                "tp.title",
                "tp.details",
                "tp.holiday_type",
                "tp.duration",
                "tp.valid_till_date",
                "tp.group_size",
                "tp.cancellation_policy",
                "tp.tax_details",
                "tp.general_condition",
                "tp.holiday_for",
                "tp.status",
                "tp.created_at"
              )
            .first();
    }

    public async updateHolidayPackage(payload: IUpdateHolidayPackagePayload, id: number) {
        return await this.db("holiday_package")
            .withSchema(this.SERVICE_SCHEMA)
            .update(payload)
            .where({ id });
    }

    public async deleteHolidayPackage(payload: IDeleteHolidayPackagePayload, id: number) {
        return await this.db("holiday_package")
            .withSchema(this.SERVICE_SCHEMA)
            .update(payload)
            .where({ id });
    }

}
