import AbstractServices from "../../../../abstract/abstract.service";
import { Request } from "express";
import { IUpdateAgentB2CUsersReqBody } from "../../utils/types/agentB2CTypes/agentB2CSubUsers.types";
export class AgentB2CSubUsersService extends AbstractServices {

    public async getAllUsers(req: Request) {
        const { agency_id } = req.agencyUser;
        const agencyB2CModel = this.Model.AgencyB2CUserModel();
        const query = req.query;
        const data = await agencyB2CModel.getUserList({
            agency_id,
            ...query
        }, true);

        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            total: data.total,
            data: data.data
        }
    }

    public async getSingleUser(req: Request) {
        const { agency_id } = req.agencyUser;
        const { id } = req.params;

        const agentB2CModel = this.Model.AgencyB2CUserModel();
        const data = await agentB2CModel.getSingleUser(
            Number(id),
            agency_id
        );
        if (!data) {
            return {
                success: false,
                code: this.StatusCode.HTTP_NOT_FOUND,
                message: this.ResMsg.HTTP_NOT_FOUND
            }
        }

        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            data
        }
    }

    public async updateUser(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { agency_id } = req.agencyUser;
            const { id } = req.params;

            const agentB2CModel = this.Model.AgencyB2CUserModel(trx);
            const data = await agentB2CModel.getSingleUser(
                Number(id),
                agency_id
            );
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                }
            }

            const body = req.body as IUpdateAgentB2CUsersReqBody;
            await agentB2CModel.updateUser(body, Number(id), agency_id);

            return{
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Profile has been updated"
            }
        });
    }
}