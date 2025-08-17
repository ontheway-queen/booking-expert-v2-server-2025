import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AgentB2CVisaService } from '../services/agentB2CVisa.service';
import { AgentB2CVisaValidator } from '../utils/validators/agentB2CVisa.validator';

export class AgentB2CVisaController extends AbstractController {
  private service = new AgentB2CVisaService();
  private validator = new AgentB2CVisaValidator();

  public getAllVisaList = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getAllVisaListQuerySchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAllVisaList(req);
      res.status(code).json(rest);
    }
  );

  public getSingleVisa = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamStringValidator('slug'),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleVisa(req);
      res.status(code).json(rest);
    }
  );

  public createVisaApplication = this.asyncWrapper.wrap(
    {
      paramSchema:this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.createVisaValidatorSchema,
    },
    async(req: Request, res: Response) => {
      const { code, ...rest } = await this.service.createVisaApplication(req);
      res.status(code).json(rest);
    }
  )
}
