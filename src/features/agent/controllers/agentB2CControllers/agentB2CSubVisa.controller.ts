import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AgentB2CSubVisaService } from '../../services/agentB2CServices/agentB2CSubVisa.service';
import { AgentB2CSubVisaValidator } from '../../utils/validators/agentB2CValidators/agentB2CSubVisa.validator';

export class AgentB2CSubVisaController extends AbstractController {
  private service = new AgentB2CSubVisaService();
  private validator = new AgentB2CSubVisaValidator();

  public createVisa = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createVisaValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.createVisa(req);
      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );
}
