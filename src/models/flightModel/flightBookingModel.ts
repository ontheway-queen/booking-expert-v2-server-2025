import { TDB } from '../../features/public/utils/types/publicCommon.types';
import {
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
  SOURCE_B2C,
  SOURCE_SUB_AGENT,
} from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import {
  IFlightBookingCheckPayload,
  IGetFlightBookingList,
  IGetFlightBookingListFilterQuery,
  IGetSingleFlightBookingData,
  IGetSingleFlightBookingParams,
  IInsertFlightBookingPayload,
  IUpdateFlightBookingPayload,
} from '../../utils/modelTypes/flightModelTypes/flightBookingModelTypes';

export default class FlightBookingModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertFlightBooking(
    payload: IInsertFlightBookingPayload
  ): Promise<{ id: number }[]> {
    return await this.db('flight_booking')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async getFlightBookingList(
    query: IGetFlightBookingListFilterQuery,
    is_total: boolean = false
  ): Promise<{ data: IGetFlightBookingList[]; total?: number }> {
    const view_name =
      query.booked_by === SOURCE_AGENT
        ? 'view_flight_booking_by_agent'
        : query.booked_by === SOURCE_SUB_AGENT
        ? 'view_flight_booking_by_agent'
        : query.booked_by === SOURCE_AGENT_B2C
        ? 'view_flight_booking_by_agent_b2c'
        : query.booked_by === SOURCE_B2C
        ? 'view_flight_booking_by_b2c'
        : undefined;
    const data = await this.db(`${view_name}`)
      .withSchema(this.DBO_SCHEMA)
      .select(
        'id',
        'booking_ref',
        'source_type',
        'source_id',
        'source_name',
        'source_logo',
        'api',
        'created_at',
        'travel_date',
        'gds_pnr',
        'journey_type',
        'total_passenger',
        'status',
        'payable_amount',
        'route'
      )
      .where((qb) => {
        if (query.status) {
          qb.andWhere('status', query.status);
        }
        if (query.from_date && query.to_date) {
          qb.andWhereBetween('created_at', [query.from_date, query.to_date]);
        }
        if (query.filter) {
          qb.andWhere((qbc) => {
            qbc.whereILike('booking_ref', `${query.filter}%`);
            qbc.orWhereILike('gds_pnr', `${query.filter}`),
              qbc.orWhereILike('source_name', `%${query.filter}%`);
          });
        }
        if (query.source_id) {
          qb.andWhere('source_id', query.source_id);
        }
        if (query.created_by) {
          qb.andWhere('created_by', query.created_by);
        }
      })
      .orderBy('id', 'desc')
      .limit(query.limit || 100)
      .offset(query.skip || 0);

    let total: any[] = [];
    if (is_total) {
      total = await this.db(`${view_name}`)
        .withSchema(this.DBO_SCHEMA)
        .count('id as total')
        .where((qb) => {
          if (query.status) {
            qb.andWhere('status', query.status);
          }
          if (query.from_date && query.to_date) {
            qb.andWhereBetween('created_at', [query.from_date, query.to_date]);
          }
          if (query.filter) {
            qb.andWhere((qbc) => {
              qbc.whereILike('booking_ref', `${query.filter}%`);
              qbc.orWhereILike('gds_pnr', `${query.filter}`);
              qbc.orWhereILike('source_name', `%${query.filter}%`);
            });
          }
          if (query.source_id) {
            qb.andWhere('source_id', query.source_id);
          }
          if (query.created_by) {
            qb.andWhere('created_by', query.created_by);
          }
        });
    }
    return {
      data,
      total: total[0]?.total,
    };
  }

  public async getSingleFlightBooking(
    where: IGetSingleFlightBookingParams
  ): Promise<IGetSingleFlightBookingData | null> {
    const { id, booked_by, agency_id, user_id } = where;
    const view_name =
      booked_by === SOURCE_AGENT
        ? 'view_flight_booking_by_agent'
        : booked_by === SOURCE_SUB_AGENT
        ? 'view_flight_booking_by_agent'
        : booked_by === SOURCE_AGENT_B2C
        ? 'view_flight_booking_by_agent_b2c'
        : booked_by === SOURCE_B2C
        ? 'view_flight_booking_by_b2c'
        : undefined;
    return await this.db(`${view_name}`)
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        qb.andWhere({ id });
        if (agency_id) {
          qb.andWhere('source_id', agency_id);
        }
        if (user_id) {
          qb.andWhere('created_by', user_id);
        }
      })
      .first();
  }

  public async updateFlightBooking(
    payload: IUpdateFlightBookingPayload,
    id: number
  ) {
    return await this.db('flight_booking')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async checkFlightBooking(
    payload: IFlightBookingCheckPayload
  ): Promise<number> {
    const db = this.db;

    const query = db('flight_booking as fb')
      .withSchema(this.DBO_SCHEMA)
      .join('flight_booking_segment as fs', 'fs.flight_booking_id', 'fb.id')
      .join('flight_booking_traveler as fbt', 'fbt.flight_booking_id', 'fb.id')
      .countDistinct('fb.id as total')
      .where({
        'fb.route': payload.route,
        'fs.departure_date': payload.departure_date,
        'fs.flight_number': payload.flight_number,
      });

    // Handle status filter (single or array)
    if (Array.isArray(payload.status)) {
      query.whereIn('fb.status', payload.status);
    } else {
      query.where('fb.status', payload.status);
    }

    // Build passenger matching conditions
    query.andWhere(function () {
      const passengerConditions = this.where(false); // Start with false for OR chaining

      payload.passengers.forEach((passenger) => {
        const passengerQuery = {
          'fbt.first_name': passenger.first_name,
          'fbt.last_name': passenger.last_name,
        };

        const identifierConditions: any[] = [];

        if (passenger.passport) {
          identifierConditions.push(
            db.raw(
              '(fbt.passport_number IS NOT NULL AND fbt.passport_number = ?)',
              [passenger.passport]
            )
          );
        }
        if (passenger.email) {
          identifierConditions.push(
            db.raw('(fbt.email IS NOT NULL AND fbt.email = ?)', [
              passenger.email,
            ])
          );
        }
        if (passenger.phone) {
          identifierConditions.push(
            db.raw('(fbt.phone IS NOT NULL AND fbt.phone = ?)', [
              passenger.phone,
            ])
          );
        }

        // Combine passenger name + any identifier
        passengerConditions.orWhere(function () {
          this.where(passengerQuery);

          if (identifierConditions.length > 0) {
            this.andWhere(function () {
              for (const condition of identifierConditions) {
                this.orWhere(condition);
              }
            });
          }
        });
      });
    });

    const result = await query.first();
    return Number(result?.total ?? 0);
  }
}
