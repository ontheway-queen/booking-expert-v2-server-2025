import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import AuthValidator from '../utils/validators/authValidator';
import AuthSubAgentService from '../services/authSubAgent.service';

export default class AuthSubAgentController extends AbstractController {
  private service = new AuthSubAgentService();
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
    { bodySchema: this.validator.agencyRegisterValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.register(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public registerComplete = this.asyncWrapper.wrap(
    { bodySchema: this.validator.agencyRegisterCompleteValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.registerComplete(req);
      res.status(code).json(data);
    }
  );

  public login2FA = this.asyncWrapper.wrap(
    { bodySchema: this.validator.login2FAValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.login2FA(req);
      res.status(code).json(data);
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
