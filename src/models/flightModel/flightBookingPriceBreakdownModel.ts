import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetFlightBookingPriceBreakdownData,
  IInsertFlightBookingPriceBreakdownPayload,
} from '../../utils/modelTypes/flightModelTypes/flightBookingPriceBreakdownModelTypes';

export default class FlightBookingPriceBreakdownModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertFlightBookingPriceBreakdown(
    payload:
      | IInsertFlightBookingPriceBreakdownPayload
      | IInsertFlightBookingPriceBreakdownPayload[]
  ): Promise<{ id: number }[]> {
    return await this.db('flight_booking_price_breakdown')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async getFlightBookingPriceBreakdown(
    flight_booking_id: number
  ): Promise<IGetFlightBookingPriceBreakdownData[]> {
    return await this.db('flight_booking_price_breakdown')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'id',
        'type',
        'total_passenger',
        'base_fare',
        'tax',
        'ait',
        'discount',
        'total_fare'
      )
      .where({ flight_booking_id });
  }
  public async deleteFlightBookingPriceBreakdown(flight_booking_id: number) {
    return await this.db('flight_booking_price_breakdown')
      .withSchema(this.DBO_SCHEMA)
      .delete()
      .where({ flight_booking_id });
  }
}
