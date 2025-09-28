import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import AgentSubAgentService from '../services/subAgentServices/agentSubAgent.service';
import { AgentSubAgentValidator } from '../utils/validators/agentSubAgent.validator';

export class AgentSubAgentController extends AbstractController {
  private service = new AgentSubAgentService();
  private validator = new AgentSubAgentValidator();
  constructor() {
    super();
  }

  public createSubAgency = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createSubAgencySchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.createSubAgency(req);
      res.status(code).json(rest);
    }
  );

  public getAllSubAgency = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getSubAgencyQuerySchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAllSubAgency(req);
      res.status(code).json(rest);
    }
  );

  public getSingleSubAgency = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleSubAgency(req);
      res.status(code).json(rest);
    }
  );

  public updateAgency = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateSubAgencySchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.updateAgency(req);
      res.status(code).json(rest);
    }
  );

  public getAllUsersOfAgency = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      querySchema: this.validator.getSubAgencyUsersQuerySchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAllUsersOfAgency(req);
      res.status(code).json(rest);
    }
  );

  public updateAgencyUser = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.multipleParamsNumValidator([
        'agency_id',
        'user_id',
      ]),
      bodySchema: this.validator.updateAgencyUser,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.updateAgencyUser(req);
      res.status(code).json(rest);
    }
  );
}
