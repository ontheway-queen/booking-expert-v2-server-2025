import AbstractServices from "../../../../abstract/abstract.service";
import { Request } from 'express';

export class AgentB2CSubConfigService extends AbstractServices {

    public async getB2CMarkup(req: Request) {
        const { agency_id } = req.agencyUser;
        const model = this.Model.AgencyModel();
        const data = await model.getAgentB2CMarkup(agency_id);
        if (!data) {
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "No markup has been set for B2C",
                data: {}
            }
        }
        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            data
        }
    }

    public async upsertB2CMarkup(req: Request) {
        const { agency_id } = req.agencyUser;
        const model = this.Model.AgencyModel();
        const data = await model.getAgentB2CMarkup(agency_id);
        if (data) {
            await model.updateAgentB2CMarkup(
                req.body,
                agency_id
            );
        } else {
            await model.createAgentB2CMarkup(
                { agency_id, ...req.body }
            )
        }

        return{
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: "Markup has been updated for B2C"
        }
    }
}