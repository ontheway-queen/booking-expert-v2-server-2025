import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { IGetHolidayPackageImage, IInsertHolidayPackageImagePayload, IUpdateHolidayPackageImagePayload } from '../../utils/modelTypes/holidayPackageModelTypes/holidayPackageImagesModelTypes';


export default class HolidayPackageImagesModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async insertHolidayPackageImages(payload: IInsertHolidayPackageImagePayload|IInsertHolidayPackageImagePayload[]): Promise<{ id: number }[]> {
        return await this.db("holiday_package_images")
            .withSchema(this.SERVICE_SCHEMA)
            .insert(payload, 'id');
    }

    public async updateHolidayPackageImages(payload: IUpdateHolidayPackageImagePayload, id: number) {
        return await this.db("holiday_package_images")
            .withSchema(this.SERVICE_SCHEMA)
            .update(payload)
            .where({ id });
    }

    public async deleteHolidayPackageImages(id: number|number[]) {
        return await this.db("holiday_package_images")
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

    public async getHolidayPackageImagesById(id: number|number[]): Promise<IGetHolidayPackageImage[]> {
        return await this.db("holiday_package_images")
            .withSchema(this.SERVICE_SCHEMA)
            .select("*")
            .where((qb) => {
                if (Array.isArray(id)) {
                    qb.whereIn('id', id);
                } else {
                    qb.where('id', id);
                }
            });
    }

}
