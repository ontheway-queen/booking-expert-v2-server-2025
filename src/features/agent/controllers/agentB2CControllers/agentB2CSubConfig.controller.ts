import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AgentB2CSubConfigService } from '../../services/agentB2CServices/agentB2CSubConfig.service';
import { AgentB2CSubConfigValidator } from '../../utils/validators/agentB2CValidators/agentB2CSubConfig.validator';

export default class AgentB2CSubConfigController extends AbstractController {
  private validator = new AgentB2CSubConfigValidator();
  private service = new AgentB2CSubConfigService();
  constructor() {
    super();
  }

  public getB2CMarkup = this.asyncWrapper.wrap(null, async (req: Request, res: Response) => {
    const { code, ...data } = await this.service.getB2CMarkup(req);
    res.status(code).json(data);
  });

  public upsertB2CMarkup = this.asyncWrapper.wrap(
    { bodySchema: this.validator.upsertB2CMarkup },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.upsertB2CMarkup(req);
      res.status(code).json(data);
    }
  );

  public getAccounts = this.asyncWrapper.wrap(null, async (req: Request, res: Response) => {
    const { code, ...data } = await this.service.getAccounts(req);
    res.status(code).json(data);
  });

  public updateAccounts = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateAccounts,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAccounts(req);
      res.status(code).json(data);
    }
  );

  public createAccounts = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createAccounts,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAccounts(req);
      res.status(code).json(data);
    }
  );

  public deleteAccounts = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteAccounts(req);
      res.status(code).json(data);
    }
  );

  public getHeroBGContent = this.asyncWrapper.wrap(null, async (req: Request, res: Response) => {
    const { code, ...data } = await this.service.getHeroBGContent(req);
    res.status(code).json(data);
  });

  public createHeroBGContent = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createHeroBGContent },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createHeroBGContent(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public updateHeroBGContent = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateHeroBGContent,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateHeroBGContent(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public deleteHeroBGContent = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteHeroBGContent(req);
      res.status(code).json(data);
    }
  );

  public getPopularDestination = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getPopularDestination(req);
      res.status(code).json(data);
    }
  );

  public createPopularDestination = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createPopularDestination },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createPopularDestination(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public updatePopularDestination = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updatePopularDestination,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updatePopularDestination(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public deletePopularDestination = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deletePopularDestination(req);
      res.status(code).json(data);
    }
  );

  public getPopularPlace = this.asyncWrapper.wrap(null, async (req: Request, res: Response) => {
    const { code, ...data } = await this.service.getPopularPlace(req);
    res.status(code).json(data);
  });

  public createPopularPlace = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createPopularPlace },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createPopularPlace(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public updatePopularPlace = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updatePopularPlace,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updatePopularPlace(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public deletePopularPlace = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deletePopularPlace(req);
      res.status(code).json(data);
    }
  );

  public getHotDeals = this.asyncWrapper.wrap(null, async (req: Request, res: Response) => {
    const { code, ...data } = await this.service.getHotDeals(req);
    res.status(code).json(data);
  });

  public createHotDeals = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createHotDeals },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createHotDeals(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public updateHotDeals = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateHotDeals,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateHotDeals(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public deleteHotDeals = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteHotDeals(req);
      res.status(code).json(data);
    }
  );

  public createVisaType = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createVisaType },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createVisaType(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getAllVisaType = this.asyncWrapper.wrap(null, async (req: Request, res: Response) => {
    const { code, ...data } = await this.service.getAllVisaType(req);
    res.status(code).json(data);
  });

  public deleteVisaType = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteVisaType(req);
      res.status(code).json(data);
    }
  );

  public createVisaMode = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createVisaMode },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createVisaMode(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public getAllVisaMode = this.asyncWrapper.wrap(null, async (req: Request, res: Response) => {
    const { code, ...data } = await this.service.getAllVisaMode(req);
    res.status(code).json(data);
  });

  public deleteVisaMode = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteVisaMode(req);
      res.status(code).json(data);
    }
  );
}
