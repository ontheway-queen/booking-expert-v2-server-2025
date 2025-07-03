import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import AdminDynamicFareSetService from '../services/adminDynamicFareSet.service';
import { AdminDynamicFareSetValidator } from '../utils/validators/adminDynamicFareSet.validator';

export default class AdminDynamicFareSetController extends AbstractController {
  private service = new AdminDynamicFareSetService();
  private validator = new AdminDynamicFareSetValidator();

  constructor() {
    super();
  }
  public createSet = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createSet },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createSet(req);
      res.status(code).json(data);
    }
  );

  public getSets = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSets(req);
      res.status(code).json(data);
    }
  );

  public updateSet = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateSet,
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSet(req);
      res.status(code).json(data);
    }
  );

  public deleteSet = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteSet(req);
      res.status(code).json(data);
    }
  );

  public getSupplierList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSupplierList(req);
      res.status(code).json(data);
    }
  );
}
