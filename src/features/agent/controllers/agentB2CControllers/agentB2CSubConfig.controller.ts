import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AgentB2CSubConfigService } from '../../services/agentB2CServices/agentB2CSubConfig.service';
import { AgentB2CSubConfigValidator } from '../../utils/validators/agentB2CValidators/agentB2CSubConfig.validator';

export default class AgentB2CSubConfigController extends AbstractController {
    private validator = new AgentB2CSubConfigValidator();
    private service = new AgentB2CSubConfigService();
    constructor() {
        super();
    }

    public getB2CMarkup = this.asyncWrapper.wrap(
        null,
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.getB2CMarkup(req);
            res.status(code).json(data);
        }
    );

    public upsertB2CMarkup = this.asyncWrapper.wrap(
        { bodySchema: this.validator.upsertB2CMarkup },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.upsertB2CMarkup(req);
            res.status(code).json(data);
        }
    );


}
