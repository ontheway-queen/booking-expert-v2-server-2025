import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { DATA_LIMIT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetBookingModelData,
  IGetBookingModelQuery,
  IInsertHotelBookingPayload,
  IInsertHotelBookingTravelerPayload,
} from '../../utils/modelTypes/hotelModelTypes/hotelBookingModelTypes';

export default class HotelBookingModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertHotelBooking(payload: IInsertHotelBookingPayload) {
    return await this.db('hotel_booking')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async insertHotelBookingTraveler(
    payload: IInsertHotelBookingTravelerPayload[]
  ) {
    return await this.db('hotel_booking_traveler')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  public async getHotelBooking(
    {
      source_type,
      filter,
      from_date,
      source_id,
      to_date,
      limit,
      skip,
      user_id,
    }: IGetBookingModelQuery,
    need_total: boolean = false
  ): Promise<IGetBookingModelData> {
    const data = await this.db('hotel_booking AS hb')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'hb.id',
        'hb.booking_ref',
        'hb.hotel_code',
        'hb.hotel_name',
        'hb.sell_price',
        'hb.checkin_date',
        'hb.checkout_date',
        'hb.status',
        'hb.finalized',
        'hb.created_at'
      )
      .where((qb) => {
        if (from_date && to_date) {
          qb.andWhereBetween('hb.created_at', [from_date, to_date]);
        }

        if (source_type !== 'ALL') {
          qb.andWhere('hb.source_type', source_type);
        }

        if (source_id) {
          qb.andWhere('hb.source_id', source_id);
        }

        if (user_id) {
          qb.andWhere('hb.user_id', user_id);
        }

        if (filter) {
          qb.andWhere((qqb) => {
            qqb
              .orWhere('hb.booking_ref', filter)
              .orWhere('hb.confirmation_no', filter)
              .orWhere('hb.supplier_ref', filter);
          });
        }
      })
      .limit(limit ? Number(limit) : DATA_LIMIT)
      .offset(skip ? Number(skip) : 0)
      .orderBy('hb.created_at', 'desc');

    let total: any = undefined;

    if (need_total) {
      total = await this.db('hotel_booking AS hb')
        .withSchema(this.DBO_SCHEMA)
        .count('hb.id AS total')
        .where((qb) => {
          if (from_date && to_date) {
            qb.andWhereBetween('hb.created_at', [from_date, to_date]);
          }

          if (source_type !== 'ALL') {
            qb.andWhere('hb.source_type', source_type);
          }

          if (source_id) {
            qb.andWhere('hb.source_id', source_id);
          }

          if (user_id) {
            qb.andWhere('hb.user_id', user_id);
          }

          if (filter) {
            qb.andWhere((qqb) => {
              qqb
                .orWhere('hb.booking_ref', filter)
                .orWhere('hb.confirmation_no', filter)
                .orWhere('hb.supplier_ref', filter);
            });
          }
        })
        .first();
    }

    return {
      data,
      total: total?.total,
    };
  }

  public async getSingleBooking() {}
}
