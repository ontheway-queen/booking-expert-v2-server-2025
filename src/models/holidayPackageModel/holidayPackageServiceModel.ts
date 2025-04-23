import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { IInsertHolidayPackageServicePayload, IUpdateHolidayPackageServicePayload } from '../../utils/modelTypes/holidayPackageModelTypes/holidayPackageServiceModelTypes';


export default class HolidayPackageServiceModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async insertHolidayPackageService(payload: IInsertHolidayPackageServicePayload|IInsertHolidayPackageServicePayload[]): Promise<{ id: number }[]> {
        return await this.db("holiday_package_service")
            .withSchema(this.SERVICE_SCHEMA)
            .insert(payload, 'id');
    }

    public async updateHolidayPackageService(payload: IUpdateHolidayPackageServicePayload, id: number) {
        return await this.db("holiday_package_service")
            .withSchema(this.SERVICE_SCHEMA)
            .update(payload)
            .where({ id });
    }

    public async deleteHolidayPackageService(id: number|number[]) {
        return await this.db("holiday_package_service")
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
