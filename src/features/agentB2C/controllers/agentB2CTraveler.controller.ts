import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import AgentB2CTravelerService from '../services/agentB2CTraveler.service';
import AgentB2CTravelerValidator from '../utils/validators/agentB2CTraveler.validator';

export class AgentB2CTravelerController extends AbstractController {
  private service = new AgentB2CTravelerService();
  private validator = new AgentB2CTravelerValidator();
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
