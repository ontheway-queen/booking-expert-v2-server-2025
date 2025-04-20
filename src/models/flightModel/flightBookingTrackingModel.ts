import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { IGetFlightBookingTrackingData, IInsertFlightBookingTrackingPayload } from '../../utils/modelTypes/flightModelTypes/flightBookingTrackingModelTypes';


export default class FlightBookingTrackingModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async insertFlightBookingTracking(payload: IInsertFlightBookingTrackingPayload | IInsertFlightBookingTrackingPayload[]): Promise<{ id: number }[]> {
        return await this.db("flight_booking_tracking")
            .withSchema(this.DBO_SCHEMA)
            .insert(payload, 'id');
    }

    public async getFlightBookingTracking(flight_booking_id: number): Promise<IGetFlightBookingTrackingData[]>{
        return await this.db("flight_booking_tracking")
        .withSchema(this.DBO_SCHEMA)
        .select("*")
        .where({flight_booking_id});
    }
}
