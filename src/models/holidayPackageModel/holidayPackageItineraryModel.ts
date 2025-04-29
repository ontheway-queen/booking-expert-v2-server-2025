import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { IGetHolidayPackageItinerary, IInsertHolidayPackageItineraryPayload, IUpdateHolidayPackageItineraryPayload } from '../../utils/modelTypes/holidayPackageModelTypes/holidayPackageItineraryModelTypes';


export default class HolidayPackageItineraryModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async insertHolidayPackageItinerary(payload: IInsertHolidayPackageItineraryPayload | IInsertHolidayPackageItineraryPayload[]): Promise<{ id: number }[]> {
        return await this.db("holiday_package_itinerary")
            .withSchema(this.SERVICE_SCHEMA)
            .insert(payload, 'id');
    }

    public async updateHolidayPackageItinerary(payload: IUpdateHolidayPackageItineraryPayload, id: number) {
        return await this.db("holiday_package_itinerary")
            .withSchema(this.SERVICE_SCHEMA)
            .update(payload)
            .where({ id });
    }

    public async deleteHolidayPackageItinerary(id: number | number[]) {
        return await this.db("holiday_package_itinerary")
            .withSchema(this.SERVICE_SCHEMA)
            .delete()
            .where((qb) => {
                if (Array.isArray(id)) {
                    qb.whereIn('id', id);
                } else {
                    qb.where('id', id);
                }
            });
    }

}
