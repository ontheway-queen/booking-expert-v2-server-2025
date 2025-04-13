import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import AdminProfileService from '../services/adminProfile.service';
import AdminProfileValidator from '../utils/validators/adminProfile.validator';

export default class AdminProfileController extends AbstractController {
  private service = new AdminProfileService();
  private validator = new AdminProfileValidator();
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
