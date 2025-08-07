import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AgentB2CConfigService } from '../services/agentB2CConfig.service';

export default class AgentB2CConfigController extends AbstractController {
  private service = new AgentB2CConfigService();
  constructor() {
    super();
  }

  public GetHomePageData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.GetHomePageData(req);
      res.status(code).json(rest);
    }
  );

  public GetAboutUsPageData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.GetAboutUsPageData(req);
      res.status(code).json(rest);
    }
  );

  public GetContactUsPageData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.GetContactUsPageData(req);
      res.status(code).json(rest);
    }
  );

  public GetPrivacyPolicyPageData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.GetPrivacyPolicyPageData(
        req
      );
      res.status(code).json(rest);
    }
  );
}
