import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import B2CProfileValidator from '../utils/validators/b2cProfile.validator';
import B2CProfileService from '../services/b2cProfile.service';

export default class B2CProfileController extends AbstractController {
  private service = new B2CProfileService();
  private validator = new B2CProfileValidator();
  constructor() {
    super();
  }

  //get profile
  public getProfile = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getProfile(req);
      res.status(code).json(data);
    }
  );

  //update profile
  public updateProfile = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateProfileSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateProfile(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public changePassword = this.asyncWrapper.wrap(
    { bodySchema: this.validator.changePassword },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.changePassword(req);
      res.status(code).json(data);
    }
  );
}
