import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AgentB2CSubUmrahService } from '../../services/agentB2CServices/agentB2CSubUmrah.service';
import { AgentB2CSubUmrahValidator } from '../../utils/validators/agentB2CValidators/agentB2CSubUmrah.validator';

export class AgentB2CSubUmrahController extends AbstractController {
  private services = new AgentB2CSubUmrahService();
  private validator = new AgentB2CSubUmrahValidator();

  public createUmrahPackage = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createUmrahSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.createUmrahPackage(req);
      res.status(code).json(data);
    }
  );
}
