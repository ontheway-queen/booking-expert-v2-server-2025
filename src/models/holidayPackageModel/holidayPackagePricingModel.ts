import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { IGetHolidayPackagePricingList, IGetHolidayPackagePricingListFilterQuery, IInsertHolidayPackagePricingPayload, IUpdateHolidayPackagePricingPayload } from '../../utils/modelTypes/holidayPackageModelTypes/holidayPackagePricingModelTypes';


export default class HolidayPackagePricingModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async insertHolidayPackagePricing(payload: IInsertHolidayPackagePricingPayload | IInsertHolidayPackagePricingPayload[]): Promise<{ id: number }[]> {
        return await this.db("holiday_package_pricing")
            .withSchema(this.SERVICE_SCHEMA)
            .insert(payload, 'id');
    }

    public async getHolidayPackagePricingList(
        query: IGetHolidayPackagePricingListFilterQuery
    ): Promise<IGetHolidayPackagePricingList[]> {
        return await this.db("holiday_package_pricing")
            .withSchema(this.SERVICE_SCHEMA)
            .select("*")
            .where((qb) => {
                
                qb.where("holiday_package_id", query.holiday_package_id);

                if (query.price_for) {
                    qb.where("price_for", query.price_for);
                }
            });
    }

    public async updateHolidayPackagePricing(payload: IUpdateHolidayPackagePricingPayload, id: number) {
        return await this.db("holiday_package_pricing")
            .withSchema(this.SERVICE_SCHEMA)
            .update(payload)
            .where({ id });
    }

    public async deleteHolidayPackagePricing(id: number | number[]) {
        return await this.db("holiday_package_pricing")
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
