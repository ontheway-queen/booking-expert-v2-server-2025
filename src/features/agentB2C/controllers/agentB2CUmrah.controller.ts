import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import AgentB2CUmrahService from '../services/agentB2CUmrah.service';
import { AgentB2CUmrahValidator } from '../utils/validators/agentB2CUmrah.validator';

export class AgentB2CUmrahController extends AbstractController {
  private service = new AgentB2CUmrahService();
  private validator = new AgentB2CUmrahValidator();
  constructor() {
    super();
  }

  public getUmrahPackages = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getUmrahPackages(req);
      res.status(code).json(rest);
    }
  );

  public getSingleUmrahPackages = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator('slug') },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleUmrahPackages(req);
      res.status(code).json(rest);
    }
  );

  public bookUmrahPackage = this.asyncWrapper.wrap(
    { bodySchema: this.validator.umrahBooking },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleUmrahPackages(req);
      res.status(code).json(rest);
    }
  );

  public getUmrahBookingList = this.asyncWrapper.wrap(
    { querySchema: this.validator.getUmrahBooking },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getUmrahPackagesBooking(req);
      res.status(code).json(rest);
    }
  );

  public getSingleUmrahBooking = this.asyncWrapper.wrap(
    { querySchema: this.validator.getUmrahBooking },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleUmrahBooking(req);
      res.status(code).json(rest);
    }
  );
}
