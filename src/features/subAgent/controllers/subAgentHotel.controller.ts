import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { SubAgentHotelService } from '../services/subAgentHotel.service';
import SubAgentHotelValidator from '../utils/validator/subAgentHotel.validator';

export default class SubAgentHotelController extends AbstractController {
  private service = new SubAgentHotelService();
  private validator = new SubAgentHotelValidator();
  constructor() {
    super();
  }

  public hotelSearch = this.asyncWrapper.wrap(
    { bodySchema: this.validator.searchValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.hotelSearch(req);
      res.status(code).json(rest);
    }
  );

  public hotelSearchHistory = this.asyncWrapper.wrap(
    { bodySchema: this.validator.getHotelSearchHistoryValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.hotelSearchHistory(req);
      res.status(code).json(rest);
    }
  );

  public hotelRooms = this.asyncWrapper.wrap(
    { bodySchema: this.validator.getHotelRoomsValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getHotelRooms(req);
      res.status(code).json(rest);
    }
  );

  public hotelRoomRecheck = this.asyncWrapper.wrap(
    { bodySchema: this.validator.hotelRoomRecheck },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.hotelRoomRecheck(req);
      res.status(code).json(rest);
    }
  );

  public hotelBooking = this.asyncWrapper.wrap(
    { bodySchema: this.validator.hotelBooking },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.hotelBooking(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  public getHotelBooking = this.asyncWrapper.wrap(
    { querySchema: this.validator.getHotelBooking },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getHotelBooking(req);

      res.status(code).json(rest);
    }
  );

  public getSingleHotelBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleBooking(req);

      res.status(code).json(rest);
    }
  );
}
