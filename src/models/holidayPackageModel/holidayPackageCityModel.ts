import { TDB } from '../../features/public/utils/types/publicCommon.types';
import CustomError from '../../utils/lib/customError';
import Schema from '../../utils/miscellaneous/schema';
import StatusCode from '../../utils/miscellaneous/statusCode';
import { ICreateHolidayPackageCityPayload, IDeleteHolidayPackageCityPayload } from '../../utils/modelTypes/holidayPackageModelTypes/holidayPackageCityModelTypes';


export default class HolidayPackageCityModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async createHolidayPackageCity(
        payload: ICreateHolidayPackageCityPayload | ICreateHolidayPackageCityPayload[]
    ): Promise<{ id: number }[]> {
        try {
            const result = await this.db("holiday_package_city")
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload)
                .returning(["city_id"]);
            return result;
        } catch (error: any) {
            if (error.code === "23505") {
                throw new CustomError("City already exists", StatusCode.HTTP_CONFLICT);
            }
            throw error;
        }
    }


    public async deleteHolidayPackageCity(payload: IDeleteHolidayPackageCityPayload[]) {
        return await this.db("holiday_package_city")
            .withSchema(this.SERVICE_SCHEMA)
            .whereIn(["holiday_package_id", "city_id"], payload.map(p => [p.holiday_package_id, p.city_id]))
            .delete();
    }
}
