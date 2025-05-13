
import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { IGetErrorLogsList, IGetErrorLogsListFilterQuery, IInsertErrorLogsPayload } from '../../utils/modelTypes/errorLogsModelTypes/errorLogsModelTypes';



export default class ErrorLogsModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async insertErrorLogs(payload: IInsertErrorLogsPayload): Promise<{ id: number }[]> {
        return await this.db("error_logs")
            .withSchema(this.DBO_SCHEMA)
            .insert(payload, 'id');
    }

    public async getErrorLogs(query: IGetErrorLogsListFilterQuery): Promise<{ data: IGetErrorLogsList[], total: number }> {
        const data = await this.db("error_logs")
            .withSchema(this.DBO_SCHEMA)
            .select("*")
            .where((qb) => {
                if (query.level) {
                    qb.andWhere("level", "ilike", query.level);
                }
                if (query.search) {
                    qb.andWhere("message", "ilike", `%${query.search}%`);
                }
            })
            .orderBy("id", "desc")
            .limit(query.limit || 50)
            .offset(query.skip || 0);

        const total = await this.db("error_logs")
            .withSchema(this.DBO_SCHEMA)
            .count("id as total");

        return { data, total: Number(total?.[0]?.total) };
    }

    public async deleteErrorLogs(id: number) {
        return await this.db("error_logs")
            .withSchema(this.DBO_SCHEMA)
            .delete()
            .where({ id });
    }
}
