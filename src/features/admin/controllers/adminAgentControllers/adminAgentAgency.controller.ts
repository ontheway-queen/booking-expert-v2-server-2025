import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import AdminAgentAgencyService from '../../services/adminAgentServices/adminAgentAgency.service';
import AdminAgentAgencyValidator from '../../utils/validators/adminAgentValidators/adminAgentAgency.validator';

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
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getSingleAgency(req);
      res.status(code).json(rest);
    }
  );

  public updateAgencyApplication = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator('id'),
      bodySchema: this.validator.updateAgencyApplication,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateAgencyApplication(
        req
      );
      res.status(code).json(rest);
    }
  );

  public updateAgency = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator('id'),
      bodySchema: this.validator.updateAgency,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateAgency(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  public agencyLogin = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.agencyLogin(req);
      res.status(code).json(rest);
    }
  );

  public createAgency = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createAgency },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.createAgency(req);
      res.status(code).json(rest);
    }
  );
}
