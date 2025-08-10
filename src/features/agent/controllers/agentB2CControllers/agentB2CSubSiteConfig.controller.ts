import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AgentB2CSubSiteConfigService } from '../../services/agentB2CServices/agentB2CSubSiteConfig.service';
import { AgentB2CSubSiteConfigValidator } from '../../utils/validators/agentB2CValidators/agentB2CSubSiteConfig.validator';

export class AgentB2CSubSiteConfigController extends AbstractController {
  private service = new AgentB2CSubSiteConfigService();
  private validator = new AgentB2CSubSiteConfigValidator();

  constructor() {
    super();
  }

  public updateSiteConfig = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateSiteConfig },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSiteConfig(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getSiteConfigData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSiteConfigData(req);
      res.status(code).json(data);
    }
  );

  public getAboutUsData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAboutUsData(req);
      res.status(code).json(data);
    }
  );

  public updateAboutUsData = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateAboutUs },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAboutUsData(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getContactUsData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getContactUsData(req);
      res.status(code).json(data);
    }
  );

  public updateContactUsData = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateContactUs },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateContactUsData(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getPrivacyPolicyData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getPrivacyPolicyData(req);
      res.status(code).json(data);
    }
  );

  public updatePrivacyPolicyData = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updatePrivacyPolicy },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updatePrivacyPolicyData(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getTermsAndConditionsData = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getTermsAndConditionsData(
        req
      );
      res.status(code).json(data);
    }
  );

  public updateTermsAndConditions = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateTermsAndConditions },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateTermsAndConditions(
        req
      );
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getSocialLinks = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSocialLinks(req);
      res.status(code).json(data);
    }
  );

  public deleteSocialLinks = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteSocialLinks(req);
      res.status(code).json(data);
    }
  );

  public createSocialLinks = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createSocialLinks },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createSocialLinks(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public updateSocialLinks = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateSocialLinks,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSocialLinks(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getPopUpBanner = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getPopUpBanner(req);
      res.status(code).json(data);
    }
  );

  public upSertPopUpBanner = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.upSertPopUpBanner,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.upSertPopUpBanner(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );
}
