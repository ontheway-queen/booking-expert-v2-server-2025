import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminConfigService } from '../services/adminConfig.service';
import AdminConfigValidator from '../utils/validators/adminConfig.validator';

export default class AdminConfigController extends AbstractController {
  private validator = new AdminConfigValidator();
  private service = new AdminConfigService();
  constructor() {
    super();
  }

  public checkSlug = this.asyncWrapper.wrap(
    { querySchema: this.validator.checkSlugSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.checkSlug(req);
      res.status(code).json(data);
    }
  );

  public createCity = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createCity },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createCity(req);
      res.status(code).json(data);
    }
  );

  public getAllCity = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllCity },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllCity(req);
      res.status(code).json(data);
    }
  );

  public updateCity = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateCity,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateCity(req);
      res.status(code).json(data);
    }
  );

  public deleteCity = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteCity(req);
      res.status(code).json(data);
    }
  );

  public getAllAirport = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllAirport },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAirport(req);
      res.status(code).json(data);
    }
  );

  public createAirport = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createAirportSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAirport(req);
      res.status(code).json(data);
    }
  );

  public updateAirport = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateAirportSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAirport(req);
      res.status(code).json(data);
    }
  );

  public deleteAirport = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteAirport(req);
      res.status(code).json(data);
    }
  );
  public getAllAirlines = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllAirlines },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAirlines(req);
      res.status(code).json(data);
    }
  );

  public createAirlines = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createAirlines },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAirlines(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public updateAirlines = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateAirlines,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAirlines(req);
      if (data.success) {
        res.status(code).json(data);
      } else {
        this.error(data.message, code);
      }
    }
  );

  public deleteAirlines = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteAirlines(req);
      res.status(code).json(data);
    }
  );

  public getB2CMarkupSet = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getB2CMarkupSet(req);
      res.status(code).json(data);
    }
  );

  public updateB2CMarkupSet = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateB2CMarkupSet },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateB2CMarkupConfig(req);
      res.status(code).json(data);
    }
  );
}
