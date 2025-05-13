import { TDB } from '../../features/public/utils/types/publicCommon.types';
import { SOURCE_AGENT } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';
import { ICreateADMManagementPayload, IGetADMManagementData, IGetADMManagementQueryFilter, IGetSingleADMManagementParams, IUpdateADMManagementPayload } from '../../utils/modelTypes/paymentModelTypes/admManagementModelTypes';


export default class ADMManagementModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }


    public async createADMManagement(payload: ICreateADMManagementPayload) {
        return await this.db("adm_management")
            .withSchema(this.DBO_SCHEMA)
            .insert(payload, 'id');
    }

    public async updateADMmanagement(payload: IUpdateADMManagementPayload, id: number) {
        return await this.db("adm_management")
            .withSchema(this.DBO_SCHEMA)
            .update(payload)
            .where({ id });
    }

    public async getADMManagementList(
        query: IGetADMManagementQueryFilter, is_total: boolean = false
    ): Promise<{ data: IGetADMManagementData[], total?: number }> {

        const view = query.adm_for === SOURCE_AGENT ? "adm_management_agent" : "adm_management_b2c";
        const data = await this.db(`${view}`)
            .withSchema(this.DBO_SCHEMA)
            .select("*")
            .where((qb) => {
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween("created_by", [query.from_date, query.to_date]);
                }
                if (query.filter) {
                    qb.andWhere((qbc) => {
                        qbc.whereILike("ref_no", `${query.filter}%`)
                        qbc.orWhereILike("booking_ref", `${query.filter}%`)
                        qbc.orWhereILike("source_name", `%${query.filter}%`)
                    });
                }
                if (query.agency_id) {
                    qb.andWhere("source_id", query.agency_id);
                }
            })
            .orderBy("id", "desc")
            .limit(query.limit || 100)
            .offset(query.skip || 0)

        let total: any[] = [];

        if (is_total) {
            total = await this.db(`${view}`)
                .withSchema(this.DBO_SCHEMA)
                .count("id as total")
                .where((qb) => {
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween("created_by", [query.from_date, query.to_date]);
                    }
                    if (query.filter) {
                        qb.andWhere((qbc) => {
                            qbc.whereILike("ref_no", `${query.filter}%`)
                            qbc.orWhereILike("booking_ref", `${query.filter}%`)
                            qbc.orWhereILike("source_name", `%${query.filter}%`)
                        });
                    }
                    if (query.agency_id) {
                        qb.andWhere("source_id", query.agency_id);
                    }
                })
        }

        return {
            data,
            total: total[0]?.total
        }
    }

    public async getSingleADMManagementData(
        params: IGetSingleADMManagementParams
    ): Promise<IGetADMManagementData> {

        const view = params.adm_for === SOURCE_AGENT ? "adm_management_agent" : "adm_management_b2c";
        return await this.db(`${view}`)
            .withSchema(this.DBO_SCHEMA)
            .select("*")
            .where((qb) => {
                if (params.id) {
                    qb.andWhere("id", params.id);
                }
            })
            .first();
    }

    public async deleteADMmanagement(id: number) {
        return await this.db("adm_management")
            .withSchema(this.DBO_SCHEMA)
            .delete()
            .where({ id });
    }
}
