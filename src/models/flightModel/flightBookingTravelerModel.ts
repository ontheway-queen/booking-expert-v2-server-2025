import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetFlightBookingTravelerData,
  IInsertFlightBookingTravelerPayload,
  IUpdateFlightBookingTravelerPayload,
} from '../../utils/modelTypes/flightModelTypes/flightBookingTravelerModelTypes';

export default class FlightBookingTravelerModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertFlightBookingTraveler(
    payload:
      | IInsertFlightBookingTravelerPayload
      | IInsertFlightBookingTravelerPayload[]
  ): Promise<{ id: number }[]> {
    return await this.db('flight_booking_traveler')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async getFlightBookingTraveler(
    flight_booking_id: number
  ): Promise<IGetFlightBookingTravelerData[]> {
    return await this.db('flight_booking_traveler')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where({ flight_booking_id });
  }

  public async deleteFlightBookingTraveler({
    flight_booking_id,
    traveler_id,
  }: {
    flight_booking_id?: number;
    traveler_id?: number;
  }): Promise<IGetFlightBookingTravelerData[]> {
    return await this.db('flight_booking_traveler')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        if (flight_booking_id) {
          qb.andWhere({ flight_booking_id });
        }
        if (traveler_id) {
          qb.andWhere('id', traveler_id);
        }
      });
  }

  public async updateFlightBookingTraveler(
    payload: IUpdateFlightBookingTravelerPayload,
    id: number
  ) {
    return await this.db('flight_booking_traveler')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }
}
