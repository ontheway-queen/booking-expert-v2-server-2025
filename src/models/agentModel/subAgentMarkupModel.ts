import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { ICreateSubAgentMarkupPayload, IGetSubAgencyMarkupData, IUpdateSubAgencyMarkupPayload } from '../../utils/modelTypes/agentModel/subAgentMarkupModelTypes';


export default class SubAgentMarkupModel extends Schema {
    private db: TDB;

    constructor(db: TDB) {
        super();
        this.db = db;
    }

    public async createSubAgentMarkup(payload: ICreateSubAgentMarkupPayload) {
        return await this.db('sub_agent_markup')
            .withSchema(this.AGENT_SCHEMA)
            .insert(payload);
    }


    public async updateSubAgentMarkup(payload: IUpdateSubAgencyMarkupPayload, agency_id: number) {
        return await this.db('sub_agent_markup')
            .withSchema(this.AGENT_SCHEMA)
            .update(payload)
            .where('agency_id', agency_id);
    }

    public async getSubAgentMarkup(agency_id: number): Promise<IGetSubAgencyMarkupData | null> {
        return await this.db("sub_agent_markup")
            .withSchema(this.AGENT_SCHEMA)
            .select("*")
            .where({ agency_id })
            .first();
    }
}
