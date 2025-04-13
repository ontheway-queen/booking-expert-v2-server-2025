import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { ICreateMarkupSetFlightApiPayload, IGetMarkupSetFlightApiData, IGetMarkupSetFlightApiListFilterQuery, IUpdateMarkupSetFlightApiPayload } from '../../utils/modelTypes/markupSetModelTypes/markupSetFlightApiTypes';


export default class MarkupSetFlightApiModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async createMarkupSetFlightApi(payload: ICreateMarkupSetFlightApiPayload): Promise<{ id: number }[]> {
        return await this.db('markup_set_flight_api')
            .withSchema(this.DBO_SCHEMA)
            .insert(payload, 'id');
    }


    public async getMarkupSetFlightApi(
        query: IGetMarkupSetFlightApiListFilterQuery
    ): Promise<IGetMarkupSetFlightApiData[]> {
        const data = await this.db('markup_set_flight_api as msf')
            .withSchema(this.DBO_SCHEMA)
            .select('msf.id', 'msf.status', 'msf.flight_api_id as api_id', 'fa.api as api_name', 'fa.logo as api_logo')
            .leftJoin('flight_api as fa', 'msf.flight_api_id', 'fa.id')
            .where((qb) => {
                qb.andWhere('msf.markup_set_id', query.markup_set_id);
                if (query.id) {
                    qb.andWhere('msf.id', query.id);
                }
                if (query.flight_api_id) {
                    qb.andWhere('msf.flight_api_id', query.flight_api_id);
                }
                if (query.status !== undefined) {
                    qb.andWhere('msf.status', query.status);
                }
                if (query.api_name) {
                    qb.andWhere('fa.api', query.api_name);
                }
            })
            .orderBy('msf.id', 'desc');

        return data;
    }

    public async updateMarkupSetFlightApi(payload: IUpdateMarkupSetFlightApiPayload, id: number) {
        return await this.db('markup_set_flight_api')
            .withSchema(this.DBO_SCHEMA)
            .update(payload)
            .where({ id });
    }

    public async deleteMarkupSetFlightApi(id: number) {
        return await this.db('markup_set_flight_api')
            .withSchema(this.DBO_SCHEMA)
            .delete()
            .where({ id });
    }

}
