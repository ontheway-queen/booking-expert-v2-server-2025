import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import SubAgentProfileService from '../services/subAgentProfile.service';
import SubAgentProfileValidator from '../utils/validator/subAgentProf.validator';

export default class SubAgentProfileController extends AbstractController {
  private service = new SubAgentProfileService();
  private validator = new SubAgentProfileValidator();
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

  public getDashboardData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getDashboardData(req);
      res.status(code).json(data);
    }
  );

  public searchData = this.asyncWrapper.wrap(
    { querySchema: this.validator.searchDataSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.searchData(req);
      res.status(code).json(data);
    }
  );
}
