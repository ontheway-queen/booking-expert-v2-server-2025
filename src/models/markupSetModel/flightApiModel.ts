import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { IGetFlightApiData, IGetFlightApiListFilterQuery } from '../../utils/modelTypes/markupSetModelTypes/flightApiTypes';

export default class FlightApiModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async getFlightApi(
        query: IGetFlightApiListFilterQuery
    ): Promise<IGetFlightApiData[]> {
        const data = await this.db('flight_api')
            .withSchema(this.DBO_SCHEMA)
            .select('*')
            .where((qb) => {
                if (query.id) {
                    qb.andWhere('id', query.id);
                }
            });

        return data;
    }
}
