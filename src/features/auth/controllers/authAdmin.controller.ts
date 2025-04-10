import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import AuthAdminService from '../services/authAdmin.service';
import AuthValidator from '../utils/validators/authValidator';

export default class AuthAdminController extends AbstractController {
  private service = new AuthAdminService();
  private validator = new AuthValidator();
  constructor() {
    super();
  }

  public login = this.asyncWrapper.wrap(
    { bodySchema: this.validator.loginValidator },
    async (req: Request, res: Response) => {
      // const { code, ...data } = await this.service.createRole(req);
      // res.status(code).json(data);
    }
  );
}
