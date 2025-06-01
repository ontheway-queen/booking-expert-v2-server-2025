import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
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
}
