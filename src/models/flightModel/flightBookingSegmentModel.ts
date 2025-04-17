import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { IGetFlightBookingSegmentData, IInsertFlightBookingSegmentPayload } from '../../utils/modelTypes/flightModelTypes/flightBookingSegmentModelType';


export default class FlightBookingSegmentModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async insertFlightBookingSegment(payload: IInsertFlightBookingSegmentPayload): Promise<{ id: number }[]> {
        return await this.db("flight_booking_segment")
            .withSchema(this.DBO_SCHEMA)
            .insert(payload, 'id');
    }

    public async getFlightBookingSegment(flight_booking_id: number): Promise<IGetFlightBookingSegmentData[]>{
        return await this.db("flight_booking_segment")
        .withSchema(this.DBO_SCHEMA)
        .select("*")
        .where({flight_booking_id});
    }
}
