import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import PublicCommonService from '../services/publicCommon.service';

export default class PublicCommonController extends AbstractController {
  private service = new PublicCommonService();
  constructor() {
    super();
  }

  public getCountry = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.getCountry },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAllCountry(req);
      res.status(code).json(rest);
    }
  );

  public getCity = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.getCity },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAllCity(req);
      res.status(code).json(rest);
    }
  );

  public getAirlines = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.getAirlinesSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAllAirlines(req);
      res.status(code).json(rest);
    }
  );

  public getAirport = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.getAirportSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAllAirport(req);
      res.status(code).json(rest);
    }
  );

  public getLocationHotel = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.getLocationHotelSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getLocationHotel(req);
      res.status(code).json(rest);
    }
  );

  public getBank = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.getBanks },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getBank(req);
      res.status(code).json(rest);
    }
  );

  public getVisaType = this.asyncWrapper.wrap(null, async (req: Request, res: Response) => {
    const { code, ...rest } = await this.service.getVisaType(req);
    res.status(code).json(rest);
  });
}
