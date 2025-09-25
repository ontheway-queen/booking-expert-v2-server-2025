import { TDB } from '../../features/public/utils/types/publicCommon.types';
import {
  SOURCE_AGENT_B2C,
  SOURCE_B2C,
  SOURCE_SUB_AGENT,
} from '../../utils/miscellaneous/constants';
import {
  VIEW_HOLIDAY_PACKAGE_BOOKING_BY_AGENT,
  VIEW_HOLIDAY_PACKAGE_BOOKING_BY_AGENT_B2C,
  VIEW_HOLIDAY_PACKAGE_BOOKING_BY_B2C,
  VIEW_HOLIDAY_PACKAGE_BOOKING_BY_SUB_AGENT,
} from '../../utils/miscellaneous/holidayConstants';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetHolidayPackageBookingList,
  IGetHolidayPackageBookingListFilterQuery,
  IGetSingleHolidayPackageBookingData,
  IInsertHolidayPackageBookingPayload,
  ISingleHolidayPackageBookingFilterParams,
  IUpdateHolidayPackageBookingPayload,
} from '../../utils/modelTypes/holidayPackageModelTypes/holidayPackageBookingModelTypes';

export default class HolidayPackageBookingModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertHolidayBooking(
    payload: IInsertHolidayPackageBookingPayload
  ): Promise<{ id: number }[]> {
    return await this.db('holiday_package_booking')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  public async getHolidayBookingList(
    query: IGetHolidayPackageBookingListFilterQuery,
    is_total: boolean = false
  ): Promise<{ data: IGetHolidayPackageBookingList[]; total?: number }> {
    const view_name =
      query.source_type === SOURCE_B2C
        ? VIEW_HOLIDAY_PACKAGE_BOOKING_BY_B2C
        : query.source_type === SOURCE_AGENT_B2C
        ? VIEW_HOLIDAY_PACKAGE_BOOKING_BY_AGENT_B2C
        : query.source_type === SOURCE_SUB_AGENT
        ? VIEW_HOLIDAY_PACKAGE_BOOKING_BY_SUB_AGENT
        : VIEW_HOLIDAY_PACKAGE_BOOKING_BY_AGENT;

    const data = await this.db(`${view_name} as hb`)
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'hb.id',
        'hb.booking_ref',
        'hb.holiday_package_title',
        'hb.source_type',
        'hb.source_name',
        'hb.total_adult',
        'hb.total_child',
        'hb.total_price',
        'hb.travel_date',
        'hb.created_at',
        'hb.status'
      )
      .where((qb) => {
        if (query.status) {
          if (Array.isArray(query.status)) {
            qb.whereIn('hb.status', query.status);
          } else {
            qb.andWhere('hb.status', query.status);
          }
        }

        if (query.from_date && query.to_date) {
          qb.andWhereBetween('hb.created_at', [query.from_date, query.to_date]);
        }

        if (query.filter) {
          qb.andWhere((qbc) => {
            qbc
              .whereILike('hb.booking_ref', `${query.filter}%`)
              .orWhereILike('source_name', `${query.filter}%`);
          });
        }

        if (query.source_id) {
          qb.andWhere('hb.source_id', query.source_id);
        }

        if (query.user_id) {
          qb.andWhere('hb.user_id', query.user_id);
        }

        if (query.holiday_package_id) {
          qb.andWhere('hb.holiday_package_id', query.holiday_package_id);
        }
      })
      .orderBy('hb.id', 'desc')
      .limit(query.limit || 100)
      .offset(query.skip || 0);

    let total: any[] = [];
    if (is_total) {
      total = await this.db(`${view_name} as hb`)
        .withSchema(this.SERVICE_SCHEMA)
        .count('hb.id as total')
        .where((qb) => {
          if (query.status) {
            if (Array.isArray(query.status)) {
              qb.whereIn('hb.status', query.status);
            } else {
              qb.andWhere('hb.status', query.status);
            }
          }
          if (query.from_date && query.to_date)
            qb.andWhereBetween('hb.created_at', [
              query.from_date,
              query.to_date,
            ]);

          if (query.filter) {
            qb.andWhere((qbc) => {
              qbc
                .whereILike('hb.booking_ref', `${query.filter}%`)
                .orWhereILike('source_name', `${query.filter}%`);
            });
          }
          if (query.source_id) qb.andWhere('hb.source_id', query.source_id);
          if (query.user_id) qb.andWhere('hb.user_id', query.user_id);
          if (query.holiday_package_id)
            qb.andWhere('hb.holiday_package_id', query.holiday_package_id);
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  public async getSingleHolidayBooking(
    where: ISingleHolidayPackageBookingFilterParams
  ): Promise<IGetSingleHolidayPackageBookingData | null> {
    const view_name =
      where.booked_by === SOURCE_B2C
        ? VIEW_HOLIDAY_PACKAGE_BOOKING_BY_B2C
        : where.booked_by === SOURCE_AGENT_B2C
        ? VIEW_HOLIDAY_PACKAGE_BOOKING_BY_AGENT_B2C
        : where.booked_by === SOURCE_SUB_AGENT
        ? VIEW_HOLIDAY_PACKAGE_BOOKING_BY_SUB_AGENT
        : VIEW_HOLIDAY_PACKAGE_BOOKING_BY_AGENT;

    return await this.db(`${view_name} as hb`)
      .withSchema(this.SERVICE_SCHEMA)
      .select('*')
      .where((qb) => {
        qb.andWhere('hb.id', where.id);
        if (where.source_id) qb.andWhere('hb.source_id', where.source_id);
        if (where.user_id) qb.andWhere('hb.user_id', where.user_id);
      })
      .first();
  }

  public async updateHolidayBooking(
    payload: IUpdateHolidayPackageBookingPayload,
    id: number
  ) {
    return await this.db('holiday_package_booking')
      .withSchema(this.SERVICE_SCHEMA)
      .update(payload)
      .where({ id });
  }
}
