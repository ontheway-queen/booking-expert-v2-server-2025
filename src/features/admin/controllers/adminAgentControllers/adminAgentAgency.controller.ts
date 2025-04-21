import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import AdminAgentAgencyService from '../../services/adminAgentServices/adminAgentAgency.service';
import AdminAgentAgencyValidator from '../../utils/validators/adminAgentAgency.validator';

export default class AdminAgentAgencyController extends AbstractController {
  private services = new AdminAgentAgencyService();
  private validator = new AdminAgentAgencyValidator();
  constructor() {
    super();
  }

  public getAgency = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAgencySchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getAgency(req);
      res.status(code).json(rest);
    }
  );

  public getSingleAgency = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator('id') },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getSingleAgency(req);
      res.status(code).json(rest);
    }
  );
}
