import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { ICreateMarkupSetPayload, IGetMarkupListFilterQuery, IGetMarkupSetData, IUpdateMarkupSetPayload } from '../../utils/modelTypes/markupSetModelTypes/markupSetModelTypes';

export default class MarkupSetModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async createMarkupSet(payload: ICreateMarkupSetPayload): Promise<{ id: number }[]> {
        return await this.db('markup_set')
            .withSchema(this.DBO_SCHEMA)
            .insert(payload, 'id');
    }


    public async getAllMarkupSet(
        query: IGetMarkupListFilterQuery
    ): Promise<IGetMarkupSetData[]> {
        const data = await this.db('markup_set')
            .withSchema(this.DBO_SCHEMA)
            .select('*')
            .where((qb) => {
                if (query.name) {
                    qb.andWhereILike('name', `%${query.name}%`);
                }
                if (query.check_name) {
                    qb.andWhere('name', query.check_name);
                }
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
            });

        return data;
    }

    public async getSingleMarkupSet(id: number, status?: boolean): Promise<IGetMarkupSetData> {
        return await this.db('markup_set')
            .withSchema(this.DBO_SCHEMA)
            .select('*')
            .where((qb) => {
                qb.andWhere({ id });

                if (status !== undefined) {
                    qb.andWhere('status', status);
                }
            })
            .first();
    }

    public async updateMarkupSet(payload: IUpdateMarkupSetPayload, id: number) {
        return await this.db('markup_set')
            .withSchema(this.DBO_SCHEMA)
            .update(payload)
            .where({ id });
    }

    public async deleteMarkupSet(id: number) {
        return await this.db('markup_set')
            .withSchema(this.DBO_SCHEMA)
            .delete()
            .where({ id });
    }
}
