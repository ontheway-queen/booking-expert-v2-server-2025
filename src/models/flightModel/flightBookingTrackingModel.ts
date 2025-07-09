import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetFlightBookingTrackingData,
  IGetFlightBookingTrackingListFilterQuery,
  IInsertFlightBookingTrackingPayload,
} from '../../utils/modelTypes/flightModelTypes/flightBookingTrackingModelTypes';

export default class FlightBookingTrackingModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertFlightBookingTracking(
    payload:
      | IInsertFlightBookingTrackingPayload
      | IInsertFlightBookingTrackingPayload[]
  ): Promise<{ id: number }[]> {
    return await this.db('flight_booking_tracking')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async getFlightBookingTracking(
    query: IGetFlightBookingTrackingListFilterQuery,
    is_total: boolean = false
  ): Promise<{ data: IGetFlightBookingTrackingData[]; total?: number }> {
    const { flight_booking_id, limit, skip } = query;
    const data = await this.db('flight_booking_tracking')
      .withSchema(this.DBO_SCHEMA)
      .select('id', 'description', 'created_at')
      .where({ flight_booking_id })
      .limit(limit || 100)
      .offset(skip || 0);

    let total: any[] = [];
    if (is_total) {
      total = await this.db('flight_booking_tracking')
        .withSchema(this.DBO_SCHEMA)
        .count('id as total')
        .where({ flight_booking_id });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  public async deleteFlightBookingTracking({
    flight_booking_id,
    tracking_id,
  }: {
    flight_booking_id?: number;
    tracking_id?: number;
  }) {
    await this.db('flight_booking_tracking')
      .withSchema(this.DBO_SCHEMA)
      .delete()
      .where((qb) => {
        if (flight_booking_id) {
          qb.andWhere('flight_booking_id', flight_booking_id);
        }
        if (tracking_id) {
          qb.andWhere('id', tracking_id);
        }
      });
  }
}
