import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import AuthValidator from '../utils/validators/authValidator';
import AuthAgentService from '../services/authAgent.service';
import AuthAgentB2CService from '../services/authAgentB2C.service';

export default class AuthAgentB2CController extends AbstractController {
  private service = new AuthAgentB2CService();
  private validator = new AuthValidator();
  constructor() {
    super();
  }

  public login = this.asyncWrapper.wrap(
    { bodySchema: this.validator.loginValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.login(req);
      res.status(code).json(data);
    }
  );

  public register = this.asyncWrapper.wrap(
    { bodySchema: this.validator.agentB2CRegister },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.register(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public resetPassword = this.asyncWrapper.wrap(
    { bodySchema: this.validator.resetPasswordValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.resetPassword(req);
      res.status(code).json(data);
    }
  );
}
