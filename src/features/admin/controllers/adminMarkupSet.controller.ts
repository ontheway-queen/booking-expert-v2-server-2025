import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminMarkupSetService } from '../services/adminMarkupSet.service';
import AdminMarkupSetValidator from '../utils/validators/adminMarkupSet.validator';

export default class AdminMarkupSetController extends AbstractController {
  private validator = new AdminMarkupSetValidator();
  private service = new AdminMarkupSetService();
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

  public createFlightMarkupSet = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createMarkupSetSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createFlightMarkupSet(req);
      res.status(code).json(data);
    }
  );

  public getSingleFlightMarkupSet = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleFlightMarkupSet(
        req
      );
      res.status(code).json(data);
    }
  );

  public updateFlightMarkupSet = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.updateCommissionSetSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateFlightMarkupSet(req);
      res.status(code).json(data);
    }
  );

  public getMarkupSetFlightApiDetails = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.multipleParamsNumValidator([
        'set_id',
        'set_api_id',
      ]),
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getMarkupSetFlightApiDetails(
        req
      );
      res.status(code).json(data);
    }
  );

  public updateMarkupSetFlightApi = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.multipleParamsNumValidator([
        'set_id',
        'set_api_id',
      ]),
      bodySchema: this.validator.updateFlightMarkupsSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateMarkupSetFlightApi(
        req
      );
      res.status(code).json(data);
    }
  );

  public getAllFlightApi = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllFlightApi(req);
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
