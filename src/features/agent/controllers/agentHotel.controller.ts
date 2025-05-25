import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AgentHotelService } from '../services/agentHotel.service';
import AgentHotelValidator from '../utils/validators/agentHotel.validator';

export default class AgentHotelController extends AbstractController {
  private service = new AgentHotelService();
  private validator = new AgentHotelValidator();
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
      res.status(code).json(rest);
    }
  );
}
