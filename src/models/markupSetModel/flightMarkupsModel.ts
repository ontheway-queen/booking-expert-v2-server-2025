import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { ICreateFlightMarkupsPayload, IGetApiActiveAirlinesData, IGetFlightMarkupsData, IGetFlightMarkupsListFilterQuery, IUpdateFlightMarkupsPayload } from '../../utils/modelTypes/markupSetModelTypes/flightMarkupsTypes';

export default class FlightMarkupsModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async createFlightMarkups(payload: ICreateFlightMarkupsPayload | ICreateFlightMarkupsPayload[]): Promise<number[]> {
        return await this.db('flight_markups')
            .withSchema(this.DBO_SCHEMA)
            .insert(payload, 'id');
    }

    public async getAllFlightMarkups(
        query: IGetFlightMarkupsListFilterQuery,
        is_total: boolean = false
    ): Promise<{ data: IGetFlightMarkupsData[]; total?: number }> {
        const data = await this.db('flight_markups as fm')
            .withSchema(this.DBO_SCHEMA)
            .select(
                'fm.id as key',
                'fm.airline',
                'airlines.name AS airline_name',
                'airlines.logo AS airline_logo',
                'fm.markup_domestic',
                'fm.markup_from_dac',
                'fm.markup_to_dac',
                'fm.markup_soto',
                'fm.markup_type',
                'fm.markup_mode',
                'fm.status',
                'cad.name AS created_by',
                'uad.name AS updated_by',
                'fm.updated_at as last_updated_at',
                'fa.api_name',
                'fa.api_logo'
            )
            .joinRaw('left join ?? on ?? = ??', [
                `${this.ADMIN_SCHEMA}.user_admin AS cad`,
                'fm.created_by',
                'cad.id',
            ])
            .joinRaw('left join ?? on ?? = ??', [
                `${this.ADMIN_SCHEMA}.user_admin AS uad`,
                'fm.updated_by',
                'uad.id',
            ])
            .leftJoin('set_flight_api_view AS fa', 'fm.set_flight_api_id', 'fa.id')
            .leftJoin('airlines', 'fm.airline', 'airlines.code')
            .where((qb) => {
                if (query.api_status) {
                    qb.andWhere('fa.status', query.api_status);
                }
                if (query.markup_set_flight_api_id) {
                    qb.andWhere('fm.markup_set_flight_api_id', query.markup_set_flight_api_id);
                }
                if (query.airline) {
                    qb.andWhere('fm.airline', query.airline);
                }
                if (query.status !== undefined) {
                    qb.andWhere('fm.status', query.status);
                }
            })
            .limit(query.limit ? Number(query.limit) : 100)
            .offset(query.skip ? Number(query.skip) : 0);

        let total: any[] = [];

        if (is_total) {
            total = await this.db('flight_markups as fm')
                .withSchema(this.DBO_SCHEMA)
                .count(
                    'fm.id as total'
                )
                .leftJoin('flight_api AS fa', 'fm.set_flight_api_id', 'fa.id')
                .where((qb) => {
                    if (query.api_status) {
                        qb.andWhere('fa.status', query.api_status);
                    }
                    if (query.markup_set_flight_api_id) {
                        qb.andWhere('fm.markup_set_flight_api_id', query.markup_set_flight_api_id);
                    }
                    if (query.airline) {
                        qb.andWhere('fm.airline', query.airline);
                    }
                    if (query.status !== undefined) {
                        qb.andWhere('fm.status', query.status);
                    }
                });
        }

        return {
            data,
            total: total[0]?.total,
        }
    }

    public async getAPIActiveAirlines(markup_set_flight_api_id: number): Promise<IGetApiActiveAirlinesData[]> {
        return await this.db('flight_markups')
            .withSchema(this.DBO_SCHEMA)
            .select('airline as Code')
            .where({ markup_set_flight_api_id })
            .andWhere({ status: true });
    }

    public async updateFlightMarkups(payload: IUpdateFlightMarkupsPayload, id: number) {
        return await this.db('flight_markups')
            .withSchema(this.DBO_SCHEMA)
            .update(payload)
            .where({ id });
    }

    public async deleteFlightMarkups(id: number) {
        return await this.db('flight_markups')
            .withSchema(this.DBO_SCHEMA)
            .delete()
            .where({ id });
    }
}
