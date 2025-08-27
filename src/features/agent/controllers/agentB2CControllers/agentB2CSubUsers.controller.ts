import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AgentB2CSubUsersService } from '../../services/agentB2CServices/agentB2CSubUsers.service';
import { AgentB2CSubUsersValidator } from '../../utils/validators/agentB2CValidators/agentB2CSubUsers.validator';

export default class AgentB2CSubUsersController extends AbstractController {
  private validator = new AgentB2CSubUsersValidator();
  private service = new AgentB2CSubUsersService();
  constructor() {
    super();
  }

  public getAllUsers = this.asyncWrapper.wrap(
    { querySchema: this.validator.getB2CUsersFilterQuery },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllUsers(req);
      res.status(code).json(data);
    }
  );

  public getSingleUser = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleUser(req);
      res.status(code).json(data);
    }
  );

  public updateUser = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateB2CUser },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateUser(req);
      res.status(code).json(data);
    }
  );
}
