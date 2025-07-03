import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminHotelMarkupSetService } from '../services/adminHotelMarkupSet.service';
import AdminHotelMarkupSetValidator from '../utils/validators/adminHotelMarkupSet.validator';

export default class AdminHotelMarkupSetController extends AbstractController {
  private validator = new AdminHotelMarkupSetValidator();
  private service = new AdminHotelMarkupSetService();
  constructor() {
    super();
  }
  public getMarkupSet = this.asyncWrapper.wrap(
    { querySchema: this.validator.getMarkupSetSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getMarkupSet(req);
      res.status(code).json(data);
    }
  );

  public deleteMarkupSet = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteMarkupSet(req);
      res.status(code).json(data);
    }
  );

  public createHotelMarkupSet = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createHotelMarkup },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createHotelMarkupSet(req);
      res.status(code).json(data);
    }
  );

  public updateHotelMarkupSet = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateHotelMarkup,
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateHotelMarkupSet(req);
      res.status(code).json(data);
    }
  );

  public getSingleHotelMarkup = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleHotelMarkupSet(req);
      res.status(code).json(data);
    }
  );
}
