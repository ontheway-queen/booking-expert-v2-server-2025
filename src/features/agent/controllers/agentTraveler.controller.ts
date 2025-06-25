import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AgentTravelerService } from '../services/agentTraveler.service';
import { AgentTravelerValidator } from '../utils/validators/agentTraveler.validator';

export class AgentTravelerController extends AbstractController {
  private service = new AgentTravelerService();
  private validator = new AgentTravelerValidator();
  constructor() {
    super();
  }

  public createTraveler = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.create,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.createTraveler(req);
      res.status(code).json(rest);
    }
  );

  public getAllTraveler = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAllTraveler(req);
      res.status(code).json(rest);
    }
  );

  public getSingleTraveler = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleTraveler(req);
      res.status(code).json(rest);
    }
  );

  public updateTraveler = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.update,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.updateTraveler(req);
      res.status(code).json(rest);
    }
  );

  public deleteTraveler = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.deleteTraveler(req);
      res.status(code).json(rest);
    }
  );
}
