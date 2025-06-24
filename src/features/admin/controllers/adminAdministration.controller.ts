import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminAdministrationService } from '../services/adminAdministration.service';
import AdminAdministrationValidator from '../utils/validators/adminAdministration.validator';

export default class AdminAdministrationController extends AbstractController {
  private validator = new AdminAdministrationValidator();
  private service = new AdminAdministrationService();
  constructor() {
    super();
  }

  public createRole = this.asyncWrapper.wrap(
    { querySchema: this.validator.createRole },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createRole(req);
      res.status(code).json(data);
    }
  );

  public getRoleList = this.asyncWrapper.wrap(
    { querySchema: this.validator.getRoleList },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getRoleList(req);
      res.status(code).json(data);
    }
  );

  public getSingleRoleWithPermissions = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleRolePermission(req);
      res.status(code).json(data);
    }
  );

  public updateRolePermissions = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateRolePermissions,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateRolePermissions(req);
      res.status(code).json(data);
    }
  );

  public createAdmin = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createAdmin,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAdmin(req);

      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getAllAdmin = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getAllAdmin,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAdmin(req);

      res.status(code).json(data);
    }
  );

  public getSingleAdmin = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleAdmin(req);

      res.status(code).json(data);
    }
  );

  public updateAdmin = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateAdmin,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAdmin(req);

      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );
}
