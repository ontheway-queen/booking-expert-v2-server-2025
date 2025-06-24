import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AgentAdministrationService } from '../services/agentAdministration.service';
import AgentAdministrationValidator from '../utils/validators/agentAdministration.validator';

export default class AgentAdministrationController extends AbstractController {
  private validator = new AgentAdministrationValidator();
  private service = new AgentAdministrationService();
  constructor() {
    super();
  }

  public createRole = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createRole },
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

  public getPermissionsList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getPermissionsList(req);
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

  public createUser = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createAgencyUser,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAgencyUser(req);

      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getAllAgencyUsers = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getAllAgencyUsers,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAgentUserList(req);

      res.status(code).json(data);
    }
  );

  public getSingleAgencyUser = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleAgencyUser(req);

      res.status(code).json(data);
    }
  );

  public updateAgencyUser = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateAgencyUser,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAgencyUser(req);

      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );
}
