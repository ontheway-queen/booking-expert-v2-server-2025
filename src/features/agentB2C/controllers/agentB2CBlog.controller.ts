import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { AgentB2CBlogService } from "../services/agentB2CBlog.service";

export class AgentB2CBlogController extends AbstractController {
    private controller = new AgentB2CBlogService()

    public getBlogList = this.asyncWrapper.wrap(
        null,
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.controller.getBlogList(req);
            res.status(code).json(data);
        }
    )


    public getSingleBlog = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamStringValidator('slug'),
        },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.controller.getSingleBlog(req);
            res.status(code).json(data);
        }
    )
}