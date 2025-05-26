import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { IGetSingleTravelerParams, IGetTravelerDataFilterQuery, IInsertTravelerPayload, ITraveler, IUpdateTravelerPayload } from '../../utils/modelTypes/travelerModelTypes/travelerModelTypes';


export default class TravelerModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async insertTraveler(payload: IInsertTravelerPayload | IInsertTravelerPayload[]): Promise<{ id: number }[]> {
        return await this.db("travelers")
            .withSchema(this.DBO_SCHEMA)
            .insert(payload, 'id');
    }

    public async getTravelerList(query: IGetTravelerDataFilterQuery,
        is_total: boolean = false
    ): Promise<{ data: ITraveler[]; total?: number }> {
        const data = await this.db("travelers")
            .withSchema(this.DBO_SCHEMA)
            .select(
                "*"
            )
            .where((qb) => {
                if (query.source_type) {
                    qb.andWhere("source_type", query.source_type);
                }
                if (query.source_id) {
                    qb.andWhere("source_id", query.source_id);
                }
                if (query.created_by) {
                    qb.andWhere("created_by", query.created_by);
                }
                if (query.type) {
                    qb.andWhere("type", query.type);
                }
            })
            .orderBy("id", "desc")
            .limit(query.limit || 100)
            .offset(query.skip || 0);

        let total: any[] = [];
        if (is_total) {
            total = await this.db("travelers")
                .withSchema(this.DBO_SCHEMA)
                .count("id as total")
                .where((qb) => {
                    if (query.source_type) {
                        qb.andWhere("source_type", query.source_type);
                    }
                    if (query.source_id) {
                        qb.andWhere("source_id", query.source_id);
                    }
                    if (query.created_by) {
                        qb.andWhere("created_by", query.created_by);
                    }
                    if (query.type) {
                        qb.andWhere("type", query.type);
                    }
                });
        }
        return {
            data,
            total: total[0]?.total
        };

    }

    public async getSingleTraveler(
        where: IGetSingleTravelerParams
    ): Promise<ITraveler | null> {
        return await this.db("travelers")
            .withSchema(this.DBO_SCHEMA)
            .select(
                "*"
            )
            .withSchema(this.DBO_SCHEMA)
            .select(
                "*"
            )
            .where((qb) => {
                if (where.source_type) {
                    qb.andWhere("source_type", where.source_type);
                }
                if (where.source_id) {
                    qb.andWhere("source_id", where.source_id);
                }
                if (where.created_by) {
                    qb.andWhere("created_by", where.created_by);
                }
                if (where.id) {
                    qb.andWhere("id", where.id);
                }
            })
            .first();
    }

    public async updateTraveler(payload: IUpdateTravelerPayload, id: number) {
        return await this.db("travelers")
            .withSchema(this.DBO_SCHEMA)
            .update(payload)
            .where({ id });
    }

    public async deleteTraveler(id: number) {
        return await this.db("travelers")
            .withSchema(this.DBO_SCHEMA)
            .delete()
            .where({ id });
    }
}
