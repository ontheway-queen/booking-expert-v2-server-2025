import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminAccountsService } from '../services/adminAccounts.service';
import { AdminAccountsValidator } from '../utils/validators/adminAccounts.validator';

export default class AdminAccountsController extends AbstractController {
  private service = new AdminAccountsService();
  private validator = new AdminAccountsValidator();
  constructor() {
    super();
  }

  public getAccounts = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAccounts },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAccounts(req);
      res.status(code).json(data);
    }
  );

  public updateAccounts = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateAccounts,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAccounts(req);
      res.status(code).json(data);
    }
  );

  public createAccounts = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createAccounts,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAccounts(req);
      res.status(code).json(data);
    }
  );

  public deleteAccounts = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteAccounts(req);
      res.status(code).json(data);
    }
  );
}
